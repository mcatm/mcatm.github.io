---
layout: post
title: CentOS6.5にphp-gdが入らない時の解決法
permalink: /post/install-gd-to-centos6/
tags: [linux,server,infrastructure,php,chef]
---

さくらのクラウドにChefでサクッとインスタンス立ち上げようとするとしょっちゅうトラブルのでメモ。（CentOS6.5）

ChefでPHPをインストールするCookbookを書いて、その中で`php-gd`をインストールする処理を書いてたりすると、最近こんな感じでガゴッとエラーが返ってくる。

```log
Error executing action `install` on resource 'yum_package[php-gd]'
```

勿論、直前に`gd-last`はインストール済み。泣き言一つ言わずにスルッとインストールされてくれた。で、仕方ないのでSSHでサーバーにログイン、`$ yum install -y --enablerepo=remi-php55 php-gd`みたいな感じで実行してやると、エラーの内訳が分かる。`t1lib`が足りないんだと。

```ssh
$ yum install -y php-gd --enablerepo=remi-php55
```

```log
読み込んだプラグイン:fastestmirror, priorities, security
インストール処理の設定をしています
Loading mirror speeds from cached hostfile
 * elrepo: ftp.yz.yamagata-u.ac.jp
 * epel: ftp.riken.jp
 * remi-php55: remi.kazukioishi.net
 * remi-safe: remi.kazukioishi.net
 * rpmforge: ftp.riken.jp
 * rpmfusion-free-updates: mirrors.163.com
 * rpmfusion-nonfree-updates: mirror.rise.ph
依存性の解決をしています
--> トランザクションの確認を実行しています。
---> Package php-gd.x86_64 0:5.5.29-1.el6.remi will be インストール
--> 依存性の処理をしています: libt1.so.5()(64bit) のパッケージ: php-gd-5.5.29-1.el6.remi.x86_64
--> 依存性解決を終了しました。
エラー: パッケージ: php-gd-5.5.29-1.el6.remi.x86_64 (remi-php55)
             要求: libt1.so.5()(64bit)
 問題を回避するために --skip-broken を用いることができません
 これらを試行できます: rpm -Va --nofiles --nodigest
```

しかしながら、`$ yum install -y t1lib`実行しても、「t1lib？何すかそれ？」と嘯く俺のyum…。

なので、仕方ないから直接rpm実行してやりましょうね。

ここで、最新のパッケージを取得。

[RPM CentOS 6 t1lib 5.1.2 x86_64 rpm](http://rpm.pbone.net/index.php3/stat/4/idpl/27828537/dir/centos_6/com/t1lib-5.1.2-6.el6_2.1.x86_64.rpm.html)

もう適当に、`ftp://ftp.muug.mb.ca/mirror/centos/6.7/os/x86_64/Packages/t1lib-5.1.2-6.el6_2.1.x86_64.rpm`とかを、そのままrpmでインストール。

```ssh
$ rpm -ivh ftp://ftp.muug.mb.ca/mirror/centos/6.7/os/x86_64/Packages/t1lib-5.1.2-6.el6_2.1.x86_64.rpm
```

そうすると、スコーンと`t1lib`がインストールされる。もう、`$ yum install -y --enablerepo=remi-php55 php-gd`も怖くないぞ！

```ssh
$ yum install -y --enablerepo=remi-php55 php-gd
```

無事インストールされました。という備忘録！

### ちなみに…

CentOSにPHP5.3.3以上を入れようとすると異常に手こずる…という問題もあって…。

`remi-php55`もインストールしてあって、`--enablerepo`も指定してあるのに、`yum list`してみると「**PHP5.3.3が最新です**」なんてしれっとぬかしやがる場合がある。

この時は、`/etc/yum.repos.d/CentOS-Base.repo`を無効にしてやると良いです。効果てきめんです。

```
[base]
name=CentOS-$releasever - Base
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os&infra=$infra
baseurl=http://ftp.sakura.ad.jp/pub/linux/centos/$releasever/os/$basearch/
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-6
priority=1
```

こんな風に記述された各リポジトリの設定に、

```
enabled=0
```

を足してやるだけ。これで、無事にPHP5.5がインストールできます。

ただし、それが終わったら、きちんと`enabled=0`をコメントアウトしてやってね。他のモジュールがインストール出来なくなったりしますのでー。
