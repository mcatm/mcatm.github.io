---
layout: post
title: ChefからAnsibleに乗り換えてみる
permalink: /post/studying-ansible/
tags: [ansible, infrastructure]
---

# もう…Chefは沢山だ！

「**Chef-Solo**と**Chef-Server**の使い分けどうしたらいいんだ！！」とか、「そうこうしているうちに、**Chef-Zero**ってなんだ！！」とか、「そもそも立ち上がってないサーバー宛に、OpenSSLでのアクセス要求するとか、もうわけわからん（← これは単に俺がわけわかってないだけ）」とか、イライライライラしてきたので、サーバー構成管理ツールについてはよりシンプルと噂の**Ansible**を使ってみることにする。以下メモ！

---

## 初期設定

Ansible自体のインストールは、[ここ](http://docs.ansible.com/ansible/intro_installation.html)にあるように、色んな方法があるので割愛。俺は`pip`で入れました。

[ここ](http://dev.classmethod.jp/tool/ansible/)とかを参考にして進めるのですが、わざわざVagrantで仮想サーバーを二つ構築するのではなく、立ち上げた仮想サーバーに対して、Macから設定を行ってみようと思います。（その方がニーズあるんじゃないか…）

### Vagrantで仮想サーバーを立ち上げる

Provisionは走らないようにして、`$ vagrant up`を実行（IPアドレスには`192.168.33.45`を指定してあります）

### 仮想サーバーへの疎通を確認します

サーバーの疎通を確認するために、`ping`を打ってみる。`-m`はModuleの`m`。Ansibleで利用できるModuleにはかなりの数があり、これだけでChefよりリッチな気がする。Moduleの詳細は[ここで確認できます](http://docs.ansible.com/ansible/modules_by_category.html)

```bash
$ ansible 192.168.33.45 -m ping
```

```
ERROR: Unable to find an inventory file, specify one with -i ?
```

こんな感じで、「サーバーの構成リストの中にこのIP含まれてないよ」と優しく諭されます。「`-i忘れてない？`」って（「？」が優しさ）。

そこでIPアドレスを単に列挙したサーバーの構成リスト（Inventoryと呼ぶ）を`-i`オプションで指定してやりましょう。

> 僕の場合は、Ansibleのファイルは一箇所にまとめたいので、`/ansible`というディレクトリを作っています。`$ cd ansible`してからコマンド叩いてやる方法もあるんですけど、プロジェクトルートから色々やりたいので、以下の様な書き方にしますね。

```bash
$ echo 192.168.33.45 > ansible/hosts
$ ansible -i ansible/hosts 192.168.33.45 -m ping
```

次は、こんなエラーを吐きます。

```
192.168.33.45 | FAILED => SSH Error: Permission denied (publickey,gssapi-keyex,gssapi-with-mic,password).
    while connecting to 192.168.33.45:22
It is sometimes useful to re-run the command using -vvvv, which prints SSH debug output to help diagnose the issue.
```

要するに、**SSHでの接続権限が無い**、と。なので、仮想サーバーの方に公開鍵を追記してやって、SSHでの疎通を確認します。`$ vi ~/.ssh/id_rsa.pub`とかで、公開鍵の中身を把握しておきます（Github使ってるなら、既にあるでしょ公開鍵 ← 雑）

```bash
$ vagrant ssh
$ vi ~/.ssh/authorized_keys
```

ここに、さっきの公開鍵の中身を追記しておきます。その上で、もう一回下記コマンド実行。

```bash
$ ansible -i ansible/hosts 192.168.33.45 -m ping
```

```
192.168.33.45 | success >> {
    "changed": false,
    "ping": "pong"
}
```

**疎通確認！**だが待って欲しい。俺たちの冒険はここから始まります。ここからは、「**AnsibleでLAMP環境を構築するPlaybookを書き、VagrantのProvisionで走らせるまで…**」に挑戦してみることにします。

---

## Playbookを書く！

Ansibleでは、タスクをまとめたものを「**Playbook**」と呼びます。

### Inventoryを設定

ローカルの開発グループとして、ホストグループ`development`を定義。`ansible/development`という[Inventory File](https://github.com/mcatm/studying-ansible/blob/master/ansible/development)を用意してやりましょう。そこで、`lamp`というグループを作ります。

**development**

```
[lamp]
192.168.33.45
```

これによって、「開発環境（development）では仮想マシン一台構成だが、本番環境（production）ではWEBサーバーとDBサーバーを分けたい」なんて時、`ansible/production`には`web`と`db`のグループを用意して、それぞれ別のPlaybookを走らせる…なんてことが可能になります。

### Playbookを記述

こんな感じでテスト用Playbookを書いてみます。これは単に、「Apacheが動いているか確認する」というPlaybookですね。`become`という項目は、このタスクを`sudo`で行うという意味です。

```yaml
- hosts: development
  become: yes
  tasks:
    - name: be sure httpd is installed
      yum: name=httpd state=installed
    - name: be sure httpd is running and enabled
      service: name=httpd state=started enabled=yes
```

#### Playbookを実行！

まずはシンタックスチェックが出来ます。

```bash
$ ansible-playbook -i ansible/development ansible/development.yml --syntax-check
```

ドライランで、「実際には実行しないけど、実行したらこんな感じになるよ…」っていうのを試してみることが出来ます。

```bash
$ ansible-playbook -i ansible/development ansible/development.yml --check
```

で、実行！

```bash
$ ansible-playbook -i ansible/development ansible/development.yml
```

凄く直感的ですね。こうシンプルだとわくわくしますね。

---

## 構成

### Bast Practiceを確認

Ansibleの公式ドキュメントには「[Best Practices](http://docs.ansible.com/ansible/playbooks_best_practices.html)」という形で、構成案が記してあります。これに併せて、LAMP構成のサーバーを構築してみることにする！

### ディレクトリ構造

- **development** : 当記事のInventory File。ここは各環境に合わせてください。例えば、`production`、`staging`なんていうInventoryはよく使うことになるでしょう
- **development.yml** : site.ymlから読み込むPlaybookファイル。それぞれの環境に応じたタスクをここに記述します
- **group_vars/** : グループ毎の設定ファイル
  - **all** : 全てのグループで読まれる設定ファイル
- **host_vars/** : hostsにあるホストごとの設定ファイル
  - **development.yml** : こんな感じで設定ファイルを置いておく
- **roles/** : 各タスクを格納するディレクトリ
  - **xxxx/** : 例えば`roles/httpd/`みたいな感じで置いたものを、設定ファイルから`httpd`タスクとして実行することが可能になります
    - **handlers/** : 再起動や終了など、何かのタスクをフックにアクションを起こしたいときは、ここにハンドラーとして登録します
    - **tasks/** : タスクファイル（yml）を格納。基本、`task httpd`とやると、`roles/httpd/tasks/main.yml`が読み込まれる
    - **templates/** : タスクで利用する設定ファイルなどの雛形を格納します。`httpd.conf`などをここに置いています
- **site.yml** : マスターのPlaybookファイル

### site.ymlを設定

[site.yml](https://github.com/mcatm/studying-ansible/blob/master/ansible/site.yml)は全ての大元のPlaybookになります。`$ ansible-playbook -i ansible/development ansible/site.yml`こんな形で実行しますので、勿論site.ymlという名前じゃなくても一向にかまわないですね。ここでは、`development.yml`を読み込むこととします。

**site.yml**

```yaml
- include: development.yml
```

読み込まれるdevelopment.ymlを見てみましょう。

```yaml
---
- name: Install LAMP
  hosts: lamp
  remote_user: vagrant
  become: yes
  vars_files:
    - host_vars/development.yml
  roles:
    - common
    - httpd
    - php
    - mysql
```

こちらでは、`roles`という形で、タスクを設定しています。上に書いたように、それぞれroles以下にあるPlaybook（`roles/xxxx/tasks/main.yml`）を見に行き、実行します。hostsには`lamp`が設定してありますので、Inventory File（`development`）で読み込まれたグループ`lamp`が今回の対象サーバーになります。

`vars_files`は設定ファイルで、ここに変数を書いてやると、Playbookの中で`{{ "{{ hostname " }}}}`のような感じで参照することが可能です。勿論テンプレートの中でもバリバリ使用できます（Chefの`node`とか`variables`の考え方はややこしかったですね…）。

### タスクを設定

Apacheをインストールするタスクを見てみましょう。`/roles/httpd/tasks/main.yml`で設定されています。

**[/roles/httpd/tasks/main.yml](https://github.com/mcatm/studying-ansible/blob/master/ansible/roles/httpd/tasks/main.yml)**

```yaml
- name: Install httpd
  yum: name=httpd state=present
  tags: [lamp, httpd]
```

`name`でyumのパッケージ名、`state`は`present`（現行版）、`latest`（最新版）、`absent`（削除）を選択することが出来ます。この辺の仕様は、`$ ansible-doc yum`で確認できます。

`tags`は、Ansible Playbook実行時に、`-t httpd`などとオプションを指定することで、そのタグがついたタスクだけを実行するのに使います。主な使い道としては、どこかで処理がコケた時に、それまで成功していた処理をショートカットするのに使ったり、ごく一部のタスクだけを実行する必要に迫られた場合（`php.ini`を書き換える…とか）に使用します。

### タスクのリストを確認

実際に実行されるタスクの一覧を確認することも出来て、非常に便利！

```bash
$ ansible-playbook -i ansible/development ansible/site.yml --list-tasks
```

### 実行！

```bash
$ ansible-playbook -i ansible/development ansible/site.yml
```

## VagrantのProvisionerとして、Ansibleを使用する

ここまでできちゃえば、後は非常に簡単です。

**[Vagrantfile](https://github.com/mcatm/studying-ansible/blob/master/Vagrantfile)**

設定自体は、[このぐらい](https://github.com/mcatm/studying-ansible/blob/master/Vagrantfile#L77-L81)。

```ruby
config.vm.provision "ansible" do |ansible|
  ansible.limit = 'all'
  ansible.inventory_path = "ansible/development"
  ansible.playbook = "ansible/site.yml"
end
```

- **limit** : ここには`all`を入れておきます
- **inventory_path** : Inventory Fileのパスです。Vagrantで使用するのであれば、`development`を参照すればOKですね
- **playbook** : Playbookのパスです。`site.yml`を指定します

これで`$ vagrant up`、もしくは`$ vagrant provision`を叩けば、あっという間に仮想環境の構築が終わるはずです。VagrantのProvisionerとして登録しておくと、SSHキーの設定も不要なので非常に楽。

---

## まとめ

超駆け足ですが、こんな感じで無事ChefからAnsibleに乗り換えることが出来ました。

まだ、ごく簡単なLAMP構成のサーバーを構築できるレベルのものですが、[githubに今回使ったファイルの一式を公開しました]((https://github.com/mcatm/studying-ansible))ので、眺めてみてください。

個人的に、Chefと比較した時のAnsibleのメリットは以下の様なものがあります

- **設定が直感的**（コンソールの出力も見やすいです）
- **ファイル構成をある程度自由に組みかえられる**
- 設定先のサーバーを弄る必要がほとんどないので、**認証周りの厄介なトラブルを避けられる**
- **Vagrantの設定がすげー簡潔**

逆にデメリットは以下かな。

- `berkshelf`の不在
- Playbookを**Scaffolding出来ない**

しかしながら、berkshelfってあんまり使わない＋使うとブラックボックスになってしまうので、個人的にはAnsibleの方が使いやすいのと、その分ノウハウが小さい単位で転がってて再利用しやすいので問題はないかなと思っています。

PlaybookのScaffoldingはいずれ実装して欲しいですね。（ドキュメントを良く読んでないから、もしかしたら存在するのかもしれないですね）

ということで、俺はChefを卒業しました。明日からは、Ansible使いとして生きます！ご声援よろしくお願いします！

---

##### 関連リンク

- [Ansible is Simple IT Automation](http://www.ansible.com/)
  - [Ansible Documentation](http://docs.ansible.com/)
  - [Best Practices — Ansible Documentation](http://docs.ansible.com/ansible/playbooks_best_practices.html)
- [mcatm/studying-ansible](https://github.com/mcatm/studying-ansible)
- [Ansible チュートリアル | Ansible Tutorial in Japanese](http://yteraoka.github.io/ansible-tutorial/)
- [エージェントレスでシンプルな構成管理ツール「Ansible」入門 - さくらのナレッジ](http://knowledge.sakura.ad.jp/tech/3124/)
- [構成管理ツール Ansibleを使ってみる ｜ Developers.IO](http://dev.classmethod.jp/tool/ansible/)
- [Vagrant の provision を Ansible で行う - ぶるーすくりーん](http://mid0111.hatenablog.com/entry/2014/06/08/123643)