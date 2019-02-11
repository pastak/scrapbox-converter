Markdown記法 表示確認用サンプル

任意のアプリケーションで表示確認するためのサンプルです。
自分用ですが、よろしければ置いておきますのでどうぞ。
【2016/03/24】 Markdown Extra, GFM（GitHub Flavored Markdown）の記法を追加しました

[forapp-markdown-sample.md - Dropbox](https://www.dropbox.com/s/4z6kot27jmikhx5/forapp-markdown-sample.md "forapp-markdown-sample.md - Dropbox")

# 見出し1（h1）

見出し1（h1）
=============

## 見出し2（h2)

見出し2（h2）
-------------

### 見出し3

#### 見出し4

##### 見出し5

###### 見出し6

---

ここは段落です。♪もーもたろさん もーもたーろさん おっこしーにつっけたーちーびまーるこー

ここは段落です。  
↑半角スペース2個で強制改行しています。  
♪もーもたろさん もーもたーろさん おっこしーにつっけたーちーんあーなごー

- **強い強調（strong）です。** __これも強い強調です。__ `<strong>`strongタグです。`</strong>`
- *強調（em）です。* _これも強調です。_ 斜体の`<em>`タグになります。
- ***強調斜体です。*** ___強調斜体です。___ `<strong>`＋`<em>`タグになります。


> 引用（Blockquote）です

> > 引用のネストです

> 上に一行空けないとネストのままです

引用（Blockquote）の中にはMarkdown要素を入れられます

> ## 見出し
>
> 1. 数字リスト
> 2. 数字リスト

## エスケープ文字

\*アスタリスクをバックスラッシュでエスケープ\*

\## 見出しハッシュ文字をエスケープ

HTMLタグをバックスラッシュでエスケープ→（\<p>）

HTMLをバッククォートでインラインコード→（`<p>`）

## 水平線（`<hr>`）各種

アスタリスク3個半角スペース空けて

* * *
アスタリスク3個以上

******
ハイフン半角スペース空けて

- - -
続けてハイフン3個以上

-------------------

## リスト

- ハイフン箇条書きリスト
+ プラス箇条書きリスト
* 米印箇条書きリスト
    - 二階層め・箇条書きリスト
      - 三階層め・箇条書きリスト
       - 四階層め・箇条書きリスト
- 箇条書きリスト

---

1. 番号付きリスト
	1. 二階層め・番号付きリスト1
	1. 二階層め・番号付きリスト2
1. 番号付きリスト2
	1. 二階層め・番号付きリスト1
		1. 三階層め・番号付きリスト1
		1. 三階層め・番号付きリスト2
  		1. 四階層め・番号付きリスト1
	1. 二階層め・番号付きリスト2
1. 番号付きリスト3


定義リストタイトル
: 定義リスト要素1
: 定義リスト要素2
: 定義リスト要素3

## コードブロック

```
バッククォート or 半角チルダ3個でくくります。
###ここにはMarkdown書式は効きません
/* コメント */
testtest // コメント
```

~~~
<!DOCTYPE html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>ニョロニョロ囲みhtml</title>
/* コメント */
~~~

```
<!DOCTYPE html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>バッククォート囲みhtml</title>
```

```
body { display: none; } /* バッククォート囲みcss */
// コメント
```

    // 先頭に半角スペース4つでcode囲い
    <?php if (is_tag()){ $posts = query_posts($query_string . '&showposts=20'); } ?>

バッククォート1個ずつで囲むとインラインのコード（`<code></code>`）です。`body { visibility: hidden; }`

## リンク

markdownでテキストリンク [WIRED.jp](http://wired.jp/ "WIRED.jp")

<カッコ>でくくってリンク <http://wired.jp/>

定義参照リンクです。SNSには [Twitter] [1] や [Facebook] [2] や [Google+] [3]  などがあります。

  [1]: https://twitter.com/        "Twitter"
  [2]: https://ja-jp.facebook.com/  "Facebook"
  [3]: https://plus.google.com/    "Google+"

## 画像

![うきっ！](http://mkb.salchu.net/image/salchu_image02.jpg "salchu_image02.jpg")

## table

| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       |        This |     This     |
| column     |      column |    column    |
| will       |        will |     will     |
| be         |          be |      be      |
| left       |       right |    center    |
| aligned    |     aligned |   aligned    |

（Kobitoのヘルプmdから拝借しました）

# GFM

## リンク

URLそのまま貼り付け http://wired.jp/

## 段落中の改行

ここは段落です。
↑returnで改行しています。
♪もーもたろさん もーもたーろさん おっこしーにつっけたーちー○○ー○○ー

## コードブロック

バッククォートの開始囲みに続けて拡張子でシンタックスハイライト

```html
<!DOCTYPE html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>バッククォート囲みに拡張子付きhtml</title>
/* コメント */
```

```css
body { display: none; } /* コメント */
```

```php
<?php if (is_tag()){ $posts = query_posts($query_string . '&showposts=20'); } ?>
```

## 取り消し線

~~取り消し線（GFM記法）~~  
<s>sタグです。</s>

## 単語中のアンダースコアの無効

GitHub_Flavored_Markdown_test_test

## tasklist

- [ ] task1
- [ ] task2
- [x] completed task



# 参考URL

- [Daring Fireball: Markdown Syntax Documentation](http://daringfireball.net/projects/markdown/syntax.php)
- [はてなブログで「Markdown記法一覧」を書いてみるテスト - そっと、はてなブログ](http://mametanuki.hateblo.jp/entry/2012/09/22/MarkdownList#Links)
- [Markdownで行こう！ · GitHub](https://gist.github.com/wate/7072365)
