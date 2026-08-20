import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsPackagesList } from "@/components/admin/CmsPackagesList";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCmsPackagesFn } from "@/lib/cms-packages.functions";
export const Route=createFileRoute("/admin_/cms_/packages")({loader:async()=>{if(!await getAdminSessionFn())throw redirect({to:"/admin"});return{packages:await getCmsPackagesFn()};},component:Page});
function Page(){const{packages}=Route.useLoaderData();return <AdminShell><div className="p-5 sm:p-7 lg:p-8"><CmsPackagesList packages={packages}/></div></AdminShell>}
