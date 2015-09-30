---
layout: post
title: 初心者のためのAjax設計
permalink: /post/how-to-do-ajax-easily/
tags: [javascript]
---

他のエンジニアのフロントの設計を見てると、「原則」のようなものがまちまちで、大変危ういと思った。

## 非同期／同期関係なく、データの送信にはFormを利用する

```html
<input type="text" name="text" value="" id="text">
<button id="btn">送信</button>
```

みたいなフォームがあって、この`$('#text').val()`をどっかのAPI（仮に`/api/post`とかにしますか）に向けて送信したいとします。

この時、

```js
$('#btn').on('click', function() {
  $.ajax({
    url: '/api/post',
    type: 'post',
    dataType: 'json',
    data: { text: $('#text').val() }
  });
});
```

とかやる実装をよく見ます。これ、バックエンドも担当する身からすると、すげーまどろっこしい。

こういう時は、

```html
<form id="form">
  <input type="text" name="text" value="" id="text">
  <button id="btn">送信</button>
</form>
```

と、まずは`form#form`でラップします（IDはなんでもいい。つうか普段はID使わないです）。

それで、

```js
$('#btn').on('click', function() {
  var $this = $(this);
  $.ajax({
    url: '/api/post',
    type: 'post',
    dataType: 'json',
    data: $('#form').serialize()
  });
});
```

と、**「formのValue共を、serialize()して送信してやる」**という実装にしてやると良いです。

### 理由1: 拡張性

例えば、「テキスト」に加えて「名前」も送りたい、と仕様が変更した時のことを考えてみましょう。formを使わない例では、

```html
<input type="text" name="text" value="" id="text">
<input type="text" name="name" value="" id="name">
<button id="btn">送信</button>
```

フォームはこのように拡張され、

```js
$('#btn').on('click', function() {
  $.ajax({
    url: '/api/post',
    type: 'post',
    dataType: 'json',
    data: { text: $('#text').val(), name: $('#name').val() }
  });
});
```

JSはこう。今回は項目が一つ追加になっただけで済みましたが、この項目が400億個増えた時のことを考えましょう。

formを使って送信した場合は、formを拡張するだけで済みます。（でも400億個項目が増えたらキツいな、**さっきの例は最悪でした**）

```html
<form id="form">
  <input type="text" name="text" value="" id="text">
  <input type="text" name="name" value="" id="name">
  <button id="btn">送信</button>
</form>
```

このように項目を一つ増やしただけで、自動的に値は`serialize()`され、APIの番人の元へと送られます。

### 理由2: 疎結合

フロントの作業範囲とバックエンドの作業範囲を分けても、I/Oをきちんと共有さえしておけば問題なく動作します。

API側の仕様が、**「name:textの値をPOSTで送信すると、記事を追加する」**というものだった場合、

```html
<form action="/api/post" id="form" method="POST">
  <input type="text" name="text" value="" id="text">
  <button id="btn">送信</button>
</form>
```

このように実装したformであれば、Ajaxであろうと、単なるPOSTであろうと、正しく動作するはずです。

APIが正しくRESTで書かれていれば、**「/api/postにGETリクエストを送ることで記事を取得」**、**「/api/postにDELETEリクエストを送ることで記事を削除」**なんていう処理を書くのも容易になりますね。