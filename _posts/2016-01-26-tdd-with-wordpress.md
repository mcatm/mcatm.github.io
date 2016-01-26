---
layout: post
title: WordpressでTDDを実践するための試行錯誤
permalink: /post/tdd-with-wordpress/
tags: [php, tdd, wordpress]
---

## インストール

https://phpunit.de/manual/current/ja/installation.html

```bash
$ brew install wget
$ wget https://phar.phpunit.de/phpunit.phar
$ chmod +x phpunit.phar
$ sudo mv phpunit.phar /usr/local/bin/phpunit
```