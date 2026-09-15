Ponder.registry((event) => {
        event
            .create("createdeliveryrequired:market")
            .tag("createdeliveryrequired:delivery_contracts")
            .scene("market_pickup_contract", "Completing a Market pickup", (scene, util) => {
                    const market = [1, 1, 2];
                    const clipboardTarget = [1.5, 2.25, 2.5];
                    const offerTarget = [1.5, 2.6, 2.5];
                    // Centered pickup zone: x=2..4, z=1..3, y=1..2 (3x2x3).
                    const pickupZone = [2, 1, 1, 4, 2, 3];
                    const pickupZoneCenter = [3, 2.5, 2];
                    // Cargo sits inside the centered zone.
                    const vaultPos = [3, 1, 2];
                    const assemblerPos = [4, 1, 2];
                    const cargoSection = [3, 1, 2, 4, 1, 2];
                    // Pull west into the now-cleared market area.
                    const cargoTravel = [-3, 0, 0];
                    const basePlate = [0, 0, 0, 6, 0, 4];
                    const marketStage = [1, 1, 2, 1, 1, 2];
                    const slabsArea = [2, 1, 2, 6, 1, 2];
                    const pickupStage = [0, 1, 1, 6, 2, 3];

                    // Guard against unregistered blocks — .with() throws if the block doesn't exist.
                    let assemblerBlock;
                    try { assemblerBlock = Block.id("simulated:physics_assembler").with("facing", "west"); }
                    catch (e) { assemblerBlock = "minecraft:barrel[facing=west]"; }

                    scene.scaleSceneView(0.76);
                    scene.setSceneOffsetY(-1);

                    scene.world.setBlocks(basePlate, "minecraft:polished_deepslate", false);
                    //scene.world.setBlocks(slabsArea, "minecraft:stone_brick_slab", false);
                    scene.world.setBlock(market, Block.id("createdeliveryrequired:market").with("facing", "north"), false);

                    scene.showStructure();
                    scene.idle(12);

                    scene.text(70, "Start by inserting a blank clipboard into the Market.", clipboardTarget)
                        .colored(PonderPalette.INPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, clipboardTarget, "down")
                        .rightClick()
                        .withItem("create:clipboard");
                    scene.idle(80);

                    scene.text(75, "Open the board and choose one of the available market offers.", offerTarget)
                        .colored(PonderPalette.MEDIUM)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, offerTarget, "down")
                        .rightClick();
                    scene.idle(85);

                    scene.text(75, "Accepting an offer writes the pickup zone coordinates onto the clipboard.", offerTarget)
                        .colored(PonderPalette.OUTPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.idle(55);

                    // Clear out the market block and the slab platform before showing the zone.
                    scene.world.hideSection(marketStage, Facing.UP);
                    scene.world.hideSection(slabsArea, Facing.UP);
                    scene.idle(25);

                    // Reset the base plate so we start from a clean polished deepslate floor.
                    scene.world.setBlocks(basePlate, "minecraft:polished_deepslate", false);

                    // Build the centered pickup zone.
                    scene.world.setBlocks([2, 1, 1, 4, 1, 3], "minecraft:yellow_stained_glass", false);
                    scene.world.setBlocks([2, 2, 1, 4, 2, 3], "minecraft:yellow_stained_glass_pane", false);
                    scene.world.showSection(pickupZone, Facing.DOWN);
                    scene.idle(20);

                    // Spawn the cargo and immediately make it an independent section so it
                    // actually renders on top of the pickup zone — same pattern the contractor
                    // scene uses for its cargo.
                    scene.world.setBlock(vaultPos, "create:item_vault", false);
                    scene.world.setBlock(assemblerPos, assemblerBlock, false);
                    let cargo = scene.world.makeSectionIndependent(cargoSection);
                    scene.idle(20);

                    scene.text(80, "The pickup zone spawns the requested goods inside a sub-level either chest or a vault", pickupZoneCenter)
                        .colored(PonderPalette.OUTPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.idle(85);

                    scene.text(65, "Goods can be claimed in three different ways.", pickupZoneCenter)
                        .colored(PonderPalette.BLUE)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.idle(70);

                    // --- Method 1: pull the cargo out using the physics assembler ---
                    scene.text(85, "Use the physical forces to pull the entire cargo out of the pickup zone.", pickupZoneCenter)
                        .colored(PonderPalette.BLUE)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.world.moveSection(cargo, cargoTravel, 60);
                    scene.idle(75);

                    scene.world.hideIndependentSection(cargo, Facing.UP);
                    scene.idle(20);

                    // Respawn the cargo for method 2.
                    scene.world.setBlock(vaultPos, "create:item_vault", false);
                    scene.world.setBlock(assemblerPos, assemblerBlock, false);
                    cargo = scene.world.makeSectionIndependent(cargoSection);
                    scene.idle(20);

                    // --- Method 2: break the cargo apart in place ---
                    scene.text(80, "Or break the storage apart while it sits inside the zone.", pickupZoneCenter)
                        .colored(PonderPalette.RED)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, [3, 1.6, 2], "down")
                        .leftClick()
                        .withItem("minecraft:diamond_pickaxe");
                    scene.idle(50);
                    scene.world.hideIndependentSection(cargo, Facing.UP);
                    scene.idle(35);

                    // Respawn the cargo for method 3.
                    scene.world.setBlock(vaultPos, "create:item_vault", false);
                    scene.world.setBlock(assemblerPos, assemblerBlock, false);
                    cargo = scene.world.makeSectionIndependent(cargoSection);
                    scene.idle(20);

                    // --- Method 3: extract items straight from the vault inventory ---
                    scene.text(80, "Or pick the items straight out of the storage's inventory.", pickupZoneCenter)
                        .colored(PonderPalette.GREEN)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.showControls(45, [3, 1.7, 2], "down")
                        .rightClick();
                    scene.idle(85);

                    scene.text(70, "Once the goods are claimed, the pickup zone closes.", pickupZoneCenter)
                        .colored(PonderPalette.OUTPUT)
                        .placeNearTarget()
                        .attachKeyFrame();
                    scene.world.hideIndependentSection(cargo, Facing.UP);
                    scene.world.hideSection(pickupStage, Facing.UP);
                    scene.idle(80);
            });
});
