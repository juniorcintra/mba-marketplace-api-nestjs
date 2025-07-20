import { Controller, HttpCode, Post, Res } from "@nestjs/common";
import { Response } from "express";

@Controller("/sign-out")
export class SignOutController {
  @Post()
  @HttpCode(200)
  async handle(@Res() response: Response) {
    response.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return response.send();
  }
}
