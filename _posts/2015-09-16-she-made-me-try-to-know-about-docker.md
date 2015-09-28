---
layout: post
title: Dockerについて調べなければいけない雰囲気になってる話
permalink: /post/she-made-me-try-to-know-about-docker/
tags: [infrastructure, docker]
---

隣の席のY嬢が、「私がDockerやったら、びっくりしますか？」って突然言ってきたので、「ああ、びっくりする」と返したら、Apacheだけ立ちあげて、「後はどうぞ」みたいな雰囲気を漂わせてきたので、むしろそっちの方がびっくりした。

**…調べなきゃダメなんすかね…？**

元々、Vagrantを使った開発環境を構築していたんだが、それが重いとのことでDockerに目をつけたのだそう。エンジニアは、**「面倒くさい事を避けるために、面倒くさいことをするべき」**であるから、志たるやよし！と思ったので、Dockerについて調べてみることにする。（しかしVagrantが重いのではなく、provisionで走るChefが重い、そしてその重さにはわけがある…やつじゃないかなと思った。つまりDockerにしても変わらん、と）

## Dockerとは？

<img src="/i/docker.png" alt="このタコ、何？">

> Docker（ドッカー）はソフトウェアコンテナ内のアプリケーションのデプロイメントを自動化するオープンソースソフトウェアである。

とWikipediaが言うように、「OS仮想化ソフトウェア」というわけではなく（要するにVagrantの代替というわけではない）、「デプロイメント自動化ツール」なんですね。ただ、今の用途は完全に仮想OSですので、そのつもりで挑みます。「ドック作業員（Docker）」ってだけあって、随分海推しですね。

## インストール（OS X）

Docker Toolboxをインストールします。

[Docker Toolbox | docker](https://www.docker.com/toolbox)

## 設定