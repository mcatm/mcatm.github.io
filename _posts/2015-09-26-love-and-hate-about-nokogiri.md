---
layout: post
title: Nokogiriにハマるつもりじゃなかった
permalink: /post/love-and-hate-about-nokogiri/
tags: [rails, ruby]
---

またしてもrails入れようとしてハマった…。

**開発環境**

- Mac OSX Yosemite 10.10.4
- Ruby 2.2.3
- Gem 2.4.5
- Homebrew 0.9.5

## Nokogiriがインストールできない

railsが依存してる**Nokogiri**ってgemがインストール出来ない問題っていうのは、古来より広く知られたトラブルであり、数多の勇者が命からがら辛くも勝利し、ruby界のマーフィーズゴースト的な存在である（喩えベタ）。

今回私も出くわし、当記事執筆時点では未だ以って解決していないのだが、トラブルシューティング録を付けていこう。二度とこのマーフィーズゴーストにはやられまいと思う次第である。

## Nokogiriって何？

いっつもスルーしてた。rubyでスクレイピングするためのgem。XMLやHTMLをパースして、その中身を走査するためのものなので、まあ、重要ですよね。「ノコギリ」って名前に、なんかイラッとしないでもない。

- [Nokogiri の基本(翻訳版) - Engine Yard Blog](http://www.engineyard.co.jp/blog/2012/getting-started-with-nokogiri/)

### まずは普通にgem install rails

```
$ gem install rails
```

すると、こんな感じのエラー。

```
Fetching: nokogiri-1.6.6.2.gem (100%)
Building native extensions.  This could take a while...
ERROR: Error installing rails:
ERROR: Failed to build gem native extension.
```

出ましたよ、Nokogiriでエラー。

### XCode Command Lineをアップデート

ログを読むと

```
To install Command Line Tools, try running `xcode-select --install` on
terminal and follow the instructions.  If it fails, open Xcode.app,
select from the menu "Xcode" - "Open Developer Tool" - "More Developer
Tools" to open the developer site, download the installer for your OS
version and run it.
```

とありますんで、一旦XCode Command Line Toolsをアップデート。失礼しました。

### 再度、railsをインストール

すると、再度Nokogiriがエラー吐いてる。libiconvの位置が分からんと言うことだな。分かる。

```
Building nokogiri using packaged libraries.
checking for gzdopen() in -lz... yes
checking for iconv... no
-----
libiconv is missing.  Please locate mkmf.log to investigate how it is failing.
-----
```

#### しれっと言うが、mkmf.logどこよ

しれっと「mkmf.log見れや」と来るが、それどこよ、と。多分Gem、相当ズボラ。仕方ないので探す。

```
find / -name mkmf.log
```

私はrbenvを使っているので、こんなところにありました。

```
~/.rbenv/versions/2.2.2/lib/ruby/gems/2.2.0/extensions/x86_64-darwin-14/2.2.0-static/nokogiri-1.6.6.2/mkmf.log
```

### Homebrewでパスを通す

libiconvにパスが通ってないんじゃないか、いやそもそもインストールされてないんじゃないかって説があるので、Homebrewで確認。

```
$ brew tap homebrew/dupes
Warning: Already tapped!
```

リポジトリは問題ないと。

- [これは便利！Homebrewに追加されたtapコマンドはリポジトリを追加して簡単にフォーミュラを増やせる | Macとかの雑記帳](http://tukaikta.blog135.fc2.com/blog-entry-204.html)

```
$ brew install libxml2 libxslt libiconv
Warning: libxml2-2.9.1 already installed
Warning: libxslt-1.1.28 already installed
Warning: libiconv-1.14 already installed
```

インストールされてる。問題ない。

```
$ brew link --force libxml2 libxslt libiconv
Warning: Already linked: /usr/local/Cellar/libxml2/2.9.1
Warning: Already linked: /usr/local/Cellar/libxslt/1.1.28
Warning: Already linked: /usr/local/Cellar/libiconv/1.14
```

リンクされてる。問題ない。もーー。

### インストール時にパスを指定してやる

[ここ](http://stackoverflow.com/questions/5528839/why-does-installing-nokogiri-on-mac-os-fail-with-libiconv-is-missing)とかに書かれている通り、システムライブラリにパスを通してやって、`$ gem install nokogiri -- --use-system-libraries`みたいな方法も有効みたいです。ただ、自分の環境では上手く動かず。

`$ gem install nokogiri -- --with-iconv-dir=/usr/local/Cellar/libiconv/1.14`みたいな形で、Homebrewでインストールしたlibiconvのパスを明示してやるという方法もある。この場合、libiconvは通って上手く動作するんだが、今度はlibxml2がないだの、色々言われるので、最終的に

```
gem install nokogiri -- --with-iconv-dir=/usr/local/Cellar/libiconv/1.14 --with-libxml2-dir=/usr/local/Cellar/libxml2/2.9.1
```

とか、てんこ盛りで試してやってもだめ…。そもそも、こうも連続でパスが通ってないと言われるってことはなにか根本的な原因を取りこぼしているという可能性が高いという経験則。

### ARCHFLAGSを設定する

こいつはMac特有のバグですよ…っていうことで、pgなどをインストールするときにお馴染みの、**ARCHFLAGS**を設定してやります。ARCHFLAGSってあんまり説明ないんですけど、Macのアーキテクチャーを示す環境変数で、要するに「俺のMac、インテルの64bit版ですわ」ということを説明してくれるやつね。

- [Perl, Python, and Ruby Extensions Release Notes](https://developer.apple.com/library/mac/releasenotes/OpenSource/PerlExtensionsRelNotes/)

という結論に辿り着いたのは、[この記事](http://qiita.com/34ro/items/8e662bdcba361ee19263#gem%E3%81%A7nokogiri%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB)のおかげ。それで以下のコマンドを試してみました。

```
$ ARCHFLAGS="-arch x86_64" gem install nokogiri -v 1.5.11 -- --use-system-libraries --with-iconv-dir="$(brew --prefix libiconv)" --with-xml2-config="$(brew --prefix libxml2)/bin/xml2-config" --with-xslt-config="$(brew --prefix libxslt)/bin/xslt-config"
```

これでインストールは成功…するんだけど、バージョンが1.5.11ではRailsのDependencyを解決できずに、結局同じようにエラー吐いて終了してしまいます。

ちなみにARCHFLAGSは、`.bash_profile`とか、`.zshrc`とかに、

```
export ARCHFLAGS="-arch x86_64"
```

と記述しておくのが吉。

### 結局

rubyのバージョン落とすことで対応しました…。**この恨み、いつか晴らすぞ、Nokogiri！**

```
$ rbenv install 2.1.6
$ rbenv local 2.1.6
$ gem install rails
```

これで、railsの4.2.4がインストールされました。了！（了？）	

##### 参考リンク

- [Ruby - Mac OSX YosemiteにnokogiriをインストールするにはARCHFLAGSの指定が必要 - Qiita](http://qiita.com/34ro/items/8e662bdcba361ee19263)
- [gem インストール時に発生したエラーとその解決方法まとめ - kzy52's blog](http://kzy52.com/entry/2014/11/09/000511)
- [osx - Why does installing Nokogiri on Mac OS fail with libiconv is missing? - Stack Overflow](http://stackoverflow.com/questions/5528839/why-does-installing-nokogiri-on-mac-os-fail-with-libiconv-is-missing)