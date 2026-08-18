import { requireAdmin } from "@/app/lib/admin-api";
import { listUsers } from "@/app/lib/admin-data";
import { formatDateTime } from "@/app/lib/format";
import { FlashMessage } from "@/components/admin/FlashMessage";
import { Pagination } from "@/components/admin/Pagination";
import { RoleToggle } from "@/components/admin/RoleToggle";
import { SearchInput } from "@/components/admin/SearchInput";
import {
  Card,
  EmptyState,
  ErrorPanel,
  Num,
  PageHeader,
  TableWrap,
  Td,
  Th,
} from "@/components/admin/ui";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({
  searchParams,
}: PageProps<"/admin/users">) {
  const params = await searchParams;

  const page = Number(params.page ?? 0) || 0;
  const search = typeof params.search === "string" ? params.search : undefined;

  // The layout already ran this; calling it again is how the page learns which
  // row is the signed-in operator, and it is memoised per request by the cookie
  // read underneath.
  const [claims, result] = await Promise.all([
    requireAdmin(),
    listUsers({ page, size: PAGE_SIZE, search }),
  ]);

  return (
    <>
      <PageHeader
        title="Users"
        description="Who can sign in, and who can reach this console. Passwords are never readable here — the backend stores bcrypt hashes and exposes no way to read them back."
      />

      <FlashMessage />

      {!result.ok ? (
        <ErrorPanel
          message={result.message}
          hint="Users are served by auth-service through the gateway."
        />
      ) : (
        <Card
          padded={false}
          title="All users"
          actions={<SearchInput placeholder="Search name or email…" />}
        >
          {result.data.items.length === 0 ? (
            <EmptyState
              icon="👤"
              title="No users match"
              description="Try a different name or email."
            />
          ) : (
            <>
              <TableWrap>
                <thead>
                  <tr>
                    <Th>User</Th>
                    <Th>Role</Th>
                    <Th>Sign-in</Th>
                    <Th>Joined</Th>
                    <Th align="right" />
                  </tr>
                </thead>
                <tbody>
                  {result.data.items.map((user) => {
                    const isSelf = user.id === claims.sub;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <Td>
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                user.role === "ADMIN"
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                              aria-hidden="true"
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {user.name}
                                {isSelf && (
                                  <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                                    you
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </Td>

                        <Td>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                              user.role === "ADMIN"
                                ? "bg-slate-900 text-white ring-slate-900"
                                : "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {user.role}
                          </span>
                        </Td>

                        <Td>
                          <span className="text-xs text-slate-600">
                            {user.provider === "GOOGLE"
                              ? "Google"
                              : "Email + password"}
                          </span>
                        </Td>

                        <Td>
                          <span className="whitespace-nowrap text-xs text-slate-500">
                            {formatDateTime(user.createdAt)}
                          </span>
                        </Td>

                        <Td align="right">
                          <RoleToggle user={user} isSelf={isSelf} />
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>

              <Pagination
                page={result.data.page}
                totalPages={result.data.totalPages}
                total={result.data.total}
                size={result.data.size}
              />
            </>
          )}
        </Card>
      )}

      <p className="mt-4 text-xs text-slate-500">
        <Num className="text-slate-400">Note</Num> — role changes take effect
        for the target user only when their current session token expires,
        because the role is carried as a JWT claim rather than looked up on every
        request. That is the trade that lets catalog-service and order-service
        authorise an admin without calling back to auth-service.
      </p>
    </>
  );
}
