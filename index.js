// const regexp = /^[^\x00-\x1F "#\$%\&'\*,\.\/:;<=>\?\[\\\]\^`\{\|\}~\x7F](?:[^\x00-\x1F"#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]*[^\x00-\x1F "#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F])?$/

const allow_start_regexp = /^[^\x00-\x1F "#\$%\&'\*,\.\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]/
const allow_anywhere_regexp = /[^\x00-\x1F"#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]*/
const allow_last_regexp = /[^\x00-\x1F "#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]$/
const test = require('tape')

// var safe_pattern = function (pattern) {
//   return !!regexp.test(pattern)
// }

// 1.先頭の禁止文字をはじく
// -> ドットとスペースは先頭に使えません
var allow_start_pattern = function (pattern) {
  return !!allow_start_regexp.test(pattern)
}

// 2.禁止文字をはじく
var allow_anywhere_pattern = function (pattern) {
  return !!allow_anywhere_regexp.test(pattern)
}
// 3.末尾の禁止文字をはじく
// -> スペースは末尾に使えません
var allow_last_pattern = function (pattern) {
  return !!allow_last_regexp.test(pattern)
}
// https://github.com/cloudlatex-team/cloudlatex2/blob/b86d7e1d53f51c462704aaaa3e4a30d24b87cde6/gulp/app/react/components/projects/edit/FileNameDialog.jsx#L26-L30
// と
// https://github.com/cloudlatex-team/cloudlatex2/blob/b86d7e1d53f51c462704aaaa3e4a30d24b87cde6/gulp/app/react/components/projects/ProjectsDialog.jsx#L57-L61
//
// この部分を 1->3->2 でチェック、2で漏れてもサーバサイドで弾くようにする
// } else if ( event.target.value.match(/^[a-zA-Z0-9ａ-ｚＡ-Ｚ０-９（）【】「」＜＞！”＃＄％＆’＝｜＊＋？＿｛｝［］〈〉《》、。・￥＠：；／＼_\-\(\)!\*ぁ-んァ-ヶー \^@=\+\{\}\[\]][a-zA-Z0-9ａ-ｚＡ-Ｚ０-９（）【】「」＜＞！”＃＄％＆’＝｜＊＋？＿｛｝［］〈〉《》、。・￥＠：；／＼_\-\(\)!\*ぁ-んァ-ヶー \^@=\+\{\}\[\]\.]*$/)) {
//   this.setState({ errorText: '', submittable: true });
// } else {
//   this.setState({ errorText: t('view:editor.invalid_filename'), submittable: false });
// }


test('forbidden_start: 先頭禁止パタン', function (t) {
  t.equal(allow_start_pattern(".dot"), false)
  t.equal(allow_start_pattern("\x20dot"), false)
  t.equal(allow_start_pattern("　dot"), true) //jsでは許容
  t.equal(allow_start_pattern("\tdot"), false)
  t.equal(allow_start_pattern("\rdot"), false)
  t.equal(allow_start_pattern("\ndot"), false)
  t.equal(allow_start_pattern("\vdot"), false)
  t.equal(allow_start_pattern("\fdot"), false)

  t.end()
})

test('forbidden_last: 文末禁止パタン', function (t) {
  t.equal(allow_last_pattern("dot\x20"), false)
  t.equal(allow_last_pattern("dot　"), true) //jsでは許容
  t.equal(allow_last_pattern("dot\t"), false)
  t.equal(allow_last_pattern("dot\r"), false)
  t.equal(allow_last_pattern("dot\n"), false)
  t.equal(allow_last_pattern("dot\v"), false)
  t.equal(allow_last_pattern("dot\f"), false)

  t.end()
})

test('hira/kana ひらがなカタカナOK', function (t) {
  t.equal(allow_anywhere_pattern("フォルダ"), true)
  t.equal(allow_anywhere_pattern("フ゜ロシ゛ェクト"), true)
  t.equal(allow_anywhere_pattern("ふぉるだ"), true)
  t.equal(allow_anywhere_pattern("ふぉるた゛"), true)

  t.end()
})

test('han kana 半角はOK', function (t) {
  t.equal(allow_anywhere_pattern("ﾌｫﾙﾀﾞ"), true)

  t.end()
})

test('kanji 漢字はOK, サロゲートペアもOK', function (t) {
  //   吉
  // CJK UNIFIED IDEOGRAPH-5409
  // Unicode: U+5409, UTF-8: E5 90 89
  t.equal(allow_anywhere_pattern("\u5409野屋"), true)
  // 𠮷
  // CJK UNIFIED IDEOGRAPH-20BB7
  // Unicode: U+20BB7, UTF-8: F0 A0 AE B7
  t.equal(allow_anywhere_pattern("\u{20BB7}野屋"), true)

  t.end()
})

test('emoji 絵文字はOK スキントーンもOK', function (t) {
  t.equal(allow_anywhere_pattern("❤️"), true)
  t.equal(allow_anywhere_pattern("😄"), true)
  t.equal(allow_anywhere_pattern("💇🏻"), true)

  t.end()
})

test('greek ギリシャ語はOK', function (t) {
  t.equal(allow_anywhere_pattern("α"), true)
  t.equal(allow_anywhere_pattern("β"), true)
  t.equal(allow_anywhere_pattern("η"), true)
  t.equal(allow_anywhere_pattern("λ"), true)

  t.end()
})

test('space 行中半角スペース 全角スペースはOK', function (t) {
  t.equal(allow_anywhere_pattern("test test"), true)
  t.equal(allow_anywhere_pattern("こんに　ちは"), true)

  t.end()
})

test('meta_char 制御文字はOK', function (t) {
  // \x00-\x1F\x7F
  t.equal(allow_anywhere_pattern("\x00"), true) // jsでは許容
  t.equal(allow_anywhere_pattern("\x1F"), true) // jsでは許容
  t.equal(allow_anywhere_pattern("\x7F"), true) // jsでは許容

  t.end()
})

test('empty: 空文字はNG', function (t ) {
  t.equal(/^$/.test(""), true)

  t.end()
})
