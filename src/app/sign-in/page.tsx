import { AccountForm } from "../../components/account-form";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
            couch-splitter
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Sign in to your account
          </h1>
          <p className="text-base text-zinc-700">
            Enter your email address and password to return to your groups and expenses.
          </p>
        </div>
        <AccountForm mode="sign-in" />
        <p className="text-center text-sm text-zinc-700">
          New to couch-splitter? <a className="font-semibold text-blue-800 underline" href="/sign-up">Create an account</a>.
        </p>
      </div>
    </main>
  );
}
