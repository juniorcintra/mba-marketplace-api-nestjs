import { InMemorySellersRepository } from "test/repositories/in-memory-sellers-repository";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { FakeEncrypter } from "test/cryptography/fake-encrypter";
import { AuthenticateSellerUseCase } from "./authenticate-seller";
import { makeSeller } from "test/factories/make-seller";
import { WrongCredentialsError } from "./errors/wrong-credentials-error";
import { InMemoryUserAttachmentsRepository } from "test/repositories/in-memory-user-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemorySellersRepository: InMemorySellersRepository;
let fakeHasher: FakeHasher;
let encrypter: FakeEncrypter;

let sut: AuthenticateSellerUseCase;

describe("Authenticate Seller", () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    );
    fakeHasher = new FakeHasher();
    encrypter = new FakeEncrypter();

    sut = new AuthenticateSellerUseCase(
      inMemorySellersRepository,
      fakeHasher,
      encrypter,
    );
  });

  it("should be able to authenticate a seller", async () => {
    const seller = makeSeller({
      email: "johndoe@example.com",
      password: await fakeHasher.hash("123456"),
    });

    inMemorySellersRepository.items.push(seller);

    const result = await sut.execute({
      email: "johndoe@example.com",
      password: "123456",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    });
  });

  it("should not be able to authenticate a seller with wrong email", async () => {
    const seller = makeSeller({
      email: "johndoe@example.com",
      password: await fakeHasher.hash("123456"),
    });

    inMemorySellersRepository.items.push(seller);

    const result = await sut.execute({
      email: "wrong@email.com",
      password: "123456",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });

  it("should not be able to authenticate a seller with wrong password", async () => {
    const seller = makeSeller({
      email: "johndoe@example.com",
      password: await fakeHasher.hash("123456"),
    });

    inMemorySellersRepository.items.push(seller);

    const result = await sut.execute({
      email: "johndoe@example.com",
      password: "123",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });
});
