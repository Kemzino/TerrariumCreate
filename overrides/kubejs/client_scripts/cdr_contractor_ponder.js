Ponder.tags((event) => {
        event.createTag(
            "createdeliveryrequired:delivery_contracts",
            "createdeliveryrequired:contractor",
            "Delivery Contracts",
            "Contractor jobs, delivery zones, and payouts.",
            [
                    "createdeliveryrequired:contractor",
                    "createdeliveryrequired:market",
                    "createdeliveryrequired:p2p_terminal",
                    "createdeliveryrequired:p2p_link",
            ]
        );
});

Ponder.registry((event) => {
        event
            .create("createdeliveryrequired:contractor")
            .tag("createdeliveryrequired:delivery_contracts")
            .scene("contractor_delivery_contract", "Completing a Contractor delivery", (scene, util) => {
                    const contractor = [1, 1, 2];
                    const clipboardTarget = [1.5, 2.25, 2.5];
                    const offerTarget = [1.5, 2.6, 2.5];
                    const deliveryZone = [4, 1, 1, 6, 2, 3];
                    const deliveryZoneCenter = [5.5, 2.5, 2.5];
                    const subLevelStart = [0, 1, 1, 1, 1, 1];
                    const subLevelTravel = [4, 0, 1];
                    const basePlate = [0, 0, 0, 6, 0, 4];
                    const contractorStage = [1, 1, 2, 1, 1, 2];
                    const deliveryStage = [0, 1, 1, 6, 2, 3];

                    scene.scaleSceneView(0.76);
                    scene.setSceneOffsetY(-1);

                    scene.world.setBlocks(basePlate, "minecraft:polished_deepslate", false);
                    //scene.world.setBlocks([2, 1, 2, 6, 1, 2], "minecraft:stone_brick_slab", false);
                    scene.world.setBlock(contractor, Block.id("createdeliveryrequired:contractor").with("facing", "north"), false);

                    scene.showStructure();
                    scene.idle(12);

                    scene.text(70, "Start by inserting a blank clipboard into the Contractor.", clipboardTarget)
                        .colored(PonderPalette.INPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, clipboardTarget, "down")
                        .rightClick()
                        .withItem("create:clipboard");
                    scene.idle(80);

                    scene.text(75, "Open the board and choose one of the available delivery contracts.", offerTarget)
                        .colored(PonderPalette.MEDIUM)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, offerTarget, "down")
                        .rightClick();
                    scene.idle(85);

                    scene.text(75, "Accepting the contract writes the delivery zone coordinates onto the clipboard.", offerTarget)
                        .colored(PonderPalette.OUTPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.idle(55);

                    scene.world.hideSection(contractorStage, Facing.UP);
                    scene.world.hideSection([2, 1, 2, 6, 1, 2], Facing.UP);
                    scene.idle(25);

                    scene.world.setBlocks(basePlate, "minecraft:polished_deepslate", false);
                    scene.world.setBlocks([4, 1, 1, 6, 1, 3], "minecraft:lime_stained_glass", false);
                    scene.world.setBlocks([4, 2, 1, 6, 2, 3], "minecraft:lime_stained_glass_pane", false);
                    scene.world.showSection(deliveryZone, Facing.DOWN);
                    scene.text(70, "The generated delivery zone marks where the accepted contract must be completed.", deliveryZoneCenter)
                        .colored(PonderPalette.OUTPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.idle(80);

                    // Place the cargo blocks. They become part of the main world section.
                    scene.world.setBlock([0, 1, 1], "create:item_vault", false);
                    let assemblerBlock;
                    try { assemblerBlock = Block.id("simulated:physics_assembler").with("facing", "west"); }
                    catch (e) { assemblerBlock = "minecraft:barrel[facing=west]"; }
                    scene.world.setBlock([1, 1, 1], assemblerBlock, false);
                    // Extract those positions from the main world section into a movable independent section.
                    // This avoids both the duplicate render (showIndependentSection adds a layer on top) and
                    // the disappearing render (setBlocks AIR clears the shared world data both layers read from).
                    const subLevel = scene.world.makeSectionIndependent(subLevelStart);
                    scene.idle(20);

                    scene.text(85, "Mark the vault and physics assembler as the Sable sub-level cargo contraption.", [0.5, 2.4, 1.5])
                        .colored(PonderPalette.BLUE)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, [0.5, 2.8, 1.5], "down")
                        .withItem("createdeliveryrequired:delivery_marker");
                    scene.idle(90);

                    scene.text(85, "Move the marked contraption into the generated delivery zone before the timer expires.", [3.5, 2.2, 2.0])
                        .colored(PonderPalette.BLUE)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.world.moveSection(subLevel, subLevelTravel, 70);
                    scene.idle(85);

                    scene.text(80, "When the marked sub-level enters the zone, its inventories are scanned for the requested items.", deliveryZoneCenter)
                        .colored(PonderPalette.GREEN)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.idle(90);

                    scene.world.hideIndependentSection(subLevel, Facing.UP);
                    scene.world.hideSection(deliveryStage, Facing.UP);
                    scene.idle(25);

                    scene.world.setBlocks(basePlate, "minecraft:polished_deepslate", false);
                    scene.world.setBlock(contractor, Block.id("createdeliveryrequired:contractor").with("facing", "north"), false);
                    scene.world.showSection(contractorStage, Facing.DOWN);
                    scene.idle(20);

                    scene.text(80, "Payment is issued in spurs, either to the linked account or as coins if needed.", [1.5, 2.3, 2.5])
                        .colored(PonderPalette.OUTPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(50, [1.5, 2.9, 2.5], "down")
                        .withItem("numismatics:spur");
                    scene.idle(85);
            });
});
