import kaboom, {Comp, LevelConf} from "kaboom";

const k = kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0, 0, 0, 1],
    texFilter: "linear"
})

const MOVE_SPEED = 120

k.loadRoot('assets/')
k.loadSprite('link-going-left', '1Xq9biB.png')
k.loadSprite('link-going-right', 'yZIb8O2.png')
k.loadSprite('link-going-down', 'r377FIM.png')
k.loadSprite('link-going-up', 'UkV0we0.png')
k.loadSprite('left-wall', 'rfDoaa1.png')
k.loadSprite('top-wall', 'QA257Bj.png')
k.loadSprite('bottom-wall', 'vWJWmvb.png')
k.loadSprite('right-wall', 'SmHhgUn.png')
k.loadSprite('bottom-left-wall', 'awnTfNC.png')
k.loadSprite('bottom-right-wall', '84oyTFy.png')
k.loadSprite('top-left-wall', 'xlpUxIm.png')
k.loadSprite('top-right-wall', 'z0OmBd1.jpg')
k.loadSprite('top-door', 'U9nre4n.png')
k.loadSprite('fire-pot', 'I7xSp7w.png')
k.loadSprite('left-door', 'okdJNls.png')
k.loadSprite('lanterns', 'wiSiY09.png')
k.loadSprite('slicer', 'c6JFi5Z.png')
k.loadSprite('skeletor', 'Ei1VnX8.png')
k.loadSprite('kaboom', 'o9WizfI.png')
k.loadSprite('stairs', 'VghkL08.png')
k.loadSprite('bg', 'u4DVsx6.png')

k.scene("game", ({ level, score }) => {
    k.layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            'ycc)cc^ccw',
            'a        b',
            'a      * b',
            'a    (   b',
            '%        b',
            'a    (   b',
            'a   *    b',
            'a        b',
            'xdd)dd)ddz',
        ],
        [
            'yccccccccw',
            'a        b',
            ')        )',
            'a        b',
            'a        b',
            'a    $   b',
            ')   }    )',
            'a        b',
            'xddddddddz',
        ]

    ]

    const levelCfg: LevelConf = {
        any(s: string): Comp[] | undefined {
            return undefined;
        },
        width: 48,
        height: 48,
        'a': [k.sprite('left-wall'), k.solid(), 'wall'],
        'b': [k.sprite('right-wall'), k.solid(), 'wall'],
        'c': [k.sprite('top-wall'), k.solid(), 'wall'],
        'd': [k.sprite('bottom-wall'), k.solid(), 'wall'],
        'w': [k.sprite('top-right-wall'), k.solid(), 'wall'],
        'x': [k.sprite('bottom-left-wall'), k.solid(), 'wall'],
        'y': [k.sprite('top-left-wall'), k.solid(), 'wall'],
        'z': [k.sprite('bottom-right-wall'), k.solid(), 'wall'],
        '%': [k.sprite('left-door'), k.solid(), 'door'],
        '^': [k.sprite('top-door'), 'next-level'],
        '$': [k.sprite('stairs'), 'next-level'],
        '*': [k.sprite('slicer'), 'slicer', { dir: -1 }, 'dangerous'],
        '}': [k.sprite('skeletor'), 'dangerous', 'skeletor', { dir: -1, timer: 0 }],
        ')': [k.sprite('lanterns'), k.solid()],
        '(': [k.sprite('fire-pot'), k.solid()]
    }
    k.addLevel(maps[level], levelCfg)

    k.add([k.sprite('bg'), k.layer('bg')])

    const scoreLabel = k.add([
        k.text('0'),
        k.pos(400,450),
        k.layer('ui'),
        {
            value: score,
        },
        k.scale(2)
    ])

    k.add([k.text('level ' + parseInt(level + 1)), k.pos(400, 485), k.scale(2)])

    const player = k.add([
        k.sprite('link-going-right'),
        k.pos(5, 190),
        {
            //right by default
            dir: k.vec2(1,0),
        }
    ])

    player.action(() => {
        player.resolve()
    })

    player.overlaps('next-level', () => {
        k.go("game", {
            level: (level + 1) % maps.length,
            score: scoreLabel.value,
        })
    })

    k.keyDown('left', () => {
        player.changeSprite('link-going-left')
        player.move(-MOVE_SPEED, 0)
        player.dir = k.vec2(-1,0)
    })

    k.keyDown('right', () => {
        player.changeSprite('link-going-right')
        player.move(MOVE_SPEED, 0)
        player.dir = k.vec2(1,0)
    })

    k.keyDown('up', () => {
        player.changeSprite('link-going-up')
        player.move(0, -MOVE_SPEED)
        player.dir = k.vec2(0,-1)
    })

    k.keyDown('down', () => {
        player.changeSprite('link-going-down')
        player.move(0, MOVE_SPEED)
        player.dir = k.vec2(0,1)
    })

    function spawnKaboom(player) {
        const obj = k.add([k.sprite('kaboom'), k.pos(player), 'kaboom'])
        k.wait(1, () => {
            k.destroy(obj)
        })
    }

    k.keyPress('space', () => {
        spawnKaboom(player.pos.add(player.dir.scale(48)))
    })

    player.collides('door', (door) => {
        k.destroy(door)
    })

    k.collides('kaboom', 'skeletor', (kaboom, skeletor) => {
        k.camShake(4)
        k.wait(1, () => {
            k.destroy(kaboom)
        })
        k.destroy(skeletor)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    const SLICER_SPEED = 100

    k.action('slicer', (slicer) => {
        slicer.move(slicer.dir * SLICER_SPEED, 0)
    })

    k.collides('slicer', 'wall', (slicer) => {
        slicer.dir = -slicer.dir
    })

    const SKELETOR_SPEED = 60

    k.action('skeletor', (skeletor) => {
        skeletor.move(0, skeletor.dir * SKELETOR_SPEED)
        skeletor.timer -= k.dt()
        if(skeletor.timer <= 0) {
            skeletor.dir = -skeletor.dir
            skeletor.timer = k.rand(5)
        }
    })

    k.collides('skeletor', 'wall', (skeletor) => {
        skeletor.dir = -skeletor.dir
    })

    player.overlaps('dangerous', () => {
        k.go('lose', {score: scoreLabel.value})
    })
})

k.scene('lose', ({ score }) => {
    k.add([k.text(score, 32), k.origin('center'), k.pos(k.width()/ 2, k.height()/ 2)])
})

k.start("game", { level: 0, score: 0})
