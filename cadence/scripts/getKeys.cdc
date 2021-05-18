
pub fun main() : [UInt64] {

    let array: [UInt64] = []
    var i : UInt64 = 5 as UInt64
    var a = 5
    while i > 0 as UInt64 {
        array.append(i)
        i = i - 1 as UInt64
        a = 9
    }

    if (a == 9) {
        panic("incorrect variable assignment")
    }

    return array
}
