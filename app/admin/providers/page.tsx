import { getProvidersStats } from "./actions";
import ProvidersClientPage from "./ProvidersClientPage";

export default async function ProvidersPage() {
    const initialData = await getProvidersStats();

    return (
        <ProvidersClientPage initialData={initialData} />
    );
}
