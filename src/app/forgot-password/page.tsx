export default function ForgotPasswordPage() {
  return (
    <form action="/api/auth/forgot-password" method="post" className="flex flex-col gap-2">
      <input type="email" name="email" placeholder="Email" className="border p-2" />
      <button type="submit" className="bg-blue-500 text-white p-2">Send reset link</button>
    </form>
  );
}
