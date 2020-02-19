js7800.ProSystemDat = (function () {
  'use strict'

  var DATABASE = {
    '4332c24e4f3bc72e7fe1b77adf66c2b7': {
      title: '3D Asteroids'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    },
    '0be996d25144966d5541c9eb4919b289': {
      title: 'Ace Of Aces'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'aadde920b3aaba03bc10b40bd0619c94': {
      title: 'Ace Of Aces'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '877dcc97a775ed55081864b2dbf5f1e2': {
      title: 'Alien Brigade'
      ,type: '2'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '2'
      ,region: '0'
      ,flags: '0'
      ,crossx: '15'
      ,crossy: '15'
    },
    'de3e9496cb7341f865f27e5a72c7f2f5': {
      title: 'Alien Brigade'
      ,type: '2'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '2'
      ,region: '1'
      ,flags: '0'
      ,crossx: '15'
      ,crossy: '-20'
    },
    '404f95103b70975a42cb09946dc3adca': {
      title: 'Apple Snaffle (Jul 17-Rev 24) (2009)'
      ,type: '3'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '5c66261d7be74184a047f77233919e06': {
      title: 'Arkanoid'
      ,type: '1'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hblank: '8'
    },
    '212ee2a6e66d8bb7fbf26f343cc8dc19': {
      title: 'Arkanoid'
      ,type: '1'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
      ,hblank: '8'
    },
    '07342c78619ba6ffcc61c10e907e3b50': {
      title: 'Asteroids'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '8fc3a695eaea3984912d98ed4a543376': {
      title: 'Ballblazer'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hblank: '28'
    },
    'b558814d54904ce0582e2f6a801d03af': {
      title: 'Ballblazer'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,hblank: '28'
    },
    '42682415906c21c6af80e4198403ffda': {
      title: 'Barnyard Blaster'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,crossx: '0'
      ,crossy: '10'
    },
    'babe2bc2976688bafb8b23c192658126': {
      title: 'Barnyard Blaster'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,crossx: '0'
      ,crossy: '12'
    },
    'f5f6b69c5eb4b55fc163158d1a6b423e': {
      title: 'Basketbrawl'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'fba002089fcfa176454ab507e0eb76cb': {
      title: 'Basketbrawl'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '3e63be18e480fa63fce5e4c823286e53': {
      title: 'Beef Drop'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '5a09946e57dbe30408a8f253a28d07db': {
      title: 'Centipede'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '38c056a48472d9a9e16ebda5ed91dae7': {
      title: 'Centipede'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '93e4387864b014c155d7c17877990d1e': {
      title: 'Choplifter'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '59d4edb0230b5acc918b94f6bc94779f': {
      title: 'Choplifter'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '2e8e28f6ad8b9b9267d518d880c73ebb': {
      title: 'Commando'
      ,type: '1'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '55da6c6c3974d013f517e725aa60f48e': {
      title: 'Commando'
      ,type: '1'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'db691469128d9a4217ec7e315930b646': {
      title: 'Crack\'ed'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '7cbe78fa06f47ba6516a67a4b003c9ee': {
      title: 'Crack\'ed'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'a94e4560b6ad053a1c24e096f1262ebf': {
      title: 'Crossbow'
      ,type: '2'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '2'
      ,region: '0'
      ,flags: '0'
      ,crossx: '15'
      ,crossy: '10'
    },
    '63db371d67a98daec547b2abd5e7aa95': {
      title: 'Crossbow'
      ,type: '2'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '2'
      ,region: '1'
      ,flags: '0'
      ,crossx: '15'
      ,crossy: '5'
    },
    '179b76ff729d4849b8f66a502398acae': {
      title: 'Dark Chambers'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'a2b8e2f159642c4b91de82e9a2928494': {
      title: 'Dark Chambers'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '95ac811c7d27af0032ba090f28c107bd': {
      title: 'Desert Falcon'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '2d5d99b993a885b063f9f22ce5e6523d': {
      title: 'Desert Falcon'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '731879ea82fc0ca245e39e036fe293e6': {
      title: 'Dig Dug'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '408dca9fc40e2b5d805f403fa0509436': {
      title: 'Dig Dug'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '5e332fbfc1e0fc74223d2e73271ce650': {
      title: 'Donkey Kong Jr'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '4dc5f88243250461bd61053b13777060': {
      title: 'Donkey Kong Jr'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '19f1ee292a23636bd57d408b62de79c7': {
      title: 'Donkey Kong'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '8e96ef14ce9b5d84bcbc996b66d6d4c7': {
      title: 'Donkey Kong'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '543484c00ba233736bcaba2da20eeea9': {
      title: 'Double Dragon'
      ,type: '6'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'de2ebafcf0e37aaa9d0e9525a7f4dd62': {
      title: 'Double Dragon'
      ,type: '6'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '2251a6a0f3aec84cc0aff66fc9fa91e8': {
      title: 'F-18 Hornet'
      ,type: '5'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'e7709da8e49d3767301947a0a0b9d2e6': {
      title: 'F-18 Hornet'
      ,type: '5'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'd25d5d19188e9f149977c49eb0367cd1': {
      title: 'Fatal Run'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '23505651ac2e47f3637152066c3aa62f': {
      title: 'Fatal Run'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '07dbbfe612a0a28e283c01545e59f25e': {
      title: 'Fight Night'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'e80f24e953563e6b61556737d67d3836': {
      title: 'Fight Night'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'cf76b00244105b8e03cdc37677ec1073': {
      title: 'Food Fight'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'de0d4f5a9bf1c1bddee3ed2f7ec51209': {
      title: 'Food Fight'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'fb8d803b328b2e442548f7799cfa9a4a': {
      title: 'Galaga'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'f5dc7dc8e38072d3d65bd90a660148ce': {
      title: 'Galaga'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '06204dadc975be5e5e37e7cc66f984cf': {
      title: 'Gato'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'fd9e78e201b6baafddfd3e1fbfe6ba31': {
      title: 'Hat Trick'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '0baec96787ce17f390e204de1a136e59': {
      title: 'Hat Trick'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'c3672482ca93f70eafd9134b936c3feb': {
      title: 'Ikari Warriors'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '8c2c2a1ea6e9a928a44c3151ba5c1ce3': {
      title: 'Ikari Warriors'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'baebc9246c087e893dfa489632157180': {
      title: 'Impossible Mission'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '80dead01ea2db5045f6f4443faa6fce8': {
      title: 'Impossible Mission'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '045fd12050b7f2b842d5970f2414e912': {
      title: 'Jinks'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'dfb86f4d06f05ad00cf418f0a59a24f7': {
      title: 'Jinks'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'f18b3b897a25ab3885b43b4bd141b396': {
      title: 'Joust'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'f2dae0264a4b4a73762b9d7177e989f6': {
      title: 'Joust'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'c3a5a8692a423d43d9d28dd5b7d109d9': {
      title: 'Karateka'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '5e0a1e832bbcea6facb832fde23a440a': {
      title: 'Karateka'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '17b3b764d33eae9b5260f01df7bb9d2f': {
      title: 'Klax'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'f57d0af323d4e173fb49ed447f0563d7': {
      title: 'Kung Fu Master'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '2931b75811ad03f3ac9330838f3d231b': {
      title: 'Kung Fu Master'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '431ca060201ee1f9eb49d44962874049': {
      title: 'Mario Bros.'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'd2e861306be78e44248bb71d7475d8a3': {
      title: 'Mario Bros.'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '37b5692e33a98115e574185fa8398c22': {
      title: 'Mat Mania Challenge'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '6819c37b96063b024898a19dbae2df54': {
      title: 'Mat Mania Challenge'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'f2f5e5841e4dda89a2faf8933dc33ea6': {
      title: 'Mean 18 Ultimate Golf'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '2e9dbad6c0fa381a6cd1bb9abf98a104': {
      title: 'Mean 18 Ultimate Golf'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'bedc30ec43587e0c98fc38c39c1ef9d0': {
      title: 'Meltdown'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '2'
      ,region: '0'
      ,flags: '0'
      ,crossx: '0'
      ,crossy: '20'
    },
    'c80155d7eec9e3dcb79aa6b83c9ccd1e': {
      title: 'Meltdown'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '2'
      ,region: '1'
      ,flags: '0'
      ,crossx: '0'
      ,crossy: '10'
    },
    'bc1e905db1008493a9632aa83ab4682b': {
      title: 'Midnight Mutants'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '6794ea31570eba0b88a0bf1ead3f3f1b': {
      title: 'Midnight Mutants'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '017066f522908081ec3ee624f5e4a8aa': {
      title: 'Missing in Action'
      ,type: '2'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '3'
    },
    '3bc8f554cf86f8132a623cc2201a564b': {
      title: 'Motor Psycho'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '5330bfe428a6b601b7e76c2cfc4cd049': {
      title: 'Motor Psycho'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'fc0ea52a9fac557251b65ee680d951e5': {
      title: 'Ms. Pac-Man'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '56469e8c5ff8983c6cb8dadc64eb0363': {
      title: 'Ms. Pac-Man'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '220121f771fc4b98cef97dc040e8d378': {
      title: 'Ninja Golf'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'ea0c859aa54fe5eaf4c1f327fab06221': {
      title: 'Ninja Golf'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '74569571a208f8b0b1ccfb22d7c914e1': {
      title: 'One On One'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '8dba0425f0262e5704581d8757a1a6e3': {
      title: 'One On One'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '1a5207870dec6fae9111cb747e20d8e3': {
      title: 'Pete Rose Baseball'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '386bded4a944bae455fedf56206dd1dd': {
      title: 'Pete Rose Baseball'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'ec206c8db4316eb1ebce9fc960da7d8f': {
      title: 'Pit Fighter (Overdump)'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '05f43244465943ce819780a71a5b572a': {
      title: 'Pit Fighter'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '33aea1e2b6634a1dec8c7006d9afda22': {
      title: 'Planet Smashers'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '2837a8fd49b7fc7ccd70fd45b69c5099': {
      title: 'Planet Smashers'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '86546808dc60961cdb1b20e761c50ab1': {
      title: 'Plutos'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '584582bb09ee8122e7fc09dc7d1ed813': {
      title: 'Pole Position II'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '865457e0e0f48253b08f77b9e18f93b2': {
      title: 'Pole Position II'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '1745feadabb24e7cefc375904c73fa4c': {
      title: 'Possible Mission'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'ac03806cef2558fc795a7d5d8dba7bc0': {
      title: 'Rampage'
      ,type: '6'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '442761655bb25ddfe5f7ab16bf591c6f': {
      title: 'Rampart'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'bfad016d6e77eaccec74c0340aded8b9': {
      title: 'Realsports Baseball (Overdump)'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '383ed9bd1efb9b6cb3388a777678c928': {
      title: 'Realsports Baseball'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '8f7eb10ad0bd75474abf0c6c36c08486': {
      title: 'Rescue On Fractalus'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '66ecaafe1b82ae68ffc96267aaf7a4d7': {
      title: 'Robotron'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,dualanalog: 'true'
      ,hsc: 'true'
    },
    '980c35ae9625773a450aa7ef51751c04': {
      title: 'Scrapyard Dog'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '53db322c201323fe2ca8f074c0a2bf86': {
      title: 'Scrapyard Dog'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'b697d9c2d1b9f6cb21041286d1bbfa7f': {
      title: 'Sentinel'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '2'
      ,region: '0'
      ,flags: '0'
      ,crossx: '13'
      ,crossy: '-13'
    },
    '5469b4de0608f23a5c4f98f331c9e75f': {
      title: 'Sentinel'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '2'
      ,controller2: '2'
      ,region: '1'
      ,flags: '0'
      ,crossx: '20'
      ,crossy: '25'
    },
    '2d643ac548c40e58c99d0fe433ba4ba0': {
      title: 'Sirius'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'cbb0746192540a13b4c7775c7ce2021f': {
      title: 'Summer Games'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'cc18e3b37a507c4217eb6cb1de8c8538': {
      title: 'Super Huey UH-IX'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '162f9c953f0657689cc74ab20b40280f': {
      title: 'Super Huey UH-IX'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '59b5793bece1c80f77b55d60fb39cb94': {
      title: 'Super Skatebordin\''
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '95d7c321dce8f57623a9c5b4947bb375': {
      title: 'Super Skatebordin\''
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '44f862bca77d68b56b32534eda5c198d': {
      title: 'Tank Command (Overdump)'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '5c4f752371a523f15e9980fea73b874d': {
      title: 'Tank Command'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '1af475ff6429a160752b592f0f92b287': {
      title: 'Title Match Pro Wrestling'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '3bb9c8d9adc912dd7f8471c97445cd8d': {
      title: 'Title Match Pro Wrestling'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'c3903ab01a51222a52197dbfe6538ecf': {
      title: 'Tomcat F-14 Simulator'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '682338364243b023ecc9d24f0abfc9a7': {
      title: 'Tomcat F-14 Simulator'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '208ef955fa90a29815eb097bce89bace': {
      title: 'Touchdown Football'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'd12e665347f354048b9d13092f7868c9': {
      title: 'Tower Toppler (Overdump)'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '8d64763db3100aadc552db5e6868506a': {
      title: 'Tower Toppler'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '32a37244a9c6cc928dcdf02b45365aa8': {
      title: 'Tower Toppler'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'acf63758ecf3f3dd03e9d654ae6b69b7': {
      title: 'Water Ski (Overdump)'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '427cb05d0a1abb068998e2760d77f4fb': {
      title: 'Water Ski'
      ,type: '1'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '3799d72f78dda2ee87b0ef8bf7b91186': {
      title: 'Winter Games'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '05fb699db9eef564e2fe45c568746dbc': {
      title: 'Xenophobe'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '70937c3184f0be33d06f7f4382ca54de': {
      title: 'Xenophobe'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'd7dc17379aa25e5ae3c14b9e780c6f6d': {
      title: 'Xevious'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'b1a9f196ce5f47ca8caf8fa7bc4ca46c': {
      title: 'Xevious'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'e1f0a708fbc107001fc49ce48151fefa': {
      title: 'Bentley Bear\'s CQ Wonder Hack'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    '34483432b92f565f4ced82a141119164': {
      title: 'Bentley Bear\'s Crystal Quest'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
      ,xm: 'false'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    'ad35a98040a2facb10ecb120bf83bcc3': {
      title: 'Bentley Bear\'s Crystal Quest'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    '707e98991390a4e8874508e5ed4edeef': {
      title: 'Bentley Bear\'s Crystal Quest'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'true'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    'ec81468e31fde04b67b5b99b7da8edb1': {
      title: 'Bentley Bear\'s Crystal Quest'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'true'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    '87484e54ab8e45aac978dcc3efd924e5': {
      title: 'Bentley Bear\'s Crystal Quest P'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'true'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    '4d0b5bf95e4cb366990dbaeecb7f706d': {
      title: 'BentleyBear'
      ,type: '2'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'true'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    'ba8d0d0be821b29a0ca9a6fa031a970d': {
      title: 'BentleyBear'
      ,type: '2'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'true'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    '1926b9b322ac0f8f36e119b524aa48bd': {
      title: 'Bentley Bear\'s Crystal Quest P'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'true'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    '3e4b11a99271fd807b5c6db411dc6643': {
      title: 'Bentley Bear\'s Crystal Quest P'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,leftswitch: '0'
      ,swapbuttons: 'true'
    },
    '8385daccee02ccda081eed45eba1479d': {
      title: 'Legend Of Silverpeak'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '9ea73fd07e43f61209876d33e6f6dc04': {
      title: 'Desert Falcon HSC Support'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '90fa275f9f2a65b341796e11b2f551af': {
      title: 'Winter Games Alternate Version'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '299d31c8e181fdd011df2014451bdf0f': {
      title: 'Crazy Brix (Joystick)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,leftswitch: '0'
      ,rightswitch: '1'
      ,hsc: 'true'
    },
    '3209039148e0b7a2b1927bd05bae4685': {
      title: 'Tric Brix (NTSC) (Joy) (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,leftswitch: '0'
      ,rightswitch: '1'
    },
    '32e937e7796db3a01e9bcf5fe93929b0': {
      title: 'Trix Brix-NoLvl13-NTSC-Joy-Hack'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,leftswitch: '0'
      ,rightswitch: '1'
    },
    'a60e4b608505d1fb201703b266f754a7': {
      title: 'TiME Salvo'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,dualanalog: 'true'
    },
    'dbb493bdc4e98436dbbfd4f2e4413397': {
      title: 'Dig Dog (No Harp) (PAL)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '54829fb744d4cd7a794ccd2580df7c3d': {
      title: 'Dig Dog (Harp) (PAL)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'f2047b149e72be8f97e9671314748ec4': {
      title: 'ReZolve'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '42fa4bd854a2813b19099da524461a64': {
      title: 'Battlezone (PAL)'
      ,type: '7'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'f5150c0fc1948832211e57852abb0c6e': {
      title: '7800 Utility Cart'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,xm: 'true'
      ,hsc: 'true'
    },
    'a8458c510fdd71a1f9cc4c0b243b177a': {
      title: 'Battlezone (NTSC)'
      ,type: '7'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '67ee0011090a6ada38f3eef8a3020fb4': {
      title: 'Apple Snaffle V1.25F'
      ,type: '1'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '13f11c4e8c019ee326b571d059accea4': {
      title: 'Froggie'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
    },
    '608fa599f06f935e05d445ff236f6d7a': {
      title: 'Asterix Quest (BBCQ Hack)'
      ,type: '2'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,swapbuttons: 'true'
    },
    'a65f79ad4a0bbdecd59d5f7eb3623fd7': {
      title: 'Asteroids Deluxe (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '3d38281ed8a8d8c7cd457a18c92c8604': {
      title: 'Astro Blaster'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'a51e5df28a0fe8c52e9d28fb5f8e44a6': {
      title: 'Astro Fighter'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '78b1061d651ef806becac1dd3fda29a0': {
      title: 'Beef Drop'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '6010a398070dfacb4c0173d75d73c50a': {
      title: 'Beef Drop (New Levels Hack)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '9fa7743a016c9b7015ee1d386326f88e': {
      title: 'b*nQ'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'af1c8f89f0aef0d9e2e15901d6e0539a': {
      title: 'Centipede PMI PAL'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '2d2fe4da9f1bae102fa8ca2d8830a626': {
      title: 'Crazy Otto (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '40bd21c9698c6b8e71b703f860c11359': {
      title: 'Cyb Ur'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'cf3c5a32205506af3c09e6e0c82cfa09': {
      title: 'Donkey Kong PK-XM Concerto Demo'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
      ,hsc: 'true'
    },
    'c956d5ce7417cc2dab61a9afd8f372d0': {
      title: 'Donkey Kong PK-XM Demo NTSC v1.2'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
      ,hsc: 'true'
    },
    'df700753d8ba9353a7045868778eef6d': {
      title: 'Donkey Kong PK-XM Demo PAL v1.2'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'true'
    },
    '098b209aac126f2c2edbc982df09cd1b': {
      title: 'Double Dragon GPX Hack'
      ,type: '6'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '4565867aa6e5cc710a7edaf6d434b3af': {
      title: 'Double Dragon Sprite Hack Test 2'
      ,type: '6'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'fab1290f9a4c4f2b4d831c8a57f969f5': {
      title: 'Draker Quest (Beta 4)'
      ,type: '1'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'a9f29004412621f20ad9f5c51cc11486': {
      title: 'Draker Quest II'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'fa4aec407b90e9360b9cfeb41839b09a': {
      title: 'Dual Pac-Man (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '6287727ab36391a62f728bbdee88675c': {
      title: 'FailSafe (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '84c4b4ed75f41417ac7cbceac71e3856': {
      title: 'FailSafe (PAL)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '2fb85cab6e0f0582e3057bf1ac33c74a': {
      title: 'Fatal Run Graphics Hack RC1'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'e7d89669a7f92ec2cc99d9663a28671c': {
      title: 'Frenzy (w-Berzerk)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,xm: 'true'
      ,hsc: 'true'
    },
    '6053233cb59c0b4ca633623fd76c4576': {
      title: 'Froggie'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'ee09789d61a693e387ccdc9a2f025b43': {
      title: 'Galaxians (Hack)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '3d12489c553cb1a90c8ebd6534383fa1': {
      title: 'Gorf'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '1e21bf1d9d7b3c0cebaac576964c9eb2': {
      title: 'Graze Suit Alpha'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '46dbc5108151e963b120cdaedd7d6d4c': {
      title: 'Hangly-Man (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '25ce1f5dfc909bcb46086e414d6a0f30': {
      title: 'Hearty Manslapper'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '61809684eefd6cbb2963574ffb0a3fab': {
      title: 'Humantron 2084'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,dualanalog: 'true'
    },
    'bf070f04c8fc7ec721b9506b63b48470': {
      title: 'Impossible Mission (Blue Hack)'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '4a811d87d1730a334a21e7bda9fe535a': {
      title: 'Impossible Mission (Green Hack)'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '05c21a88fd736d59d28b1d95e79840b6': {
      title: 'Impossible Mission (Red Hack)'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'dde5703c488c4ad5268c2696704f1c68': {
      title: 'Impossible Mission (C64 Hack)'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'f4216cb77cd6db15225968f315c9793f': {
      title: 'Impossible Mission C64 GPX Hack'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'e54edc299e72d22d0ba05d16f3393e8c': {
      title: 'Jr. Pac-Man (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'e274e7285bb8f97d4d9acddc8497ed9e': {
      title: 'Jr. Pac-Man (PAL)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '5fb805f2b69820a9b196f5fed2a23c99': {
      title: 'Klax (Prototype) (Fixed)'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '114e215b8cfc8698bc0286a79e1cb9b2': {
      title: 'Merry Xmas 2012 e-card v1.10F'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '0'
      ,region: '0'
      ,flags: '0'
    },
    'eb3c1443f4a25806de4657e106d504e8': {
      title: 'Meteor Bath (Hack) (RC2) (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'c3f6201d6a9388e860328c963a3301cc': {
      title: 'Meteor Shower (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'dc0bf52475030c05671dd187e9a99f08': {
      title: 'Meteor Shower (PAL)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '9ff38ea62004201d870caa8bd9463525': {
      title: 'Moon Cresta (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '675c5b79238eaa641f2e3fe9c5e22589': {
      title: 'Moon Cresta (PAL)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '89f90b661d1b79e956b10bb6a9771f78': {
      title: 'More Beef Drop (Hack)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'd8dbb5c4d7d02e6b0627df8f657a13b4': {
      title: 'Ms Pac-Attack (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '27c133965dfd80b3acb1ed598817aea0': {
      title: 'Ms Pac-Man (Fast Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'cf007563fe94cacf5ea5295dc93ce9ef': {
      title: 'Ms Pac-Man (PacManPlus\' Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'cad1e733986bce1ee4c9da73de1dcff1': {
      title: 'Ms Pac-Man Invincible Fast Hack'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'db768297985178cec034c12a41d6f1a7': {
      title: 'Ms Pac-Man 320 Invincible NTSC'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '889fc7e7ba5c807be44e85ba7a6bd26e': {
      title: 'Ms Pac-Man 320 (NTSC)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'bc56f803d65658f92c17e6c2b271a507': {
      title: 'Ms. Pac-Man 320 (PAL)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '2a17dc5a61be342dd00af719cc335852': {
      title: 'Ms Pac-Man 320 Sound Upd NTSC'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '99055c3e627bbc17fc81cbe0b3ae176c': {
      title: 'Ms Pac-Man 320 Sound Upd PAL'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'a69347c8a681b8e94f79d8d848998007': {
      title: 'Ms Pac-Man Twin'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '79202cb7d2bc150ffca0c96a4d8b42cf': {
      title: 'Multi-Lock On'
      ,type: '1'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '04edf4f3c6b186147c1117359c8f5076': {
      title: 'Pac Pollux (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
      ,hsc: 'true'
    },
    '8338eca612eedf6ddec57d54942863e7': {
      title: 'Pac-Man (Fast Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '575c18f77a4215332bf56d0080a234b8': {
      title: 'Pac-Man (Ferrell\'s Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '72ec68627bb7d879ae35a71d7679f71e': {
      title: 'Pac-Man (PacManPlus\' Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
      ,hsc: 'true'
    },
    '60982f430b762343d53e48f70acfa6d0': {
      title: 'Pac-Man 320 (NTSC)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '180121ecb4aabc7daa945b355e15c254': {
      title: 'Pac-Man 320 (PAL)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '4fb119f6db26380abba03e4ce3ca04c8': {
      title: 'Pac-Man Christmas 2018 Hack'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '0b7635d0f39ff97d1e841888e1b23b7b': {
      title: 'Pac-Man Christmas 2018 Inv Hack'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '5013b69cb05b21a1194ce48517df7bfc': {
      title: 'Pac-Man Collection'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    },
    '6f80cac59023a69afa26182eabbdfbad': {
      title: 'Pac-Man Collection New Monsters'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'b1685dcbaf1b578cb1b6643666d813e4': {
      title: 'Pac-Man Collection 2 (Hack)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '4748a62d5c628fefd28df5de5567edec': {
      title: 'Pac-Man Handheld (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '1d7d65997d7cd0858e9bee71ded272aa': {
      title: 'Pac-Man Plus (Ferrell\'s Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '791e55db03903988280388573a2fcdc1': {
      title: 'Pac-Man Plus (PacManPlus\' Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
      ,hsc: 'true'
    },
    'd0bf3b841ad4bbd356e9588874749a13': {
      title: 'Pac-Man Plus (320 Mode)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
      ,xm: 'true'
    },
    '1482beef7dbdb122f6bb4b03640888f2': {
      title: 'Pac-Man Plus (320 Mode)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'true'
      ,xm: 'true'
    },
    '8cb66c6ed5b379181b1420d8e4758834': {
      title: 'Pactron 1984 (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,dualanalog: 'true'
    },
    'c1ac9987a9483e200c338ccbd2ee94b5': {
      title: 'Pactron 1984 Extreme (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,dualanalog: 'true'
    },
    'b5c9f0bf5b5763a923b7f370376b1849': {
      title: 'Panda Racer'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'b55e4d255173e5b2c2e620f3186a1ecc': {
      title: 'PC-Man (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '26897ab47b8c5d3b57d3cc235d7635d8': {
      title: 'Chomper (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '2b1f78aaa2b8de5dae3ee4b93ab678f4': {
      title: 'Christmas Pac-Man (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    'a3a4dbd27c80eff9bef51f73cd26f1d5': {
      title: 'Invisible Maze Pac-Man (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '43a0059ff1b5bf76e0c7023fde7c33a5': {
      title: 'Jawbreaker (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    'a8e752d108efceff504ae4edc4766b75': {
      title: 'Munchkin (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '04c985ebbd0bea4c557207e69b8cbd8f': {
      title: 'Munchman Texas (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    'bc1f56d7cc14f15ddfcba5e21e19937b': {
      title: 'YPS Quest (Hack)'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,leftswitch: '0'
      ,rightswitch: '1'
    },
    '8e0c5fc77b27422a39d86ac2e57dc73d': {
      title: 'Xmas Time (Hack)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'f9fa5107ed213e709858d8876359309e': {
      title: 'POKEY (Sample)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '2370f7ce1b91fc775bce3e72454f908a': {
      title: 'Pokey Kong (Hack)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
    },
    'b4f137e85588ce42d302102ba7215437': {
      title: 'Prickle (POKEY Utility) (v09)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
    },
    'e1b01dd7e842d2b682ef48f689d5a4eb': {
      title: 'Rider of the Night'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '43525a0405184875c2ecfd0196886a34': {
      title: 'Rip-Off (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,xm: 'true'
      ,hsc: 'true'
    },
    '106b409c6f4c219b1a3b3d099ead3b2b': {
      title: 'Rip-Off (PAL)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,xm: 'true'
    },
    '03daa19b7aae2d27e61f2a4dbe3b9b79': {
      title: 'RMT POKEY Player Test (Demo)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '03935b9a1f2561bada58fcd5d9fd27de': {
      title: 'Robotron X (NTSC) (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,dualanalog: 'true'
    },
    'd27ed8f883af9b4ee3b5570f30e9ff71': {
      title: 'Rowdytron (NTSC) (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,dualanalog: 'true'
    },
    '01c7bc3cd8375e353c8aa837fe1262ec': {
      title: 'RPG Player and Map Tiles (Demo)'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    'a3a85e507d6f718972b1464ce1aaf8a4': {
      title: 'Scramble'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,xm: 'true'
    },
    '32f1a1b5a7e3b4493c3b7b637aeea7d8': {
      title: 'Scrapyard Dog Graphics-Life Hack'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '6e27f73bd4a49b647bcd58bc5f8b739d': {
      title: 'Srapyard Dog (Graphics Hack)'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '0070751edb8bbf4dd4a685f58b5b72c5': {
      title: 'Scrapyard Dog Unlimit Lives Hack'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '9bd70c06d3386f76f8162881699a777a': {
      title: 'Serpentine'
      ,type: '3'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
    },
    '95c8a795e30640c9ec82609872c80517': {
      title: 'Shark Attack (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,rightswitch: '1'
    },
    '1c8139c584e1cf5c6afdd2f3455a2446': {
      title: 'Sky Scraper 2115'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    'ca1c27b53fcfb9fed83bc9e92920707c': {
      title: 'Soft Cell-Tainted Love MusicDemo'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '0'
      ,controller2: '0'
      ,region: '0'
      ,flags: '0'
    },
    '771cb4609347657f63e6f0eb26036e35': {
      title: 'Space Duel (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    'a84c1b2300fbfbf21b1c02387f613dad': {
      title: 'Space Duel (PAL)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
    },
    '6adf79558a3d7f5beca1bb8d34337417': {
      title: 'Space Invaders (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '0f4bd5800359a62a5874b93dc92a47f1': {
      title: 'Spire of the Ancients'
      ,type: '2'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
    },
    '02508e6df5e173b4063a7e6e63295817': {
      title: 'Super Circus AA-NTSC-Joy-0450'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'true'
      ,xm: 'true'
      ,hsc: 'true'
    },
    '81cee326b99d6831de10a566e338bd25': {
      title: 'Super Circus AA-NTSC-joy-4000'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,hsc: 'true'
    },
    '1c9b0bb028e63f83a2d1c1def675acc9': {
      title: 'Super Circus AA-PAL-Joy-0450'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,xm: 'true'
    },
    'f4ad1a1d732c2c8cdbd21dabaf38a46c': {
      title: 'Super Circus AA-PAL-Joy-4000'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    'f41f651417c234104d37296477fa29eb': {
      title: 'Super Cobra (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    },
    '7ab539bb0e99e1e5a1c89230bde64610': {
      title: 'Super Pac-Man (NTSC)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    },
    '61aa4a074ad08c524fbee88d15e369ea': {
      title: 'Super Pac-Man (PAL)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '3632fcc732a33591b91f0eea2c01e599': {
      title: 'Tank Command-Color Sprite Title'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    'd0b87d349d6d5e40920cc4ff95253339': {
      title: 'Tank Command-Midnight Run Hack'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '9cb3848416e39ebf642357dbee3e5970': {
      title: 'Tempest (BBC X-Port 1) (v1_00F)'
      ,type: '3'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '0'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    'b1ec7bd809ab3deb746c5a5eb2efaecb': {
      title: 'UFO!'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '43f8e9cec3d9991017709f48a7aa22f6': {
      title: 'UFO! Genesys (Hack)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    'f85d506f5933427c8de664be0c5510a3': {
      title: 'Ultra Pac-Man (PacManPlus\' Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    },
    'f83849cf3f5ac95856e8f93ee90d5a8d': {
      title: 'Upside Down Pac-Man (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
      ,rightswitch: '1'
    },
    'c62632545c91823f72f6f14b19766804': {
      title: 'WarBirds'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '40913dcf24a623c1dc2495a1c4931b48': {
      title: 'Water Ski - Title Color Realign'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '8b49549763f4f0e42a23942b8df6b248': {
      title: 'Water Ski-Titl Col Reali Trained'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '7db031f1c4dc957719812fe68ee42531': {
      title: 'Xevious X (PAL) (Hack)'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '5837c4ac8b481fb98381adfd2fe87969': {
      title: 'Armor Attack'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'true'
      ,hsc: 'false'
    },
    '05b04e9822a75ceeeaa2eb106ffe768e': {
      title: 'Adventure Map Demo'
      ,type: '4'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '727b6d447e21af42b3767f9c2cff6012': {
      title: 'DFHSC78.BIN'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    },
    'c3107d3e3e17d67e3a11d47a5946a4f3': {
      title: 'DONKEY KONG XM'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    },
    '8caa29a8d9214ca02697b3357102309a': {
      title: 'DONKEY KONG XM'
      ,type: '2'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    'b3143adbbb7d7d189e918e5b29d55a72': {
      title: 'DungeonStalker_Final'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    'e547492ebd342e57c28bb235546da299': {
      title: '3D Demo'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '89b8b3df46733e0c4d57aeb9bb245e6f': {
      title: 'Armor Attack II'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '7cdfbe37634e7dcd4dc67db7edbcd3ba': {
      title: 'Baby Pac-Man'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '1ae0b27d47f19d59652168fad3966375': {
      title: 'Crazy Otto'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '35433868dfe383ae21fd77507e5a478d': {
      title: 'Ms. Pac-Man (320 Mode)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'true'
      ,hsc: 'false'
    },
    '59f1c1e7f6653a4e66ea898ce6eab50f': {
      title: 'Pac-Man Collection! v2'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    },
    'c2b42639718d005a6d0aefa0809f77db': {
      title: 'Pac-Man Collection! v2'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '1'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'false'
    },
    '80ffad3edb50f0970e780a727a4524dd': {
      title: 'Pac-Man (320 Mode)'
      ,type: '0'
      ,pokey: 'true'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    },
    'ff8d8283553af5d5dbdaddb5781b4896': {
      title: 'Vector Asteroids'
      ,type: '0'
      ,pokey: 'false'
      ,controller1: '1'
      ,controller2: '1'
      ,region: '0'
      ,flags: '0'
      ,pokey450: 'false'
      ,xm: 'false'
      ,hsc: 'true'
    }
  }
  return { DATABASE: DATABASE }
})();