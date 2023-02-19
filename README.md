# CAS Initializr

CAS Initializr provides a build system and an API to dynamically generate 
CAS overlays. The project is based on [Spring Initializr](https://github.com/spring-io/initializr).

## Build

You will need JDK 11 to run the CAS Initializr locally.

```bash
./gradlew clean build
```                  

Generate a Docker image from the build:

```bash
./gradlew bootBuildImage
```

## Run

CAS Initializr is a Spring Boot application and can be run using the following command:

```bash
./gradlew :app:bootRun
```

Or run the Docker image:

```bash  
imageTag=(`./gradlew initializrVersion --q`) && docker run --rm -p 8080:8080 -t apereo/cas-initializr:$imageTag 
```

The service will be available on `http://localhost:8080`.

## User Interface

CAS Initializr also presents a user interface, available at `http://localhost:8080/ui`.

## Generating a project

#### Generate a vanilla CAS overlay:

```bash
curl http://localhost:8080/starter.zip -o cas.zip
```

#### Generate a CAS overlay package as a compressed tarball that contains indicated modules/dependencies selected by their identifier:

```bash
curl http://localhost:8080/starter.tgz -d dependencies=oidc | tar -xzvf -
```

#### Generate a CAS overlay for a specific version:

Must specify the appropriate spring boot version for the specified casVersion.

```bash
curl http://localhost:8080/starter.tgz -d "dependencies=oidc&casVersion=6.3.3&bootVersion=2.3.7.RELEASE" | tar  -xzvf -
```

#### Generate overlay projects for other CAS related applications:

```bash
curl http://localhost:8080/starter.tgz -d "type=cas-management-overlay" | tar  -xzvf -
```
Type can be one of:
  - `cas-overlay` (default)
  - `cas-bootadmin-server-overlay` 
  - `cas-config-server-overlay`
  - `cas-discovery-server-overlay`
  - `cas-management-overlay`

#### Generate a CAS Overlay using latest cas-initializr deployed on heroku.com:

```bash
curl https://casinit.herokuapp.com/starter.tgz -d "dependencies=oidc,jsonsvc" | tar  -xzvf -
```

## Dependency List

Dependencies that can be requested must be specified by their identifier. To see a full list of
all dependencies supported and available by this service, you can invoke the following command:

```bash
curl http://localhost:8080/dependencies
```

Typically, dependency identifiers match CAS dependency/module artifact names without the `cas-server-` prefix.

To see the CAS versions and projects are that supported by the CAS Initializr, you may invoke the following command:

```bash
curl http://localhost:8080/actuator/supportedVersions
```

You may also see a full list of dependencies and their aliases as well as supported versions via:

```bash
curl http://localhost:8080/actuator/info
```

## Service metadata

The metadata lists the capabilities of the service, 
that is the available options for all request parameters 
(dependencies, type, bootVersion, etc.) A client to the service 
uses that information to initialize the select options and the tree of available dependencies.

You can grab the metadata on the root endpoint with the appropriate Accept header:

```bash
curl -H 'Accept: application/json' http://localhost:8080
```     

Or using `HTTPie`:

```bash
http http://localhost:8080 Accept:application/json
```
