const baseUrlWithoutProtocol =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_BRANCH_URL;

const baseUrl = baseUrlWithoutProtocol
  ? `https://${baseUrlWithoutProtocol}`
  : "http://localhost:3000";

const config = {
  backendUrl:
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000/store",
  baseUrl,
  sanity: {
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "qau35ymi",
    revalidateSecret: process.env.SANITY_REVALIDATE_SECRET || "",
    studioUrl: "/cms",
    // Not exposed to the front-end, used solely by the server
    token: process.env.SANITY_API_TOKEN || "skTkPUQYGUbr3XRIBu5KtkXXY8OcGVRHB9aBHqz7krXH1THu6XzbX9mRK7pgd4uLq2KDb9g0HVPSiTlUYzsEx3MtM5DguLSUbDBrWl7ulhfZMNEAn8Cmimxi30AOZ2pjdIXsGO6vYw52NNbN5mpjk8F8NEIZbuxHF9CAscVzQv8cNZ7zquoC",
  },
  defaultCountryCode: "vn",
  siteName: "Bếp nhà Sun",
};

export default config;
