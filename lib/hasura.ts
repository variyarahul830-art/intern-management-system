import {
  DocumentNode,
  OperationVariables,
} from "@apollo/client/core";
import { createAdminApolloClient } from "./apolloClient";

export function getHasuraHeaders(session: any) {
  return {
    Authorization: `Bearer ${session?.accessToken || ""}`,
    "x-hasura-role": session?.role || session?.user?.role || "user",
  };
}

async function getHasuraClient() {
  // Always use admin secret for server-side queries.
  // Hasura has no JWT secret configured, so JWT tokens are not verified.
  // Authorization is handled at the Next.js API route layer via session checks.
  return createAdminApolloClient();
}

export async function hasuraCall<T>(
  operation: "query" | "mutation",
  document: DocumentNode,
  variables?: OperationVariables
) {
  const client = await getHasuraClient();

  if (operation === "mutation") {
    const result = await client.mutate<T>({
      mutation: document,
      variables,
      fetchPolicy: "no-cache",
    });

    if (!result.data) {
      throw new Error("No data returned from Hasura mutation");
    }

    return result.data;
  }

  const result = await client.query<T>({
    query: document,
    variables,
    fetchPolicy: "no-cache",
  });

  if (!result.data) {
    throw new Error("No data returned from Hasura query");
  }

  return result.data;
}

export async function hasuraQuery<T>(
  query: DocumentNode,
  variables?: OperationVariables
) {
  return hasuraCall<T>("query", query, variables);
}

export async function hasuraMutation<T>(
  mutation: DocumentNode,
  variables?: OperationVariables
) {
  return hasuraCall<T>("mutation", mutation, variables);
}
