import { describe, expect, it } from 'vitest'

import { escapeCsvCell, exportQuery, toCsv } from './csv'

describe('escapeCsvCell', () => {
  it.each([
    ['=SUM(1+1)', "'=SUM(1+1)"],
    ['+91 98765', "'+91 98765"],
    ['-5', "'-5"],
    ['@cmd', "'@cmd"],
    ['\tTabbed', "'\tTabbed"],
    ['\rReturn', '"\'\rReturn"'],
    ['plain text', 'plain text'],
    ['has,comma', '"has,comma"'],
    ['two\nlines', '"two\nlines"'],
    ['say "hi"', '"say ""hi"""'],
    [null, ''],
    [undefined, ''],
    [0, '0'],
    [42, '42'],
  ])('escapes %j', (input, expected) => {
    expect(escapeCsvCell(input)).toBe(expected)
  })

  it('neutralises a formula that also needs quoting', () => {
    expect(escapeCsvCell('=HYPERLINK("http://x","go")')).toBe('"\'=HYPERLINK(""http://x"",""go"")"')
  })

  it('writes dates as ISO strings', () => {
    expect(escapeCsvCell(new Date('2026-01-02T03:04:05.000Z'))).toBe('2026-01-02T03:04:05.000Z')
  })
})

describe('toCsv', () => {
  it('writes a header and CRLF-separated rows', () => {
    expect(toCsv(['Name', 'Note'], [['Asha', 'a,b'], ['=bad', 'ok']])).toBe('Name,Note\r\nAsha,"a,b"\r\n\'=bad,ok\r\n')
  })

  it('handles no rows', () => {
    expect(toCsv(['A'], [])).toBe('A\r\n')
  })
})

describe('exportQuery', () => {
  it('builds a query string and skips empty values', () => {
    expect(exportQuery({ status: 'NEW', q: '', page: undefined, n: 0, ok: false })).toBe('?status=NEW&n=0&ok=false')
    expect(exportQuery({})).toBe('')
  })
})
