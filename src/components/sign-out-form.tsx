import { signOutAction } from "../app/actions/accounts";

export function SignOutForm() {
  return (
    <form action={signOutAction}>
      <button
        className="rounded-md bg-blue-800 px-5 py-3 font-semibold text-white hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
