import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ tên chỉ được tối đa 100 ký tự.")
    .regex(
      /^[a-zA-ZÀ-ỹĂăĐđÊêÎîÔôƠơƯư\s]+$/,
      "Tên không được chứa số hoặc ký tự đặc biệt!",
    ),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
