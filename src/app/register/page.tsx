export default function RegisterPage() {
  return (
    <form action="/api/auth/signup" method="post" className="flex flex-col gap-2">
      <input type="text" name="name" placeholder="Name" className="border p-2" />
      <input type="email" name="email" placeholder="Email" className="border p-2" />
      <input type="password" name="password" placeholder="Password" className="border p-2" />
      <button type="submit" className="bg-blue-500 text-white p-2">Register</button>
    </form>
  );
}
