import {Config, getStack, StackReference} from "@pulumi/pulumi";
import {Chui} from "@chuistack/chui-lib";


const config = new Config();
const chui = Chui.Config.loadCurrentConfig();
const appName = Chui.Config.getCurrentAppName();


/***********************
 * DATABASE            *
 ***********************/

export const DATABASE_RELEASE_NAME = `${chui.globalAppName}-db-main`;
export const DATABASE_USERNAME = config.requireSecret("dbUsername");
export const DATABASE_PASSWORD = config.requireSecret("dbPassword");
export const DATABASE_NAME = config.requireSecret("dbName");
export const DATABASE_HOSTNAME = Chui.Resource.getHostnameForServiceName(`${DATABASE_RELEASE_NAME}-postgresql`);


/***********************
 * GRAPHQL API         *
 ***********************/

const HASURA_API = "graphql-api";
export const HASURA_ADMIN_SECRET = config.requireSecret("hasuraAdminSecret");
export const HASURA_DEPLOYMENT_NAME = Chui.Resource.buildObjectName(chui.globalAppName, HASURA_API, "deployment");
export const HASURA_SERVICE_NAME = Chui.Resource.buildObjectName(chui.globalAppName, HASURA_API, "service");
export const HASURA_INGRESS_NAME = Chui.Resource.buildObjectName(chui.globalAppName, HASURA_API, "ingress");
export const HASURA_ENDPOINT = config.get('hasuraEndpoint') ||
    Chui.Resource.buildEndpoint(chui.rootDomain, appName);
export const HASURA_TLS_SECRET = Chui.Resource.buildObjectName(chui.globalAppName, HASURA_API, "tls-secret");
