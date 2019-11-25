import * as k8s from "@pulumi/kubernetes";
import {
    DATABASE_HOSTNAME,
    DATABASE_NAME,
    DATABASE_PASSWORD,
    DATABASE_USERNAME,
    HASURA_ADMIN_SECRET,
    HASURA_DEPLOYMENT_NAME,
    HASURA_ENDPOINT,
    HASURA_INGRESS_NAME,
    HASURA_SERVICE_NAME,
    HASURA_TLS_SECRET
} from "../constants";
import {Service} from "@pulumi/kubernetes/core/v1";
import {interpolate} from "@pulumi/pulumi";
import {Chart} from "@pulumi/kubernetes/helm/v2";
import {Chui} from "@chuistack/chui-lib";

const {Ingress} = Chui.App;


/**
 * Configure the k8s deployment from here:
 *
 * https://docs.hasura.io/1.0/graphql/manual/deployment/kubernetes/index.html
 */
const configureDeployment = (database: Chart) => {
    return new k8s.apps.v1.Deployment(
        HASURA_DEPLOYMENT_NAME,
        {
            "metadata": {
                "labels": {
                    "app": "hasura",
                    "hasuraService": "custom"
                },
                "name": HASURA_DEPLOYMENT_NAME,
                "namespace": "default"
            },
            "spec": {
                "replicas": 1,
                "selector": {
                    "matchLabels": {
                        "app": "hasura"
                    }
                },
                "template": {
                    "metadata": {
                        "labels": {
                            "app": "hasura"
                        }
                    },
                    "spec": {
                        "containers": [
                            {
                                "image": "hasura/graphql-engine:v1.0.0-beta.6",
                                "imagePullPolicy": "IfNotPresent",
                                "name": "hasura",
                                "env": [
                                    {
                                        "name": "HASURA_GRAPHQL_DATABASE_URL",
                                        // "value": "postgres://username:password@hostname:port/dbname"
                                        "value": interpolate`postgres://${
                                            DATABASE_USERNAME
                                        }:${
                                            DATABASE_PASSWORD
                                        }@${
                                            DATABASE_HOSTNAME
                                        }:5432/${
                                            DATABASE_NAME
                                        }`
                                    },
                                    {
                                        "name": "HASURA_GRAPHQL_ENABLE_CONSOLE",
                                        "value": "true"
                                    },
                                    {
                                        "name": "HASURA_GRAPHQL_ADMIN_SECRET",
                                        "value": HASURA_ADMIN_SECRET,
                                    }
                                ],
                                "ports": [
                                    {
                                        "containerPort": 8080,
                                        "protocol": "TCP"
                                    }
                                ],
                                "resources": {}
                            }
                        ]
                    }
                }
            }
        },
        {
            dependsOn: [database]
        }
    );
};


/**
 * Configure the k8s service from here:
 *
 * https://docs.hasura.io/1.0/graphql/manual/deployment/kubernetes/index.html
 */
const configureService = () => {
    return new k8s.core.v1.Service(
        HASURA_SERVICE_NAME,
        {
            "metadata": {
                "labels": {
                    "app": "hasura"
                },
                "name": HASURA_SERVICE_NAME,
                "namespace": "default"
            },
            "spec": {
                "ports": [
                    {
                        "protocol": "TCP",
                        "port": 80,
                        "targetPort": 8080
                    }
                ],
                "selector": {
                    "app": "hasura"
                },
            }
        }
    );
};


/**
 * Configure an ingress so we can get started with our API through an encrypted endpoint.
 *
 * @param service
 */
const configureIngress = (service: Service) => {
    return new k8s.extensions.v1beta1.Ingress(
        HASURA_INGRESS_NAME,
        {
            "metadata": {
                "name": HASURA_INGRESS_NAME,
                "namespace": "default",
                "annotations": {
                    ...Ingress.getIngressClassAnnotation(),
                    ...(
                        Chui.Environment.getEnv() === "production" ?
                            Ingress.getProductionClusterIssuerAnnotation() :
                            Ingress.getStagingClusterIssuerAnnotation()
                    ),
                }
            },
            "spec": {
                "tls": [
                    {
                        "hosts": [
                            HASURA_ENDPOINT
                        ],
                        "secretName": HASURA_TLS_SECRET,
                    }
                ],
                "rules": [
                    {
                        "host": HASURA_ENDPOINT,
                        "http": {
                            "paths": [
                                {
                                    "path": "/",
                                    "backend": {
                                        "serviceName": service.metadata.name,
                                        "servicePort": 80
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    );
};


/**
 * Install a Hasura-based graphql endpoint for our database.
 */
export const install = (database: Chart) => {
    const deployment = configureDeployment(database);
    const service = configureService();
    const ingress = configureIngress(service);

    return {
        deployment,
        service,
        ingress,
    };
};