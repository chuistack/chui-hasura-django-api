import * as k8s from "@pulumi/kubernetes";
import {DATABASE_NAME, DATABASE_PASSWORD, DATABASE_RELEASE_NAME, DATABASE_USERNAME} from "../constants";
import {interpolate} from "@pulumi/pulumi";


/**
 * Setup a simple postgres database.
 */
export const install = () => {
    const database = new k8s.helm.v2.Chart(
        DATABASE_RELEASE_NAME,
        {
            "repo": "stable",
            "chart": "postgresql",
            "version": "6.3.4",
            "values": {
                "postgresqlUsername": DATABASE_USERNAME,
                "postgresqlPassword": DATABASE_PASSWORD,
                "postgresqlDatabase": DATABASE_NAME,
                "initdbScripts": {
                    "init.sql": interpolate
                        `CREATE EXTENSION IF NOT EXISTS "pgcrypto" with SCHEMA ${DATABASE_NAME};`
                },
                "persistence": {
                    "size": "1Gi"
                },
                "replication": {
                    "enabled": false,
                },
                "resources": {
                    "requests": {
                        "memory": "192Mi",
                        "cpu": "90m"
                    }
                },
            },
        }
    );

    return {
        database,
    };
};