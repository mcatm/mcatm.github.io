---
layout: post
title: Ansibleに乗り換えてみる
permalink: /post/studying-ansible/
tags: [ansible]
---

### もう…Chefは沢山だ！

「**Chef-Solo**と**Chef-Server**の使い分けどうしたらいいんだ！！」とか、「そうこうしているうちに、**Chef-Zero**ってなんだ！！」とか、「そもそも立ち上がってないサーバー宛に、OpenSSLでのアクセス要求するとか、もうわけわからん（← これは単に俺がわけわかってないだけ）」とか、イライライライラしてきたので、サーバー構成管理ツールについてはよりシンプルと噂の**Ansible**を使ってみることにする。以下メモ！

---

### 初期設定

Ansible自体のインストールは、[ここ](http://docs.ansible.com/ansible/intro_installation.html)にあるように、色んな方法があるので割愛。俺は`pip`で入れました。

[ここ](http://dev.classmethod.jp/tool/ansible/)とかを参考にして進めるのですが、わざわざVagrantで仮想サーバーを二つ構築するのではなく、立ち上げた仮想サーバーに対して、Macから設定を行ってみようと思います。（その方がニーズあるんじゃないか…）

#### Vagrantで仮想サーバーを立ち上げる

Provisionは走らないようにして、`$ vagrant up`を実行（IPアドレスには`192.168.33.45`を指定してあります）

#### 仮想サーバーへの疎通を確認します

サーバーの疎通を確認するために、`ping`を打ってみる。`-m`はModuleの`m`。

```
$ ansible 192.168.33.45 -m ping
```

`ERROR: Unable to find an inventory file, specify one with -i ?`こんな感じで、「サーバーの構成リストの中にこのIP含まれてないよ」と優しく諭されます。「`-i忘れてない？`」って。

```
$ echo 192.168.33.45 > ansible/hosts
$ ansible -i ansible/hosts 192.168.33.45 -m ping
```

次は、こんなエラーを吐きます。

```
192.168.33.45 | FAILED => SSH Error: Permission denied (publickey,gssapi-keyex,gssapi-with-mic,password).
    while connecting to 192.168.33.45:22
It is sometimes useful to re-run the command using -vvvv, which prints SSH debug output to help diagnose the issue.
```

要するに、SSHでの接続権限が無い、と。なので、仮想サーバーの方に公開鍵を追記してやって、SSHでの疎通を確認します。`$ vi ~/.ssh/id_rsa.pub`とかで、公開鍵の中身を把握しておきます（Github使ってるなら、既にあるでしょ公開鍵）

```
$ vagrant ssh
$ vi ~/.ssh/authorized_keys
```

ここに、さっきの公開鍵の中身を追記しておきます。その上で、もう一回下記コマンド実行。

```
$ ansible -i ansible/hosts 192.168.33.45 -m ping
```

```
192.168.33.45 | success >> {
    "changed": false,
    "ping": "pong"
}
```

**疎通確認！**

#### Playbookを書く！

##### Inventoryを設定

ローカルの開発グループとして、`development`を定義。hostsに追記します。

```
[development]
192.168.33.45
```

##### Playbookを記述

```yml
- hosts: development
  become: yes
  tasks:
    - name: be sure httpd is installed
      yum: name=httpd state=installed
    - name: be sure httpd is running and enabled
      service: name=httpd state=started enabled=yes
```

##### Playbookを実行！

シンタックスチェック

```
$ ansible-playbook -i ansible/hosts ansible/development.yml --syntax-check
```

ドライラン

```
$ ansible-playbook -i ansible/hosts ansible/development.yml --check
```

---

### 構成

#### Bast Practiceを確認

Ansibleの公式ドキュメントには「[Best Practices](http://docs.ansible.com/ansible/playbooks_best_practices.html)」という形で、構成案が記してあります。これに併せて、LAMP構成のサーバーを構築してみることにする！

#### ディレクトリ構造

- **group_vars/** : グループ毎の設定ファイル
- **host_vars/** : hostsにあるホストごとの設定ファイル
- **roles** : 各タスクを格納するディレクトリ
  - **tasks** : タスクファイル（yml）を格納
- **site.yml** : マスターの設定ファイル

#### hostsを再定義

```
[lamp]
192.168.33.45
```

#### site.ymlを設定

```
- name: Install LAMP
  hosts: lamp
  remote_user: vagrant
  become: yes

  roles:
    - httpd
```

#### タスクを設定

Apacheをインストールしてみましょう。

```
- name: Install httpd
  yum: name=httpd state=present
```

`name`でyumのパッケージ名、`state`は`present`（現行版）、`latest`（最新版）、`absent`（削除）を選択することが出来ます。この辺の仕様は、`$ ansible-doc yum`で確認できます。

#### タスクのリストを確認

実際に実行されるタスクの一覧を確認することも出来て、非常に便利！

```
$ ansible-playbook -i ansible/development ansible/site.yml --list-tasks
```

#### 実行！

```
$ ansible-playbook -i ansible/development ansible/site.yml
```

---

##### 関連リンク

- [Ansible is Simple IT Automation](http://www.ansible.com/)
  - [Ansible Documentation](http://docs.ansible.com/)
  - [Best Practices — Ansible Documentation](http://docs.ansible.com/ansible/playbooks_best_practices.html)
- [Ansible チュートリアル | Ansible Tutorial in Japanese](http://yteraoka.github.io/ansible-tutorial/)
- [エージェントレスでシンプルな構成管理ツール「Ansible」入門 - さくらのナレッジ](http://knowledge.sakura.ad.jp/tech/3124/)
- [構成管理ツール Ansibleを使ってみる ｜ Developers.IO](http://dev.classmethod.jp/tool/ansible/)
- [Vagrant の provision を Ansible で行う - ぶるーすくりーん](http://mid0111.hatenablog.com/entry/2014/06/08/123643)