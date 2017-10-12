const regexp = /^[^\x00-\x1F "#\$%\&'\*,\.\/:;<=>\?\[\\\]\^`\{\|\}~\x7F](?:[^\x00-\x1F"#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F]*[^\x00-\x1F "#\$%\&'\*,\/:;<=>\?\[\\\]\^`\{\|\}~\x7F])?$/
const test = require('tape')

var safe_pattern = function (pattern) {
  return !!regexp.test(pattern)
}

test('forbidden', function (t) {
  t.equal(safe_pattern(".dot"), false)
  t.equal(safe_pattern("abcd.1234"), true)
  t.equal(safe_pattern("$1234"), false)
  t.equal(safe_pattern("100%ok"), false)
  t.equal(safe_pattern("M&M"), false)
  t.equal(safe_pattern("#hello"), false)

  t.end()
})

test('hira/kana ひらがなカタカナok', function (t) {
  t.equal(safe_pattern("フォルダ"), true)
  t.equal(safe_pattern("フ゜ロシ゛ェクト"), true)
  t.equal(safe_pattern("ふぉるだ"), true)
  t.equal(safe_pattern("ふぉるた゛"), true)

  t.end()
})

test('han kana 半角はNG', function (t) {
  t.equal(safe_pattern("ﾌｫﾙﾀﾞ"), false)

  t.end()
})

test('kanji 漢字はOK, サロゲートペアもOK', function (t) {
  //   吉
  // CJK UNIFIED IDEOGRAPH-5409
  // Unicode: U+5409, UTF-8: E5 90 89
  t.equal(safe_pattern("\u5409野屋"), true)
  // 𠮷
  // CJK UNIFIED IDEOGRAPH-20BB7
  // Unicode: U+20BB7, UTF-8: F0 A0 AE B7
  t.equal(safe_pattern("\u{20BB7}野屋"), true)

  t.end()
})

test('emoji 絵文字はOK スキントーンもOK', function (t) {
  t.equal(safe_pattern("❤️"), true)
  t.equal(safe_pattern("😄"), true)
  t.equal(safe_pattern("💇🏻"), true)
  t.equal(safe_pattern(".😓"), false)

  t.end()
})

test('greek ギリシャ語はOK', function (t) {
  t.equal(safe_pattern("α"), true)
  t.equal(safe_pattern("β"), true)
  t.equal(safe_pattern("η"), true)
  t.equal(safe_pattern("λ"), true)
  t.equal(safe_pattern(".α"), false)

  t.end()
})

test('space 行頭スペースはNG 行中スペースはOK, 全角スペースはどこでもok', function (t) {
  t.equal(safe_pattern("test test"), true)
  t.equal(safe_pattern(" test"), false)

  t.equal(safe_pattern("　こんにちは"), true)
  t.equal(safe_pattern("こんに　ちは"), true)

  t.end()
})

test('meta_char 制御文字はNG', function (t) {
  t.equal(safe_pattern("tt\t"), false)
  t.equal(safe_pattern("\t"), false)
  t.equal(safe_pattern("\n"), false)
  t.equal(safe_pattern("\r"), false)
  t.equal(safe_pattern("\b"), false)
  t.equal(safe_pattern(".\t"), false)

  t.end()
})
