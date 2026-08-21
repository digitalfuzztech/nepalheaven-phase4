import { createServerFn } from "@tanstack/react-start";
import {
  crmCustomerBlockSchema,
  crmCustomerIdSchema,
  crmCustomerQuerySchema,
  crmCustomerUpdateSchema,
  crmLeadMutationSchema,
  crmLeadQuerySchema,
  crmLeadVisibilityMutationSchema,
} from "@/lib/crm.schema";

export const getCrmCustomersFn = createServerFn({ method: "GET" })
  .validator(crmCustomerQuerySchema)
  .handler(async ({ data }) => {
    const { getCrmCustomers } = await import("@/lib/crm.server");
    return getCrmCustomers(data);
  });

export const getCrmLeadsFn = createServerFn({ method: "GET" })
  .validator(crmLeadQuerySchema)
  .handler(async ({ data }) => {
    const { getCrmLeads } = await import("@/lib/crm.server");
    return getCrmLeads(data);
  });

export const getCrmCustomerFn = createServerFn({ method: "GET" })
  .validator(crmCustomerIdSchema)
  .handler(async ({ data }) => {
    const { getCrmCustomer } = await import("@/lib/crm.server");
    return getCrmCustomer(data.id);
  });

export const updateCrmCustomerFn = createServerFn({ method: "POST" })
  .validator(crmCustomerUpdateSchema)
  .handler(async ({ data }) => {
    const { updateCrmCustomer } = await import("@/lib/crm.server");
    return updateCrmCustomer(data);
  });

export const setCrmCustomerBlockedFn = createServerFn({ method: "POST" })
  .validator(crmCustomerBlockSchema)
  .handler(async ({ data }) => {
    const { setCrmCustomerBlocked } = await import("@/lib/crm.server");
    return setCrmCustomerBlocked(data);
  });

export const deleteCrmCustomerFn = createServerFn({ method: "POST" })
  .validator(crmCustomerIdSchema)
  .handler(async ({ data }) => {
    const { deleteCrmCustomer } = await import("@/lib/crm.server");
    return deleteCrmCustomer(data.id);
  });

export const setCrmLeadHiddenFn = createServerFn({ method: "POST" })
  .validator(crmLeadVisibilityMutationSchema)
  .handler(async ({ data }) => {
    const { setCrmLeadHidden } = await import("@/lib/crm.server");
    return setCrmLeadHidden(data);
  });

export const deleteCrmLeadFn = createServerFn({ method: "POST" })
  .validator(crmLeadMutationSchema)
  .handler(async ({ data }) => {
    const { deleteCrmLead } = await import("@/lib/crm.server");
    return deleteCrmLead(data);
  });
