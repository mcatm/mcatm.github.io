---
layout: post
title: Capistranoをいじってみる
permalink: /post/studying-capistrano/
tags: [capistrano]
---

### インストール

Rubyが入っていたら、`gem install capistrano`でOK。

`$ cap --help`が叩ければ、問題なくインストールされています。

### 初期化

Capistranoの実行環境で、`$ cap install`します。

```
new file:   Capfile
new file:   config/deploy.rb
new file:   config/deploy/production.rb
new file:   config/deploy/staging.rb
```

設定ファイルが吐き出されるので、私は、プロジェクトルートに`capistrano`というフォルダを作って、その中で実行しています。



---

##### 参考リンク

- [入門 Capistrano 3 ~ 全ての手作業を生まれる前に消し去りたい | GREE Engineers' Blog](http://labs.gree.jp/blog/2013/12/10084/)
- [coderwall.com : establishing geek cred since 1305712800](https://coderwall.com/p/m5kpuq/capistrano-ftp-only-hosting-provider)