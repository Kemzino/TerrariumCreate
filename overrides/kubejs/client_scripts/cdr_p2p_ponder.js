Ponder.registry((event) => {
        event
            .create("createdeliveryrequired:p2p_terminal")
            .tag("createdeliveryrequired:delivery_contracts")
            .scene("p2p_terminal_trading", "Trading through P2P terminals", (scene, util) => {
                    const terminal = [1, 1, 2];
                    const link = [3, 1, 2];
                    const clipboardTarget = [1.5, 2.25, 2.5];
                    const linkTarget = [3.5, 2.25, 2.5];
                    const terminalTarget = [1.5, 2.6, 2.5];
                    const basePlate = [0, 0, 0, 4, 0, 4];

                    scene.scaleSceneView(0.76);
                    scene.setSceneOffsetY(-1);

                    scene.world.setBlocks(basePlate, "minecraft:polished_deepslate", false);
                    scene.world.setBlock(terminal, Block.id("createdeliveryrequired:p2p_terminal").with("facing", "north"), false);
                    scene.world.setBlock(link, Block.id("createdeliveryrequired:p2p_link").with("facing", "north"), false);

                    scene.showStructure();
                    scene.idle(12);

                    scene.text(75, "Place and name a P2P Link before using the terminal.", linkTarget)
                        .colored(PonderPalette.INPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, linkTarget, "down")
                        .rightClick()
                        .withItem("minecraft:name_tag");
                    scene.idle(85);

                    scene.text(75, "The link acts as your return buffer for bought goods and fulfilled requests.", linkTarget)
                        .colored(PonderPalette.BLUE)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.idle(85);

                    scene.text(75, "Insert a bank card and a blank clipboard into the P2P Terminal.", clipboardTarget)
                        .colored(PonderPalette.INPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, clipboardTarget, "down")
                        .rightClick()
                        .withItem("create:clipboard");
                    scene.idle(85);

                    scene.text(80, "Browse listings, create your own sale, or post a supply request with frozen funds.", terminalTarget)
                        .colored(PonderPalette.MEDIUM)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, terminalTarget, "down")
                        .rightClick();
                    scene.idle(90);

                    scene.text(80, "Accepted deliveries write their destination to the clipboard and pay out in spurs.", terminalTarget)
                        .colored(PonderPalette.OUTPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(50, terminalTarget, "down")
                        .withItem("numismatics:spur");
                    scene.idle(90);
            });
});
