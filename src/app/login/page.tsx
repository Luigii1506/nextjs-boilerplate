export default function LoginPage() {
  return (
    <div className="flex flex-col gap-4">
      <form action="/api/auth/signin" method="post" className="flex flex-col gap-2">
        <input type="email" name="email" placeholder="Email" className="border p-2" />
        <input type="password" name="password" placeholder="Password" className="border p-2" />
        <button type="submit" className="bg-blue-500 text-white p-2">Sign In</button>
      </form>
      <form action="/api/auth/google" method="post">
        <button type="submit" className="underline">Sign in with Google</button>
      </form>
      <a href="/forgot-password" className="underline">Forgot password?</a>
      <a href="/register" className="underline">Register</a>
    </div>
  );
}
