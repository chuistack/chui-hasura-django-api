import * as database from "./database";
import * as graphqlApi from "./graphql-api";
import {HASURA_ENDPOINT} from "./constants";

const databaseOutput = database.install();
const graphqlApiOutput = graphqlApi.install(databaseOutput.database);

export const graphqlIp = graphqlApiOutput.ingress.status.loadBalancer.ingress[0].ip;
export const graphqlEndpoint = HASURA_ENDPOINT;
