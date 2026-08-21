import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { BookingCrmDetail } from "@/components/admin/BookingCrmDetail";
import { getAdminSessionFn } from "@/lib/auth.functions";
import { getCrmBookingDetailFn } from "@/lib/finance-crm.functions";
export const Route=createFileRoute("/admin_/crm/bookings_/confirmed/$reference")({loader:async({params})=>{if(!(await getAdminSessionFn()))throw redirect({to:"/admin",search:{redirect:`/admin/crm/bookings/${params.reference}`}});const result=await getCrmBookingDetailFn({data:{reference:params.reference}});if(!result.ok||result.booking.status!=="confirmed")throw notFound();return result.booking;},component:()=> <BookingCrmDetail booking={Route.useLoaderData()}/>});
