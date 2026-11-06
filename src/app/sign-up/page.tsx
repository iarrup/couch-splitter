import { AccountForm } from "../../components/account-form";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
            couch-splitter
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            Create your account
          </h1>
          <p className="text-base text-zinc-700">
            Keep your groups and expenses private. No email confirmation is needed.
          </p>
        </div>
        <AccountForm mode="sign-up" />
      </div>
    </main>
  );
}
