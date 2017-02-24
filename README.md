Lineage [![Phovea][phovea-image]][phovea-url] [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
=====================

Lineage is a genalogy visualization tool developed at the [Visualization Design Lab](http://vdl.sci.utah.edu) at the University of Utah, with contributions from the [Gehlenborg Lab](http://gehlenborg.com/) at the Harvard Medical School. 

See also the [lineage_server](https://github.com/Caleydo/lineage_server) and the [lineage_product](https://github.com/Caleydo/lineage_product/) repositories.


## Installation

Preconditions:
 * Have a [GitHub](http://github.com) account.
 * Have [Yeoman](http://yeoman.io/) installed.
 * Have [Docker](https://www.docker.com/) installed and running.

### Install with all dependencies
The following command will create a `lineage` directory relative to the current one:

```bash
yo phovea:setup-workspace lineage_product
```
The first prompt will be: `SSH clone Yes/No`. No means HTTPS cloning, which is generally easier. If you prefer SSH have your GitHub SSH access set up.

Change into the new directory:

```bash
cd lineage
```

In this directory (`lineage`), you will have (at least) two subdirectories `lineage` which hosts the client code, and `lineage_server` which hosts the server code. 

Next install and run the server via docker:

```bash
docker-compose up -d
```

Finally, out of the same directory, run the client:

```bash
npm run start:lineage
```

## Version Control

Use 'git' in the subdirectories `lineage` and `lineage_server` to commit, push, pull, etc.

For pulls you can also use

```
./foreach git pull
```

## Updating Libraries

To update the dependencies, run: 

```
yo phovea:update
```


***

<a href="https://caleydo.org"><img src="http://caleydo.org/assets/images/logos/caleydo.svg" align="left" width="200px" hspace="10" vspace="6"></a>
This project is part of **[Caleydo](http://caleydo.org)** and used **[Phovea](http://phovea.caleydo.org/)**, a platform for developing web-based visualization applications developed by the Caleydo team. For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](http://phovea.caleydo.org).


[phovea-image]: https://img.shields.io/badge/Phovea-Application-1BA64E.svg
[phovea-url]: https://phovea.caleydo.org
[npm-image]: https://badge.fury.io/js/lineage.svg
[npm-url]: https://npmjs.org/package/lineage
[travis-image]: https://travis-ci.org/Caleydo/lineage.svg?branch=master
[travis-url]: https://travis-ci.org/Caleydo/lineage
[daviddm-image]: https://david-dm.org/Caleydo/lineage/status.svg
[daviddm-url]: https://david-dm.org/Caleydo/lineage
