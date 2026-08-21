import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getCrmBookingDetailFn } from "@/lib/finance-crm.functions";
import { getAdminSessionFn } from "@/lib/auth.functions";
export const Route=createFileRoute("/admin_/crm/bookings_/$reference")({loader:async({params})=>{const reference=params.reference.trim().toUpperCase();if(!(await getAdminSessionFn()))throw redirect({to:"/admin",search:{redirect:`/admin/crm/bookings/${encodeURIComponent(reference)}`}});const result=await getCrmBookingDetailFn({data:{reference}});if(!result.ok)throw notFound();throw redirect({to:result.booking.status==="cancelled"?"/admin/crm/bookings/cancelled/$reference":"/admin/crm/bookings/confirmed/$reference",params:{reference}});},component:()=>null});
