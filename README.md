# CAS Initializr

CAS Initializr provides a build system and an API to dynamically generate 
CAS overlays. The project is based on [Spring Initializr](https://github.com/spring-io/initializr).

This service is available at: https://getcas.apereo.org/ui

## Build

You will need JDK 17 to run the CAS Initializr locally.

```bash
./gradlew clean build
```                  

Generate a Docker image from the build:

```bash
./gradlew bootBuildImage
```

## Run

CAS Initializr is a Spring Boot application and can be run locally using the following command:

```bash
./gradlew bootRun
```

Or run the Docker image:

```bash  
imageTag=(`./gradlew initializrVersion --q`) && docker run --rm -p 8080:8080 -t apereo/cas-initializr:$imageTag 
```

The service will be available on `http://localhost:8080`.

## User Interface

CAS Initializr also presents a user interface, available at `$INITIALIZR_URL/ui`.

## Dependency Metadata & Ownership

The metadata lists the capabilities of the CAS Initializr, that is the available options for all request parameters 
(dependencies, type, bootVersion, etc.) The CAS Initializr user interface uses that information to initialize the select options and the tree of available dependencies.

You can grab the metadata on the root endpoint with the appropriate Accept header:

```bash
curl -H 'Accept: application/json' $INITIALIZR_URL
```     

CAS Initializr fetches and consumes module and dependency metadata from an *internal* source or database, owned by the CAS project. 
This source is managed and controlled by the CAS project itself where dependency metadata and list of feature modules are curated, enriched 
and then published. Remember that CAS Initializr does its work in service to the CAS project itself; it has no other customer or 
client, is not designed as a general-purpose library or service and does not strictly-speaking serve any other use case. This means that 
if you intend to run the project locally for your own purposes or in any other way that does not align with the current deployment parameters, 
you will need to teach your CAS Initializr instance about your modules and dependencies and own that task going forward. 

This can be done in the `application.yml` file:

```yaml
dependencies:
  - name: api
    content:
      - name: cas-server-core
        id: core
        groupId: org.apereo.cas
        artifactId: cas-server-core
        description: My CAS Module
        bom: cas-bom
        aliases:
          - core
```

You may also need to *blank out* `cas-initializr.metadata-url` setting to prevent the initializr from reaching out to its own source. Other changes may also be necessary.

Remember that this data structure, schema as well as other internal APIs that publish, parse and manage this data could change at any time without notice. 
CAS Initializr works for the CAS project and intends to be configured and deployed in a way that ultimately serves that exact purpose. No more, no less. Additional
configuration options, features and flexibility that sit outside that use case are almost always not a concern and do not deserve any maintenance time or effort. If the current feature-set or configuration profile does not fit your use cases, the best course of action would be to fork the project to make any and all necessary changes for your deployment.

## Generating a project

- Generate a vanilla CAS overlay:

```bash
curl $INITIALIZR_URL/starter.zip -o cas.zip
```

- Generate a CAS overlay package as a compressed tarball that contains indicated modules/dependencies selected by their identifier:

```bash
curl $INITIALIZR_URL/starter.tgz \
  -d dependencies=oidc | tar -xzvf -
```

- Generate a CAS overlay for a specific version:

Must specify the appropriate spring boot version for the specified casVersion.

```bash
curl $INITIALIZR_URL/starter.tgz \
  -d "dependencies=oidc&casVersion=6.6.5&bootVersion=2.7.3" | tar  -xzvf -
```

- Generate overlay projects for other CAS related applications:

```bash
curl $INITIALIZR_URL/starter.tgz \
  -d "type=..." | tar  -xzvf -
```

Type can be one of:
  - `cas-overlay` (default)
  - `cas-config-server-overlay`

- Generate a CAS Overlay using latest cas-initializr deployed on heroku.com:

```bash
curl $INITIALIZR_URL/starter.tgz \
  -d "dependencies=oidc,jsonsvc" | tar  -xzvf -
```

## Dependency List

Dependencies that can be requested must be specified by their identifier. To see a full list of
all dependencies supported and available by this service, you can invoke the following command:

```bash
curl $INITIALIZR_URL/dependencies
```

Typically, dependency identifiers match CAS dependency/module artifact names without the `cas-server-` prefix.

To see the CAS versions and projects are that supported by the CAS Initializr, you may invoke the following command:

```bash
curl $INITIALIZR_URL/actuator/supportedVersions
```

You may also see a full list of dependencies and their aliases as well as supported versions via:

```bash
curl $INITIALIZR_URL/actuator/info
```
