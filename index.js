// const regexp = /^[^\x00-\x1F "#\$%\&'\*,\.\/:;<=>\?\[\\\]\^`\{\|\}~\x7F](?:[^\x00-\x1F"#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]*[^\x00-\x1F "#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F])?$/

const allow_start_regexp = /^[^\x00-\x1F "#\$%\&'\*,\.\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]/
const allow_start_regexp_file = /^[^\x00-\x1F 　"#\$%\&'\*,\.\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]/
const allow_anywhere_regexp = /[^\x00-\x1F"#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]/
const allow_anywhere_regexp_file = /[^\x00-\x1F 　"#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]/
const allow_last_regexp = /[^\x00-\x1F "#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]$/
const allow_last_regexp_file = /[^\x00-\x1F 　"#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]$/
const test = require('tape')

// var safe_pattern = function (pattern) {
//   return !!regexp.test(pattern)
// }

// 1.先頭の禁止文字をはじく Project
// -> ドットとスペースは先頭に使えません
var allow_start_pattern = function (pattern) {
  return !!allow_start_regexp.test(pattern)
}
// 1.先頭の禁止文字をはじく File/Folder 全角スペースもはじく
var allow_start_pattern_file = function (pattern) {
  return !!allow_start_regexp_file.test(pattern)
}

// 2.禁止文字をはじく Project
var allow_anywhere_pattern = function (pattern) {
  return !!allow_anywhere_regexp.test(pattern)
}
// 2.禁止文字をはじく File/Folder スペース類もはじく
var allow_anywhere_pattern_file = function (pattern) {
  return !!allow_anywhere_regexp_file.test(pattern)
}
// 3.末尾の禁止文字をはじく Project
// -> スペースは末尾に使えません
var allow_last_pattern = function (pattern) {
  return !!allow_last_regexp.test(pattern)
}
// 3.末尾の禁止文字をはじく File/Folder 全角スペースもはじく
var allow_last_pattern_file = function (pattern) {
  return !!allow_last_regexp_file.test(pattern)
}


test('forbidden_start: 先頭禁止パタン', function (t) {
  t.equal(allow_start_pattern(".dot"), false)
  t.equal(allow_start_pattern("\x20dot"), false)
  t.equal(allow_start_pattern("　dot"), true) //jsでは許容 Project
  t.equal(allow_start_pattern_file("　dot"), false) //js File/Folderでは許容しない
  t.equal(allow_start_pattern("\tdot"), false)
  t.equal(allow_start_pattern("\rdot"), false)
  t.equal(allow_start_pattern("\ndot"), false)
  t.equal(allow_start_pattern("\vdot"), false)
  t.equal(allow_start_pattern("\fdot"), false)

  t.end()
})

test('forbidden_last: 文末禁止パタン', function (t) {
  t.equal(allow_last_pattern("dot\x20"), false)
  t.equal(allow_last_pattern("dot　"), true) //jsでは許容 Project
  t.equal(allow_last_pattern_file("dot　"), false) //js File/Folderでは許容しない
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

test('Project: space 文中半角スペース 全角スペースはOK', function (t) {
  t.equal(allow_anywhere_pattern(" "), true)
  t.equal(allow_anywhere_pattern("　"), true)

  t.end()
})

//
test('File/Folder: space 文中半角スペース 全角スペースはNG', function (t) {
  t.equal(allow_anywhere_pattern_file(" "), false)
  t.equal(allow_anywhere_pattern_file("　"), false)

  t.end()
})

test('meta_char 制御文字はNG', function (t) {
  // \x00-\x1F\x7F
  t.equal(allow_anywhere_pattern("\x00"), false)
  t.equal(allow_anywhere_pattern("\x1F"), false)
  t.equal(allow_anywhere_pattern("\x7F"), false)

  t.end()
})

test('empty: 空文字はNG', function (t ) {
  t.equal(/^$/.test(""), true)

  t.end()
})
