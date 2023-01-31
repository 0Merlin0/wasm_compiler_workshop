(module (func (export "_start") (result i32)
    (i32.div_s
        (i32.sub
            (i32.add
                (i32.const 10)
                (i32.mul
                    (i32.const 2)
                    (i32.const 20)
                )
            )
            (i32.const 10)
        )
        (i32.const 2)
    )
))
