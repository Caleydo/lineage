lineage [![Phovea][phovea-image]][phovea-url] [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
=====================

Lineage is a genalogy visualization tool developed at the University of Utah. 

See also the [lineage_server](https://github.com/Caleydo/lineage_server) and the [lineage_product](https://github.com/Caleydo/lineage_product/) repositories.


## Installation

Preconditions:
 * Have [git/ssh](https://help.github.com/articles/signing-commits-with-gpg/) set up.
 * Have [Yeoman](http://yeoman.io/) installed.
 * Have [Docker](https://www.docker.com/) installed and running.

### Install with all dependencies

```bash
yo phovea:setup-workspace lineage_product
```
Next install and run the server via docker:
```bash
cd lineage
docker-compose up -d
```
Finally, in a separate console, run the client:
```bash
npm run start:lineage
```

### Single Plugin, no dependencies

```bash
git clone https://github.com/Caleydo/lineage.git
cd lineage
npm install
```

Testing
-------

```
npm test
```

Building
--------

```
npm run build
```



***

<a href="https://caleydo.org"><img src="http://caleydo.org/assets/images/logos/caleydo.svg" align="left" width="200px" hspace="10" vspace="6"></a>
This repository is part of **[Phovea](http://phovea.caleydo.org/)**, a platform for developing web-based visualization applications. For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](http://phovea.caleydo.org).


[phovea-image]: https://img.shields.io/badge/Phovea-Application-1BA64E.svg
[phovea-url]: https://phovea.caleydo.org
[npm-image]: https://badge.fury.io/js/lineage.svg
[npm-url]: https://npmjs.org/package/lineage
[travis-image]: https://travis-ci.org/Caleydo/lineage.svg?branch=master
[travis-url]: https://travis-ci.org/Caleydo/lineage
[daviddm-image]: https://david-dm.org/Caleydo/lineage/status.svg
[daviddm-url]: https://david-dm.org/Caleydo/lineage
