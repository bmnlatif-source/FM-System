import { useState, useMemo, useCallback, useEffect, useRef, Fragment } from "react";
import { supabase } from "./lib/supabase";
import { listYachts, saveYacht, saveYachts, listPersons, savePerson, savePersons, deletePersonRow, listCompanies, saveCompany, saveCompanies, deleteCompanyRow, listOperations, saveOperation, saveOperations, deleteOperationRow } from "./lib/db";
import { Instagram, Facebook, Linkedin, Twitter, Youtube, MessageCircle, Music2, Link2, Upload, Search, Bell, Settings, Plus, Download, SlidersHorizontal, Filter, ChevronRight, ChevronDown, ChevronUp, Ship, Compass, Users, ArrowLeftRight, Stamp, PlaneTakeoff, Truck, LayoutDashboard, Calendar, Clock, Check, X, TrendingUp, TrendingDown, Eye, FileText, MapPin, Globe, AlertTriangle, MoreHorizontal, RefreshCw, ExternalLink, DollarSign, Building2, UserCircle, ClipboardList, Fuel, ShoppingCart, Receipt, CreditCard, BarChart3, ArrowUpDown, Briefcase, Shield, Hash, BookOpen, Waves, CircleDot, Activity, AlertCircle, Info, ChevronLeft, Layers, Database, Edit3, Trash2, RotateCcw, Lock, Anchor, Navigation, Image as ImageIcon } from "lucide-react";

// SAP FIORI DESIGN TOKENS — Per Spec Section 27 adapted to Fiori
// OFFICIAL Felix Maritime brand tokens (from the Felix brand book / letterhead).
// Felix Navy = primary (chrome, headings, links, structure). Sunset Coral = the
// single accent, used sparingly (one key action per view). Ocean Blue = links/
// secondary. Felix Gray = body text. Status + agency colours kept functional.
// Brand font is Avenir (licensed); Mulish is the closest free web substitute (loaded in index.html).
const S = {
  shell: "#0F4F73", brand: "#0F4F73", brandL: "#E8F1F5", brandD: "#0A3A55",
  bg: "#F1F6F9", surface: "#FFFFFF", border: "#D7E2E8", borderL: "#EAF1F4",
  text: "#4A4A4A", textS: "#6B7178", textH: "#999999",
  green: "#107E3E", greenBg: "#F1FDF6", orange: "#D85A30", orangeBg: "#FBEFE9",
  red: "#BB0000", redBg: "#FCEAEA", blue: "#1A6B9A", blueBg: "#E8F1F5",
  purple: "#6E5BA8", purpleBg: "#F0ECF8", cyan: "#1F8FA8", cyanBg: "#E4F4F7",
  gold: "#C08A2E", goldBg: "#F8F1E3",
  navy: "#0F4F73", line: "#B5D1DE",
};

const FELIX_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAgA0lEQVR42u1caXgUxdZ+q6p7ZpJM9gUCyCpb2I2AIN4JgoiIV1Q6rqgogguLgIisnRbZQUAUDYKogH53xn1BVLwhbrgQUSBhj4Q9CdkzmaW7q74fMwmBhMUr98p3P87z5HkYpqu6+vSpc97znlMDXJbLclkuy2W5LP+NoihOBoBc1sR/sbBLcE0EANT0j0K9zXpc23vQ0PKczI89l6ol0ktuRapKAODb3/Oa/F5UlpFbcOLq4HamlxX4B8QA4X6fl+u6YVzKW1i6NIxOpdrm4MvcDADgJignhBCfbnAAcOWWUDgC1qmmgGuaJgCI/7fOVwhB4FClM30bDTrmO+e90T769qmi7/jFg+jZnLVDlVRV/Ut30UV3zIriZC6XwgEizqI5gtRUCpfLrI5iN05/qf2evMI+jJIUn99o7vPpdsZotNfgV9gs9IRp8pMSZRWE0QNWmW1tHB2ZueWlib/6A8YJKAqD08lByNkskjgcKsvM1IxLXoGnKerMB1KcDK5UkwCYsvbdxHe/2jm8ssp/OwiJZ4QclGRkgZPfZInkATg4c0T/sudWZ8RZZdbI49GbuP16e8bINaZAa5tF9lsYff/q9lekr3v6wQO81vz1POP/ja3udO609J+4fPiK9eujq31bjTKDAWv5G+/Ftnzg2eVN700raDks7euuD896QFFfjTlziw6etrRPx5ELxqR/uTXyzC2+bMOGiGseX5ja4r6Zn15xz8yCVg9o6x+Y+3JzUq2w4H2r7y+EkAZOeelhRX3RfrENh1xEa8Ok5asS38g8cFiW5O+PvK3dSAipSh45Us5auVK3UqDTqPmP55d7ZjIitrZrkqBtmvfEz6f2lEqTFEg5BeCDro3v+OPuo9squIREm/j24FNDrr965Upk7UkUyMwRwKntn6qmt8s6VKC6PXr/UKu0NG/tzNl+DjhUVcrUNEMIwZJGzPlHsVfc0b9NfI/16qifFUVhrqALuZTwGwWA60bP6xF521R/82HPfitO7o0AgIyMDHvLYdpnV9yjHuo2cs5AqbZBKU4GCFLjy4QgiXdOvlUe9JSgN4zR7YMnFL+YkRG0nOB1QpBAmqewakVeN35xj6b3ztzZ7B71p8npzqZBy7MmjZj9SVSqKm6cuCyVklPrvFSTVwYAgyYu7Bl521SzcerU70Y/v+baJnfNONhyWNqHQojQ6uvqRE8hCFRVAoCrRsxNjrn9Gbdt0EQj4bbJP5+aXmFnKkBVVQqHQwKAEIuEtsNnvdr4rpnFD2iv9GukTHsn5s5nxW3Tlw2lQSu/5P2gIwBNMOSZRclRt04uDL9tmug1duHioNUFLedMy1Vq/m/xqxtjrp+wdGrz+9Rj9r8/LdoNf/az1BkvdWe0trdRaR1LCs5DAPQes2BMxO3TROTfn/Yq014cWA15/k8A6ZQU8MxM0O6dWx/55WCpu0IXUQfzy9q+88EH4UOGDKlISsoWp/xmKoWmmRKA29T0pjar1HnpV9+9eKLc18xCjOIQme0+WuweeLTMN/C6cQuXUJgfG9xy4rtl43eZGgAoDCIAX1QAGlzmtl8/D7t5/nd9ualXRYdaquLjok4AgJLQQbgueRwYVIoQTtb6/rRDMiNv39Kz9durNuX8IDOyZbM2cGD79n0qkDxSRtZKnQHo/eT8q06U+Wd6/fza1g0jXnf79KptR9zT4mXvzEE9On55sKCo++GT5e26t2zs3JZ7ZHxxld5blqQdDcKt87JemfLPQCRQGOAyT+7dG9F55rpPqnTjugEdE5Ozj5T2LCmvWvTINd2u0CZml0IFoGn80s2FU12UEZd55f1pr3EuDuaue3b8gsfu/en2bs16G1z0uF7b+NWBAwciadZKffv27dGth89ec+BE5aec42CXptHXZSweP8nt8R1kEmOcMLHnaKHtRGnF3uTWDTZlbT/0a/Ya9Y5B3dp2t8nSlmMVnvWN7pr5ztilbzWwsHfMl50fN+4yc21Glc/oeWO7Btc6tTG/7F494+UQq/Thqh9/fY9B48jJIZeuBQZBbPLIOQMKyt0b7ruhS+Lch1NPJqmqnKNp/hHz1lzz/tYDmyTCc8Nk9qNJaC8QcqRf2yaj1swYkRdEuqTF3TOmHPdLs+1m5ZPd2rbaVlpZHhtpk4nE6E8bFxQfAwIWlL7+o7h5G7ct1w2jp+7Xj/pNkSQAXNsqfsCni5/KSh45Us4qKeHC6SSNU6cciQkPSdv5mvoKFIXhIkIYetFehCtbCCHo8eLS9PjIsLFzH04tdDhUlqNp/iRFtax6ZvgPrWNDR5V5eae8Ys+I4nL3lQfXPnL7azNG5ImRI2UoqgWA8JtGFARgsTDdIgnq9fm5bGGcUdkCaDwQdVVp1L1/P3l4rXq3MM1DhVVGn3KvERMmk682LH4qC8kB7KlAASHEaNU44f4St3fh5HnpkXA5eRDYX0IKdKgM0HiH4dojEpP4jlXTV0BRWGamZgJAfAE4oFKD8GJCKQTXYXJuSZ3x4RUA4EhMFCjYzAkAk4tYAQEquK/C7zEFuLWs3MNLy8tDABAtLU0oCR0EAKgvrmvmNXgrRgmYxQbZIp8EANj3CABwuVJNKAr7fumEL2TGtrmyj04HiEBKGru0FJipmUIIUuHxT46PidJ0k8NRkFSdg5LMTHAh0kRxhS8tJlT6Pi7clmmz2Sozdh1+c8MPGyIyNc1AZVtCAICIOCE4wu12XyhhemSoTQ+1smKLJRCmkketlFyuVHPJ2+83X5655xtGqSW5eey8lgn2fxi62W/p2g0RSEmpZWUKTIAkRNif9nr1B9VlGyKQqZkX0wr/NPsCAJ0emt2v8dBnDgkh5KBvrckuCIB2D2gzr7hr6j4hBJEI8PiSN3vGDJ3mjlembt2wYW1EIIirNO62yd/IgyaJiFsmHov8+1PHYodM2pH08KwN3UcvHPvE8jdiAWDaC2+2aHDnzGMxd0w9Ounl9a0BQAbQ4t4ZmU3vmvoaqQXqq3EjI0DTu6dtb/+Q9ujFxIV/2gJdcIEA8Or6o6Ehls8JIXpgS0MAgsDl4g+pr8ZUeLyTOjVvdB8hRBhDFcuK8ff/OLBz02sMTto+sGbX5mVr10bIVOOEiATBTQAiEkKE+zjpuLfQd9OJorIxiVKIbchTC1qt2Lx7CxfCeOz6TtcsfOzefc0cD9h0qPS69o3uMQyR2nfMwiS4XLwGbDtATQFitchry93euwmAQE59KWxhl8vkQlCv7r86JjrCCYBU+yg40hgA8fnu3NGMkqzP543+MRgF/Q6HKr01c9SOW7okXuM30VJ7P+ef/9iQmWiYQmYWGzq3Snzg+k5tHF1bxM/rmBi6MDLMmlZSeVLfnFv6o01m3meH9ug1+4m7DytOJ8vLfMMLB+ib0x87apGY80Bh2VQAAtUsdwo4ANE0OuJdCLSZvPy9WMB1Ubbxn1Ng8A33Gb+kvWFyNvTqTt8DEC5XKq/tGwnIfRH20GUmQBQoga8yNQMOVXpz5ujsfm1jrtG5aDP+jc8/D7hNgfziyoLsQwUlZW5ffnLT+MUx9pB2q77N3W6zSCWz7k7u/VjqLUcVxclcqUH+LwUcEKRBdMRSg5v9Vq36IBwBApUEwTPZvGxiLqW0/Kvsfb0AQEl10b9WgTkdCADkF5d1kyg9Mfn+G93BOUVQuaLP+PlJpuChd3Rt8+Vpyg0o2IBDld6b+9TupFhrn1CLpUA3zCgqgCi7DSFhxG9yHlnuh17h8fWIDLEdGtOvXZ8RQ4YcCzDftchTTeMAwc+vPL2dgJSu/nV/P0CQmmqew8G4ECCgOUWV7mQAcBVk/2kLlP7VwOEqyCYoyJbgUInH629DCPm9W/JIOcueyAAYzTZDygN8h0+UdWOE7tVGp1Zi4BgrPDF1QGwTZXzIj6u17cPmvjHp8LfbfxFcR0WVtzLMEu7zm27ij5K4rUjamTF7+LOtWrUqv3LMGKtre7ZZTyCQOGBQavx6oqg0GSAfuApUOViMkoQjBZwbe9wes2VwrASHitNe6H9CgbXevAEA5K7pcVaJ7s7KWqkD0AEgDzCsEoUsybcanBtWicK3cbmvvvmOBOfZmrMPHEQQYYISizc+UfYf/J1LjeUw43ePv7BVq1ZlALB/ef3zVK8n7EEt2ydwoxDCRgjx1v4ueuScXSWl7o5BZf3pGskfNWFCCRFXPTrnvpIqvQFMk1BGRHG5Z7gssePhoZaNJucUABgF13WRXFDuvVsIjkZRof9DJbbV5JwS4PSEnhACQkSYRY7ffbR4skSAnlcmtItr2uLQb9uz5z53c9rEef+cu6TKp+f6DMEoeP3eSAgiS4QVllU9WulH8wS79GNYiNWpG5wKIgijlPt0o2eF29szLsr+AjcFAQEHJcTKWHnawLavpaammv9GCxSghKKwpHJEqZf3INwwATAhRKVpmIlen35t7TdjEBbi9fsBEBRU+u+SBL9ViHpemwAIBcLiIn6TiSgKsUiIiIrwJU1QfHmPHvDemUrMAU8vMXYdqppe6vaFUgoBceYsggBEMFkKKfNyCL+H5yOsp92rJ3MR2BWBirPwCQJ/YYl7VnChnIPSMAs92rVr1zcBmP/2QpQQggkh5Oq/vXv3Wvfu3Wut/VkIId80acmQ+KFTC+OHTj05eMoLQ2p/V9/f1q1bQ++Zuz563JL3o5zOAEBf+ObnYQDw0datoUIIy9nGip3CIoSwqKvfaRl/++Ts0FuniNbDZn4m8vPtZ4yzZGT8bqtnjkuiyaCOLH/vy9jl730Z+5+855hlayOun5p+VTAr+osL60IQpKXVva4Wt6YmJYlgq0XtcUBKGquJbA5VQgpO4+QUAK5AQfy0HaOqaUSr/jcATdN4TUHpPEtWFCc9Dd4EK4a1aihEC67h9PtXOxNBoAaf9yKTr5flj1ogIQQ9Rs5pXl5RKQDgSFmFxQprrZBsiPioCP9VnVt51026v6DWnEKZlx65O6841iirNIu8bsZ9cjC59wGwgklUv+HqVuThPq0P9+3b16g9ttejCxNK/d4Qi2mQhDg72bR40u8X4tFVIejbw6Y3YxxcDo2iDRvTsi+0icW1g0KP0QtbVFR5Obxe2ELC5D6dww4vHzfOVx2ElCmr4/fnHwv16Ib1pls6HF6Smur5FzORAINRXOlZ9Hupf++RMk+OPSTsn5KNbZJsbJPFxjYx2fLF4XJ/3pbt++cHqRemBvv7bIK1zC+s+DW3yL2HcznLEhwn2UI3WULYF36I3R//vGfLL4WFco3yglmDIOYtR4sq9u09WbX3aJF7XqAgd86SJAFA0rCZegyxLrfYs/doUXF2OA3rVr2tq1kh3e9/5GhR5cEDRe49J8rKN17XubMMgDjUzQwQpNx0X7e3qGq/LvhnsSUsCgAR58iZ6dl9SQdicIGEuPDVkGULYzT/88WPdn5l/OCOUx7+W6dJg3t2WTjC0bVpbNgSbpgRAgAcSSTgr1T61pQR28D5t9xmt8ZH2ReuGD+444P9+nTV7uzXecWTgzsPuKrNzeE2i3u1a/Mp2smlcAB45t4+TnCjlFMqR4SHrDAFAKUDOSe+cqiMkL6G1Wp5zbSEWGQq9nzy7ONf1QB/l8sUisKyV8+Y2jgm9C1Tslo9uhm2LbcwBAAqj+8lABG5Rwoi7BZq3H19l4HTR91xHKpKyNmbls6PA0Mlyc0AYZqmp2uzZiW8LqSZ9OiyNS3T3w6QB4GAsZmamRBe3X+CShZR7vYXDunTp+KMoV9Nenn9wB05J/WcU2iQAMCtffpU+m8cW8SslrgyNy+vJs4uRHTdKGEEwqvrBbrJA4RHdTBwOrmfEPLe06mPOqa/3qvIy1r8z1e/LaLAA1lZWXh04ZsJH/yQnX5lo7hhzz00dJ+iOJlLOzewPi+ZYHJe3SlPTSFoIEqptNq0CSFm+pMP7TsVxWrDYyEBIBKhMoQgGJkuQwiiqipNHpkuL3zs3n0bl4/z1cPyVDcjEQbzD9HvFIKBEOLzG1zUderC4VBZ+/btK9o3iZ9gpRwFFf5hfSctHUyzVuqf/Lz7fYssv//D8klOOFTJ5Tp/VnJeBRJK65qvFnhIQggBQM7e5BgwfVMYBCkpDId2UqSmUk3TeNbKUfqF9KkQyv5YRhDcbpTUv+MzMzUDipN9+8JTHzQMl9/1CIns+j1f7T560QwBdNww/a4RJhSGzWkXlNL9EfQtGCW8xrq0QFOPoAR1MOAZ/t1us1YiM9MgyDQA4ONvvol+/v2f+mdoE13ir+jfS8oWpgC5uWe7J9dl7Lghv0K/2i+Krk5umfi3jh07ViqKwlzn8Ht/XIFCgDIqL/zHxpivs3fxMFsC4d7ikD0nKjSrxF7+4aXJv5zma06FRonrXpR56eT4OybfLrggNqvM7l+6oUeYTAskCpfO/wIFahp3OFRp+bhhR/qMXTTpp/35K3x+syox1l76RwmW8yqQm4JCmNBNs/nidzJ/M00uGC0QPt2I9NLQyPhQvurMzKSWBjkhDDIjez1e/yaTCxZiocweYoMFPJpfAn2jhslDQ0NtrLzCHf5F1p5VQoheJDUVF0oonFeBlBEOysAEzevRuuGNR4qrhEViJFQKCS2srJhpk4hxEACSkkQ9hsuJLEOm4t3SjxevBYAKAFaJPP/I8+vavbgu8I7+00pTVZVqmmbcNXdVt4yt+xZc3aLBpB92uZ896SU9uox67gm4XMsdDlW6kJ7qC/SBBIDwfzR73IHaT8sAxRCCkJennD1vFAI6NyNqGGDA8GVq5otj790d6BR1nr0h/XysuCv1X2jREETLSSVCCNLsnhkfhtrkJRmLJixqO1xrsqegatzh/PJZo5as+Th9/PC8+tzSH1ag4IE8QAhQUwhG0tIEcnIIkpKEqWkghJzXgginIkAkgCMJXElw0tzoEupaOUqvz+W4cnIIkBgwTyICvYDHj1OoqqhGAWdVnhAkOGf9vix5lERcLr3jQ7Ne8Ou6+7hr3jNkd4E859Z+M0at/eSWAg9tuSkrdzkjuMXcDHa+HXJeBUoyfASCU0J0iRIz6BUuyD8wRk0AHIx7oM3iAPy1ILF5+4yX+nqrRO6GxaPzgrkoAOBOl8u0DRxrAoLbiKUC2lRe+0EogAGTl92yv2r/F2fS+5RRP4HgINBFXbNlcK3UB0x6/rodeUVjklsktiGEiCRFJUOG9KnoP2HJ+C37jr93rNQ7uNfohUO/XT7pnbN0/p9fgQXBilWF29vRD0pDKG0xMX1tkwUjhx2BqhKcC7pkZnKxc6clfsYbnU2TU79hdu8yavZen9+QCJO4TLkIkywtvsk5vEa24DoAeVDTiAoVmqaJcSvWt1yzcVtrDwf1md7+XUbNjvXrnEmUCsrAIeiNP+85MrF73ytj9tciRYLou5shQENkuf2ajAx7at++bgQ694lIS+NDnnmx0w+5xz+PttsmbFj45D44VCnHpfmhKCxz2YSPEpUpWw6Vm312Hip8vf+Tzx/8cmlqFjnHVpbOrgPNlChBaaXHYYWeY7Ha6Nbd+f0BvK7kdCCucztofqfru45Wq80eWuHO9vtZvxMny/sLXg2OAcMQFhNiX5Oo0MJj1egiWCb9YcfhvrI1ZD+8VXp+UflYyghqxhLCdS5CCfj3kzt3NjdWJz2ZxORC0CtSpyaHcCPHFmaTXtuQ3RPAV4rTyVypqRxpacg+VrgkTJa+3P/6zCVCURhcwUDhcnG/EKTt/Wl5URYzhptgh0sq5u7bu3cw2rTxV7M1/wp9TyVGITGKapr9QiOdEIJIjIJRAkbO/AMkRkHqyRicTiervue5xp5lvURiFLLEUF+GJISQJHJ2Kk8IIUmMQqIEQohL8Tjwpc+D/hEJnNFQOjDkuMRpN1AUhpzzNOCoKkVKCkFmpjjnQhUnQwdQdEijjvgklpeXKc6BTxgUpXpOUifC5uQwdOhAEa8w5KUA6tnuLwgckPBgCs74vqbtDoqz7nM7VAmn1kfqPG9CAg0kDSoBUsi/5a38Jy3gr1hL7QGk/4RFfSq9eq8fV0xZKKBSQBOT050RW3IOqbckd5oxKdDvcmbVh0LTxLVj5vW028ISPl845qOz9B4TIQTtMmJ2GifExhjzR4XJv37z/EQXrwuFiBACHYZr88JCrbt+XjHl9RogGzy4OHDaslbFxZ6JusnLiiuqwhPjY0pNw1+5dcUz84Jrr7k2Y+dO+9ilHy6OsYe4MpdO2FQ9V3WQ6/34gq5Vhm/gjldnzDNF4LnHL3bavt5zYEb/5Fbz549KLas5MBkce+3oBfcXVOg94+yWQk5oXKSFbqJlXqPkQH7Fgpumvti12vY//H7XuF2HCu58atiAKlQ3C51RkaOAKCzzPLvrSP4LMqOAq24qB4fKKCFmfkmFo9ztLm9mD1l/6ETJK73HLBgIQJx26MbhYJQQUVrl630kv6wBANS0pwVFBuFx4SHrDheUfOc3jVs7hNHldovllyC65qfoLJWmdOhQlV9cNqC0ymMHACWYq1dX+6hFKj9W5p/b58nF1wBpAoDYuGPXE7kniofPG5ldAeDUadPgOg6XVDSvrKpM2r1n3xKhe1fYLDhOuVFeHB7CjuQczF/IoPGH5q8Klxi9ixCSy+qhdFRVpXC5zB5PzL/qioToX/yG4e3yyJybAE3UOYV0SvOFhLDCjUvG5ZhcVFZ59Ij6eXmAEFpocqO0Po7v49ljf9+wYNz3lR5/ESHi+Otzn8zPWDrhi7MUxDjn4phpwl3f99Eh4e4QRnJzj5+cT0HESDU9NCLMNooAvxNSP+bjJi+RGCm++cY+RoQUUfrRvPE/0pPlZsPGMfbZXr/eMul+9W+lbmOQVSabTc49pC7LjOqaKiUk9e4hV8+2SWxJQWn50xQQrjq0++ZAi4fJjajI8NtbPjBrZ0y47evfVk9zQlHqz2WFkMnZ8KniZKqqUskqyYILiyEEUU5r5a2jRAslol68sy//SHxMmLxAcNK428h5N58EBlCKDEHgPptTJAIGmKXjoaMF0yqF+yX1Raddkiih+SfL8hKjI8YXVHo/LHG7Fx8r9rxFKBbw+vJMQswB4xfHnKzy/m3dez95mjaI9uw/VnKtMiu91T9mjDpwegKeAoFMEEqYofvXRYVajYMnip4LAtd6e1AEIT4hAilffUSopmlcuvEJPdxm98mECOMcuSrn3CtMUW8axmTGDhWWHmvdsMHoE2WedyPLKp4vr/K+ASEWibPSEJC47v/p66VPTWUE+EEANCYiKi7EZrtm5+ppH0WGWvZZbWwzodwaarG04wEgWTOfkppKCQEqdT4j3GqdEx8enS7BsiXUJn+9bf/xV4UQ0mm8YGaOYIQg1Gpp5fMbLX586em3JMZEx4dnTc/IyJCgKKesIyFBUEIgETQPs9ma1GuAwUylVcOERhKhLfWzAt00IYSQQqyWNpKMettKQqglLC4ivPdPK57eaJXwS7HbtykiJNRqlaU2ZwPQVpklAKRds3umdu32+KK/935i7h20UUxMfmRUaJbOBcleNe1vX8x58tu2TWJL46Mj1X379km1I7fL5TI5F6RBTMTupMTE71za8BP/XDr2m+ax4dNDrJaPtmzZIteyLAAu0+CcxEeFvdQkLvIHAUG6t2/SK9YednJzdqHttGtdLtPknMRG2Ve0TIzfEmgEP926XMGDiq2bxh2KiQjXPgusr55+LyK2bNkix8dFzGoYF3UgMDYY5NLSBABEhkgnm0SHb+VQ6e7XZ/bbvmpaZmyErTQhNjzts88+O33eQI81msdGZdrtEWtsVks3vymaV/n5yT+Ji2oqdP+PsxNVpTWOuLoCr6rUcY5zFHV+FOzM68+o5DtUVaq+h6qqVFGcrG6HfOCzw1FzLTnbQ6mqSh3qaesjdZQhBHGoqnTqBYs6Wc0p1HBhz43gMTMoTuZw1J77osqFHB0485o/vBBygWPJJZwBnV0GqWsajkzfKldby5hly6zVligHWZT5qz4Irz3m+vEvN17s/D6kmgHqfN/EsI53TWmg1MMAkSDrUv15gPpqTG3NLHY6QxT11ZjaYwar6XH/Du1dNLpGUZwsJ8clbnhq6X0Wmd3rrTgUtztzw69RKQ9G/rzr+EtPLE37JMwdZnMndtpwx8MjM7bsOXj3LXeP//WnjevNXqPnTmcWqd+xwuNd933z2TeZ7piWJ9364tioSHuc1yjbkfFpkaqqNDOQyIu/jVkw7cWPvo44vvWrvT0emz+E6+bjjZJTOj08qM93JVdcHbojr+o5j18f2q7v4GO53208MmjKC7eXVPgmN+1xQ/jhn77YVg+J8C/LRdvD1SD6eFGZe//h/CZlFe5SAuCnrIP+ErfHTEtJMQ25xCcM4f/2l/2v6lzQ5eMG+TrcP61VUYWn++ZFYyZ8MmfMbAHg+PGKKkakxiE2qXzEde0PBEq5GkfgACMOFhZL5ZXeSADwmnovWUJuidt/7X7E2BvG260mxJVVPr2Br8qMBYBPhw/8lAp9v9vrDaSrF+F8yEVXYLCsSRJjIryNYiN/LXMbY4aqqiU+qpLYJDkeAPbvrkyIjbT9DwHdXFxa9ZAAiM0mlUmE8kEz0nsqaiAft4RYbZQIFmm30VWb9zU8029W+bnBGJEB4KbkNnMISE+ZUf0tbVz50RLeysJoVaTd+nOFv+oqALh59UYlMjy8EkDj+uDRpaHA4FMWe935Npu1uHPLBjNdmqZ37tIFjRvEvJPqctEerRtWXdEgpjT7tWnzWjSMnrEyPV3KWqmdbBQdPpMIDPCZoikAtG0RUxlut7xV5PZIBkwpWBWswWPd21zxW4u46GwAiAuJNEIlOHsntRwhADJ0UKffwqy2j3TdzG8YG/4KAFRUenIKy73+aHvIs4GDxv9dmOvyb6TWxZXO035YpxZLU9PJdRoJUHcMCeDBWr9qdCYeO3P+WlFZUZzstLHV+O6/B/RflstyWS7LZflvkP8FJESeUKZm8e4AAAAASUVORK5CYII=";

const FELIX_ICON_WHITE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAPaklEQVR42u2ce7DdVXXHP+ucc/MiNyEJCZhEyUMYwOAkxBieEQ2i1lQwAtMZ0YrUacsUpb6w4aUyokglrY7MMOnwcDBWwCJYFGk6JlC0RVCgvExIwkNJIAESkpDXvefbP853w+bn75z7yA2c4t0zZ37n/H77uX5rr7W+a619YLAMlsEyWAbLYHkjFklVSTFIicHymnJd+DpC0vGSxub3B0vPBKz4erAa5cS0ndtxvpU2pmXdn652fuG1NuK6SgnxwleASraN64AiQn+yBDQxqkB3RNQzQqUy1AQcARARu0v6qAF1t39dSuwFwlS9KLUgXCUiurN7hwLHAscDU4CRwBjgzcB6YCOwBVgN3AOsiIj7+jhmNSK62p6A+aSLC5JUTYST9CbgDGAhMB54HLgXuB94wr83A/sBE4HJwKHAkcBBwC7gJuDKiFhd7L/VPNpZgw6RdIakMQWNGtn3cZK+I+lZSXdI+stkqhT6OlbS2ZJGlzwbJek0Sbe6n+9LmlIyVrrWJJ0paWRbmkSedEiaKKlb0p2SRvhZR1bvLEnrJf27pDlFReIXUJM0U6+UOyV1+FMrmjOSDpH0A0kbJJ1XkI8Jzdzovua0rUmUve13Stol6b8kjfK9kZJ+JulJSe8vEK2aGc9Vv4iTvODdkp4vco7rVHNCeNwHJd0t6S2+N9QvS5JOy+fZttjV17nmxLskHSPpcUk3Z1xZLS7ERElcM1vSNkldkn5dwMaVEs6tZb+XmOjzM847pe2JV7J1ZntbSdK3cs4pIUDOSWMlLZL0tNv+rMl2rzTrx7JTknYkjs+J3PZQzJ/9zXm7vY06SxRLTri3SFrgNpL0nKRHMll4uaR32+T5I29N1u8+kv7NHLxB0sx2hoJlyqRqZbBe0mLLprq3c2eJYjlC0o+92MskfcVbd5GkOVY837ZW/pGkdZJul/SeEtExyppd7vdvTcixZVzbzjLwOkn/nd0/0px4dzJLJI2RdLUJ8k+SDvH9M0yAf5B0nKQTJH0oUySTTeR1lnH7+/4kSfdK2inp6GzspZKWtz0XZsQ70Rw03hw5JCPiVkkPWNA/KOk2SQcWOHiRCfgZSfMkfVjSQhOuktXdz+bLGps6z/kzO3G5d0PNu+Fv2tmEiUz2rZV0VkGhJCJ+NJNpO3JbMavzTT8/y/7AkySdLGlaE627POvz+lxEFF7qFkmjk83abu6sqgH9p4xJr/DkE6yqm3uez9oMMdYFUOZMGOfrTrcf6mfDvXD5g7l3etbnxqw/IqLb8O524LfA+YZ11XYjYLcXdy7wlYSzI0K+X/eivgz8ElgBbAW+J2mUQX7iiv0yAu7253l3KKBmwkwB7vSL+AbwQ2C+jfd6zmX+/kXgE37e3TZwLtsm8400OvJtkj2/UNKq7P5ca8h7MsRSsTyT7cCnJf2vpJ9K+rSkca431c/+IOmgbC4rJF1VlHWZifNAJgtr7UbAGyQtKci+hJHHWgbNLcjEw33/NxkRf2cCbvOzVFZZ0063UnhS0pvdZpiJP8mK6rCCU6Hm31+QtKLtlEmmPN6bG8gZIS8smhLZs7dJ2mROfJO1qiSdYlvu61YsH5U0QdJGG9uTmvR3laTrCvcSIafZ/BnXFl6ZbGJvM0fsUwL6Q9JKmyNF9FHLPCoveoslAs7zVj3HqOZic94qSRPLtqn7f7uJ1FmcS8bhCwaKC/dUiaQ3OAtYHxHbJFWsPCoW+ofZLf8f/v2y+z0iuiTVIuJRe6SfBfbN+t8FjLYieSfwJHBsRDxddJ4mt35EPABsskKJbI2JWA8DswfKoVzpr9wz93T4ejCw1vbXEN8b4gXMAlZGxFZJQ4Fk3NYyDhzuhX/BrnyspXdmgaUHgfcCz7qfyPtxX0N9vQ+Y7ReW5pjq/A6Ylt/L5/KaBJWyN9+VUAHwqAM/uwvPTkrfI2Jnky7zWEVyv+8wB9b8fENEbM5MnKb9SHoIeJ+kYRGxo/DsEWCGTac9jpHU+sh5ybY7Hdjf3CFgHrBO0ucyrq57qyRf3A8cEKqUROBSP+OzbdXtlzES2A5MlHROD0ZwivSd6eDUcqOTSsbJc4HDPdd0L4AXgauKMZUBDSplBFxumdTtCW/1dXihSfH39h6GuN8BI4B3WOZdEhFfknQ58HHLU5XMPb2E4dkLrJjL8pDoTnN2Z6HeH8yZO/sSiIr+ysCC/My5jozLPggs8Th/BdzahANT6TB0E7DFiGMfK6cRJoZ6WMtk4CdWXrcBp5pgyupVMpj58rL2RthzIEydccnueg3HHGUbsmNvjxW92bZN6kVB8KuJk6Ers/nqJX3Ve5pXRNT7YPQWg/ZlWz3Kxs+we+Sm0WB5nTlwSsZdQ4qPLV92RMSzBUUz2q6ppGiK2nO3x38q49LUdoKVQdirs7YPyOjATDFsjojnc6UgaWrGdR0ef2c29ngrqqF+tr2/ciTBtBvtJt8m6SlJT2SfBLuuzgzs1G6W4dkOSS8U2q31/fWShheDTM4i2OXPD/P5tHDoJsP6Ls/3JUnzs3mlvi/JHLqPOWYdmcNhocMPq43N++eAzQb8gAdc4zhGp4X0vr5eLulHTcD7T912kduNsVe40+6v1XnQPMOrnU7ZkKR39Qa3ZmOf6Xa/bbGm77vOuiz0kLzYn5C0PbnJ+h2Iygab56jaQy1g3UEFwJ7e5lVu+6kmbQ8yLKPECfGI287qIwEXut3PiwTIOLUz2z3XZmGFCebe03rrbOgNdavJdso8HukaEdEdEasyjzG599htk5O1I2vfERGrmsC7yNBDXz0mVV6dmElhTtWI2AJ81rc/JmmBYehNwE0Rcb2dHD2ikt5AuZaGq5TCD6UqXwWIVcnMjLo9NvV+jt+v+vYAVSPixxY9HwEuMqfPMIaulhjae+yNUUTUIyJd6/nvHtpujYiuiNhpdDFG0ql9tO8G2NZWAOcYA78D+CqwICK2FnfTQBGww675fU2AiY7vHtFC2CYOP9fJRbdIuhVY6QDTgPjk+uFNqnsr/94utG4aGbCb+vpCa30g8hSD/YQ6RvvzLy0IkThzJbCsYA+OaRNbeITn1Om1HJXbpAMRLDre2uoxB3Sm+Xq4A0mzS7Rd0ojXuu3HSvo/pAlsTO75FFya3UctfErK6mq2Mwq26i5Jn7fdKEln5/0NpD9wV8pFzsqpadE9yMFRyQNsj0p3RDzaU3J4Ty+4r767HNv7ejOwOCL+UdJk4DPAxZJ+AjzRGyXXGxmYtmbKJs2vlV4uPsVC0ieZMd1N2ufiIGVVVbL0kUoL4kUPsjWZJ/8MbAO+ZCP6AmCNxdJ3PK9Kb+Vbq7LTi97tBdfNNb05n9Httttdf5ev3RGx2/l+Bxa9Jl5garvFbXbn2l/Sn+dGeCEQVS84UXOu3S3pOOBs4EMmVNg2/HuPu0DSKcnk6e8WTguaYUJPlTTZmit6sLfqDp6/3W3nSFrp8VKax1TgauA4GscaIjMxptkzXQFOsD+xmnHy+4DPAWUHEWe53aGGidsyF1Vd0uHAz4HPRsQqG8y7TNxbJP2KRoTwGkmPA/e22sq1HrgH4F00QoEV4ATgmlamRxpM0gzHMx4C5rttXoYAq4ANJS/t3cBj5qJPl2j2ETRybPJt3O2tPtvzrQFzI+I/k6x1vcU0QqyLTbSu7KWHX+ZYv7CvAwuAXf3WygXtWu1Lu/4ayXsS8C4kFVVaaOtopc33dB5v6DKQ6CeanF37o3utuLOZfMiclNXCNu1uca6tmmBjcdsUMg1edhiUjZ8dZnyVssvm1Gzd6QCkSsavNJX/ryUmbaejVns6l5B0LHBURFxmCgsYBVwEXOCQYtmbEI0g9QRrr9KDfuaYLwPDbGLcFxE3NOEuaCRLPhIR12QKKXHNdGvfzYZem+yo+EZJ3ZHAt4AbImJZ9jxdZwLvT229nmG2By+NiM1ZX6nNx73mDTQSQZelzCr5fFqCOBc6eTGaCOIE8263qu9JYN8h6QLn7T2XHX4py9S6U9K5ZQLf2VpH+zzJU87aOrGJAkspdycX5pynusnJ76n/z9tLXSkoozxN7xf2qh8maW7KW/49cJmp3An8BbCmTE4lFGAvzG+AHZI+YPutmdbaQCO35WEaWQyjWuyKDeasoiOUiFgbEb8EngPWRcQzzn9u5nF52mijrGwz8rjUXDYC+GtgbQuA8ILp1QVsioj/qQAHAF+jkbE0D/gzYDmvpGGoiYF9mtstBr7Yg43UBSyU9CBwhz2+zbBsRzP7NAtapSyw6MHUGNICbY0HvglMkvRB4ETgFy0IntYxAzgP+K6kkem/Cp4wjLnZCGCpjeAyrdrt873z7BYfDRwjabqfVZq42a8DLgGOSXCtiQBPuStNnbo2sHcW8w1Lyo4WnuWqOfTvgOttgF9btu4C8Lg7IhZFxIcjYmvFwvDIiLjFyGA5jZjoIeYSlWDnC0yMK4FfAXcASywrosS9Ph2YGhFLvdXPd91KSd0pNPJbWsHLid4x1RYe55S32CytZB/g6Ii4zaJomdd9cIt+J5guM3166iM14BnjvQDmRcQO++AuMsW7kzbKuOZR4K6IeAFYL+l8GkfxOyJie0n97wJP+ftRNI75D3PSZbHuFeYMSrgrEflJGscpamXZVJZpHcDFNP5nIW+brhuBe7xj5hsPH2GLodhvmscKYJ3xdqcdzP23i5pp6T8pdFI4Z5t7hGutsGoRcxYwZBTNmdyMKPtTsUJMudoqI6AX4+WZCpUWdfq67ko2v9peYZ7evMmSxVT6O0ZPKR/tioB6WuABWapEJTk+C1zTWWgzKcuTqfjg9P7NBHqBiGMLz4aX3Ntvb6y1MoBES9vhdGvp01M8BLjSxBsmaZlPGJ2REfZ8Q7SULTDVGn4h8NYSUXMejexXjDQudf5NxWdVvgZ8W9KRrrMQuELSJwfaTbU3zottsxmyLHOxJxd9svGWALdZ000H5kTESVkfLwGTaAS9VydkkXFwzfYn1upr7EUe6WdvpZEel0yYW2kEz2f2EC95/TiQV6L9O2ic0zjbbv2w1Z/sqH+1rflJ199sb/Dc9P8GBvUpFeSAEvnVZTSC7dG5jtm8aJvzJeDXwBGuc6oh5KQm5lF7cKDtr2eMFy80YugAbjQxXjKG/J7Pa9QiYqOkC4GTbVfd58Uu9fxqBXc+rvdMRszrgdtN5PuBW/zSlrrOw34RX33DeYT/v/8z5d7497aXvbbJq5EcByk6ZnmW/xHZq9pknmFREngvesKLAfpMSdSTP887oD6YOD5YBstgGSyDpW3K/wGstRgH27LLqQAAAABJRU5ErkJggg==";

// REFERENCE DATA (Section 26)
const TRANSIT_TYPES = [
  { code: "SC-SB", name: "Suez Canal Transit — Southbound", cat: "Suez Canal Transit" },
  { code: "SC-NB", name: "Suez Canal Transit — Northbound", cat: "Suez Canal Transit" },
];
// Cruising areas — selectable alongside/instead of a canal transit (e.g. a Red Sea-only call).
const CRUISING_AREAS = [
  { code: "AREA-RS", name: "Red Sea — cruising area", cat: "Cruising Area" },
  { code: "AREA-MED", name: "Mediterranean — cruising area", cat: "Cruising Area" },
];
// Virtual "ports" so canal transits & cruising areas appear as proper voyage stops
// (named, positioned on the route chart) when they're part of the ports list.
const VIRTUAL_PORTS = {
  "SC-SB": { code: "SC-SB", name: "Suez Canal Transit — Southbound", type: "Canal Transit", cat: "Suez Canal Transit", lat: 30.45, lng: 32.35 },
  "SC-NB": { code: "SC-NB", name: "Suez Canal Transit — Northbound", type: "Canal Transit", cat: "Suez Canal Transit", lat: 30.45, lng: 32.35 },
  "AREA-RS": { code: "AREA-RS", name: "Red Sea — cruising area", type: "Cruising Area", cat: "Cruising Area", lat: 26.5, lng: 34.5 },
  "AREA-MED": { code: "AREA-MED", name: "Mediterranean — cruising area", type: "Cruising Area", cat: "Cruising Area", lat: 31.6, lng: 30.0 },
};

const PORTS_EG = [
  { code: "PSD", name: "Port Said", type: "Commercial Port", cat: "Suez Canal Zone", lat: 31.2653, lng: 32.3019 },
  { code: "ISM", name: "Ismailia Marina", type: "Marina / Yacht Harbour", cat: "Suez Canal Zone", lat: 30.5965, lng: 32.2715 },
  { code: "AIN", name: "Ain Sokhna", type: "Commercial Port", cat: "Red Sea (Northern)", lat: 29.6, lng: 32.35 },
  { code: "SUZ", name: "Port Suez (Port Tawfiq)", type: "Commercial Port", cat: "Suez Canal Zone", lat: 29.9338, lng: 32.5566 },
  { code: "HRG", name: "Hurghada", type: "Commercial Port", cat: "Red Sea (Northern)", lat: 27.2278, lng: 33.8419 },
  { code: "HRM", name: "Hurghada Marina", type: "Marina / Yacht Harbour", cat: "Red Sea (Northern)", lat: 27.2293, lng: 33.847 },
  { code: "EGA", name: "El Gouna — Abu Tig Marina", type: "Marina / Yacht Harbour", cat: "Red Sea (Northern)", lat: 27.4082, lng: 33.6752 },
  { code: "EGB", name: "El Gouna — Abydos Marina", type: "Marina / Yacht Harbour", cat: "Red Sea (Northern)", lat: 27.3958, lng: 33.6783 },
  { code: "EGF", name: "El Gouna — Fanadir Marina", type: "Marina / Yacht Harbour", cat: "Red Sea (Northern)", lat: 27.43, lng: 33.672 },
  { code: "SSH", name: "Sharm El Sheikh", type: "Commercial Port", cat: "Red Sea (Northern)", lat: 27.8517, lng: 34.2732 },
  { code: "SAF", name: "Safaga", type: "Commercial Port", cat: "Red Sea (Central & Southern)", lat: 26.7333, lng: 33.9333 },
  { code: "SMB", name: "Soma Bay Marina", type: "Marina / Yacht Harbour", cat: "Red Sea (Central & Southern)", lat: 26.8419, lng: 33.9889 },
  { code: "PGH", name: "Port Ghalib", type: "Commercial Port & Marina", cat: "Red Sea (Central & Southern)", lat: 25.5392, lng: 34.6386 },
  { code: "MRS", name: "Marsa Alam", type: "Anchorage / Minor Port", cat: "Red Sea (Central & Southern)", lat: 25.0676, lng: 34.8838 },
  { code: "BRN", name: "Berenice", type: "Anchorage / Minor Port", cat: "Red Sea (Central & Southern)", lat: 23.908, lng: 35.475 },
  { code: "DBH", name: "Dahab", type: "Anchorage / Minor Port", cat: "Gulf of Aqaba", lat: 28.5009, lng: 34.5136 },
  { code: "TBA", name: "Taba", type: "Border Port / Minor Port", cat: "Gulf of Aqaba", lat: 29.49, lng: 34.897 },
  { code: "NWB", name: "Nuweiba", type: "Commercial Port (Ferry Terminal)", cat: "Gulf of Aqaba", lat: 29.0319, lng: 34.6669 },
  { code: "ALX", name: "Alexandria", type: "Commercial Port", cat: "Mediterranean", lat: 31.195, lng: 29.8837 },
  { code: "MRA", name: "Marassi Marina", type: "Marina / Yacht Harbour", cat: "Mediterranean", lat: 30.976, lng: 28.771 },
  { code: "ALM", name: "El Alamein", type: "Commercial Port & Marina", cat: "Mediterranean", lat: 30.85, lng: 28.95 },
  // Islands & dive sites — selectable as voyage stops, grouped by area
  { code: "GIF", name: "Giftun Islands", type: "Island / Anchorage", cat: "Hurghada & El Gouna — Islands", lat: 27.19, lng: 33.93 },
  { code: "MAH", name: "Mahmya Island", type: "Island / Anchorage", cat: "Hurghada & El Gouna — Islands", lat: 27.22, lng: 33.94 },
  { code: "ABM", name: "Abu Minqar Island", type: "Island / Anchorage", cat: "Hurghada & El Gouna — Islands", lat: 27.2, lng: 33.85 },
  { code: "TAW", name: "Tawila Island", type: "Island / Anchorage", cat: "Hurghada & El Gouna — Islands", lat: 27.57, lng: 33.77 },
  { code: "TIR", name: "Tiran Island", type: "Island / Anchorage", cat: "Sharm El-Sheikh & Sinai — Islands", lat: 27.93, lng: 34.56 },
  { code: "WHI", name: "White Island", type: "Island / Anchorage", cat: "Sharm El-Sheikh & Sinai — Islands", lat: 27.73, lng: 34.26 },
  { code: "PHA", name: "Pharaoh's Island (Geziret Fara'oun)", type: "Island / Anchorage", cat: "Sharm El-Sheikh & Sinai — Islands", lat: 29.46, lng: 34.86 },
  { code: "DUN", name: "SS Dunraven", type: "Dive Site / Wreck", cat: "Sharm El-Sheikh & Sinai — Islands", lat: 27.7, lng: 34.11 },
  { code: "GRD", name: "Gordon Reef", type: "Dive Site / Reef", cat: "Sharm El-Sheikh & Sinai — Islands", lat: 27.99, lng: 34.45 },
  { code: "MBK", name: "Marsa Breaks", type: "Dive Site / Anchorage", cat: "Sharm El-Sheikh & Sinai — Islands", lat: 27.86, lng: 34.31 },
  { code: "RMD", name: "Ras Mohamed", type: "Marine Park / Anchorage", cat: "Sharm El-Sheikh & Sinai — Islands", lat: 27.73, lng: 34.25 },
  { code: "HAM", name: "Hamata Islands (Qulaan Islands)", type: "Island / Anchorage", cat: "Marsa Alam & Deep South — Islands", lat: 24.66, lng: 35.08 },
  { code: "ZAB", name: "Zabargad Island", type: "Island / Anchorage", cat: "Marsa Alam & Deep South — Islands", lat: 23.61, lng: 36.2 },
  { code: "BRO", name: "The Brothers Islands (El Akhaween)", type: "Island / Dive Site", cat: "Marsa Alam & Deep South — Islands", lat: 26.32, lng: 34.85 },
];

const PORT_CATEGORIES = ["Suez Canal Zone", "Red Sea (Northern)", "Red Sea (Central & Southern)", "Gulf of Aqaba", "Mediterranean", "Hurghada & El Gouna — Islands", "Sharm El-Sheikh & Sinai — Islands", "Marsa Alam & Deep South — Islands"];
// World water ports for "last port / next port" — searchable; grouped by region, plus
// every country (from FLAG_COUNTRIES at the usage site) and Other / TBC. Custom typed
// entries are also accepted by the SearchSelect.
const WORLD_PORTS = [
  // Red Sea & Gulf of Aden
  "Aqaba (Jordan)", "Jeddah (Saudi Arabia)", "Yanbu (Saudi Arabia)", "King Abdullah Port (Saudi Arabia)", "NEOM (Saudi Arabia)", "Jizan (Saudi Arabia)", "Port Sudan (Sudan)", "Massawa (Eritrea)", "Djibouti (Djibouti)", "Aden (Yemen)", "Berbera (Somaliland)",
  // Arabian Gulf & Oman
  "Salalah (Oman)", "Muscat (Oman)", "Sohar (Oman)", "Dubai — Port Rashid (UAE)", "Dubai — Jebel Ali (UAE)", "Abu Dhabi (UAE)", "Sharjah (UAE)", "Fujairah (UAE)", "Doha (Qatar)", "Manama (Bahrain)", "Kuwait (Kuwait)", "Dammam (Saudi Arabia)", "Basra (Iraq)", "Bandar Abbas (Iran)",
  // Eastern Mediterranean
  "Limassol (Cyprus)", "Larnaca (Cyprus)", "Paphos (Cyprus)", "Beirut (Lebanon)", "Haifa (Israel)", "Ashdod (Israel)", "Herzliya Marina (Israel)", "Latakia (Syria)", "Tripoli (Lebanon)",
  // Greece & Turkey
  "Piraeus (Greece)", "Athens — Flisvos Marina (Greece)", "Heraklion (Greece)", "Rhodes (Greece)", "Corfu (Greece)", "Mykonos (Greece)", "Santorini (Greece)", "Thessaloniki (Greece)", "Kos (Greece)", "Bodrum (Turkey)", "Marmaris (Turkey)", "Antalya (Turkey)", "Fethiye (Turkey)", "Göcek (Turkey)", "Kuşadası (Turkey)", "Çeşme (Turkey)", "Istanbul (Turkey)", "Izmir (Turkey)",
  // Central & Western Mediterranean
  "Valletta (Malta)", "Mgarr (Malta)", "Tunis — La Goulette (Tunisia)", "Bizerte (Tunisia)", "Sfax (Tunisia)", "Algiers (Algeria)", "Oran (Algeria)", "Tripoli (Libya)", "Benghazi (Libya)", "Tangier (Morocco)", "Casablanca (Morocco)", "Agadir (Morocco)",
  "Naples (Italy)", "Genoa (Italy)", "Civitavecchia / Rome (Italy)", "Venice (Italy)", "Palermo (Italy)", "Catania (Italy)", "Cagliari (Italy)", "Olbia — Porto Cervo (Italy)", "Livorno (Italy)", "Trieste (Italy)", "Portofino (Italy)",
  "Monaco — Port Hercule (Monaco)", "Nice (France)", "Cannes (France)", "Antibes — Port Vauban (France)", "Saint-Tropez (France)", "Marseille (France)", "Toulon (France)",
  "Barcelona (Spain)", "Valencia (Spain)", "Palma de Mallorca (Spain)", "Ibiza (Spain)", "Malaga (Spain)", "Gibraltar (Gibraltar)", "Cartagena (Spain)", "Alicante (Spain)",
  // Adriatic & Black Sea
  "Dubrovnik (Croatia)", "Split (Croatia)", "Zadar (Croatia)", "Rijeka (Croatia)", "Kotor (Montenegro)", "Tivat — Porto Montenegro (Montenegro)", "Bar (Montenegro)", "Durrës (Albania)", "Sarandë (Albania)", "Koper (Slovenia)", "Constanța (Romania)", "Varna (Bulgaria)", "Odesa (Ukraine)", "Batumi (Georgia)",
  // Atlantic Europe & North Sea
  "Lisbon (Portugal)", "Porto (Portugal)", "Vilamoura (Portugal)", "Funchal — Madeira (Portugal)", "Ponta Delgada — Azores (Portugal)", "Vigo (Spain)", "A Coruña (Spain)", "Bilbao (Spain)", "Las Palmas — Canary Is. (Spain)", "Tenerife (Spain)",
  "Bordeaux (France)", "Brest (France)", "Le Havre (France)", "Southampton (UK)", "Portsmouth (UK)", "London (UK)", "Falmouth (UK)", "Dover (UK)", "Dublin (Ireland)", "Cork (Ireland)",
  "Amsterdam (Netherlands)", "Rotterdam (Netherlands)", "Antwerp (Belgium)", "Zeebrugge (Belgium)", "Hamburg (Germany)", "Bremerhaven (Germany)", "Kiel (Germany)", "Copenhagen (Denmark)", "Oslo (Norway)", "Bergen (Norway)", "Stockholm (Sweden)", "Gothenburg (Sweden)", "Helsinki (Finland)", "Gdańsk (Poland)", "Riga (Latvia)", "Tallinn (Estonia)", "Klaipėda (Lithuania)", "St. Petersburg (Russia)",
  // Indian Ocean & East Africa
  "Malé (Maldives)", "Colombo (Sri Lanka)", "Galle (Sri Lanka)", "Mumbai (India)", "Kochi (India)", "Chennai (India)", "Victoria — Mahé (Seychelles)", "Port Louis (Mauritius)", "Saint-Denis (Réunion)", "Antsiranana (Madagascar)", "Mombasa (Kenya)", "Dar es Salaam (Tanzania)", "Zanzibar (Tanzania)", "Maputo (Mozambique)", "Durban (South Africa)", "Cape Town (South Africa)", "Walvis Bay (Namibia)", "Mogadishu (Somalia)",
  // Asia & Pacific
  "Singapore (Singapore)", "Port Klang (Malaysia)", "Langkawi (Malaysia)", "Phuket (Thailand)", "Bangkok — Laem Chabang (Thailand)", "Jakarta (Indonesia)", "Bali — Benoa (Indonesia)", "Manila (Philippines)", "Ho Chi Minh City (Vietnam)", "Da Nang (Vietnam)", "Hong Kong (Hong Kong)", "Shanghai (China)", "Shenzhen (China)", "Kaohsiung (Taiwan)", "Busan (South Korea)", "Tokyo — Yokohama (Japan)", "Osaka (Japan)", "Sydney (Australia)", "Melbourne (Australia)", "Fremantle — Perth (Australia)", "Brisbane (Australia)", "Auckland (New Zealand)", "Suva (Fiji)", "Papeete (Tahiti)", "Nouméa (New Caledonia)",
  // Americas & Caribbean
  "Miami (USA)", "Fort Lauderdale (USA)", "New York (USA)", "Newport RI (USA)", "Charleston (USA)", "Houston (USA)", "New Orleans (USA)", "San Diego (USA)", "Los Angeles (USA)", "San Francisco (USA)", "Seattle (USA)", "Honolulu (USA)", "Vancouver (Canada)", "Montreal (Canada)", "Halifax (Canada)",
  "Nassau (Bahamas)", "Freeport (Bahamas)", "St. Maarten (Sint Maarten)", "St. Barths — Gustavia (St. Barthélemy)", "Antigua — Falmouth Harbour (Antigua)", "St. Lucia — Rodney Bay (St. Lucia)", "Bridgetown (Barbados)", "Fort-de-France (Martinique)", "San Juan (Puerto Rico)", "Havana (Cuba)", "Montego Bay (Jamaica)", "George Town (Cayman Islands)", "Tortola — Road Town (BVI)", "St. Thomas (USVI)", "Willemstad (Curaçao)",
  "Cancún (Mexico)", "Cozumel (Mexico)", "Acapulco (Mexico)", "Cabo San Lucas (Mexico)", "Colón (Panama)", "Panama City — Balboa (Panama)", "Cartagena (Colombia)", "La Guaira (Venezuela)", "Georgetown (Guyana)", "Rio de Janeiro (Brazil)", "Santos (Brazil)", "Salvador (Brazil)", "Buenos Aires (Argentina)", "Montevideo (Uruguay)", "Valparaíso (Chile)", "Callao — Lima (Peru)", "Guayaquil (Ecuador)",
  // West Africa
  "Dakar (Senegal)", "Abidjan (Ivory Coast)", "Tema (Ghana)", "Lagos (Nigeria)", "Douala (Cameroon)", "Luanda (Angola)", "Praia (Cape Verde)",
  "Other / TBC",
];
// Back-compat alias (the short list was replaced by the world list).
const FOREIGN_PORTS = WORLD_PORTS;

const STAFF = [
  { id: "s1", name: "Sarah Ahmed Salaheldin", role: "Product Manager", office: "HQ" },
  { id: "s2", name: "Bahi Naguib", role: "Standard", office: "HQ" },
  { id: "s3", name: "Capt. Mohamed Mostafa", role: "Standard", office: "HQ" },
  { id: "s4", name: "Basent Naguib", role: "Standard", office: "HQ" },
  { id: "s5", name: "Amany El Yamany", role: "Standard", office: "HQ" },
  { id: "s6", name: "Mostafa", role: "Ismailia", office: "Ismailia" },
];

const OP_STATUSES = ["Enquiry", "Upcoming", "Active", "Completed", "Closed", "Lost"];
const LOST_REASONS = ["Price too high", "Client chose competitor", "Vessel changed itinerary", "Vessel cancelled visit", "Client unresponsive", "Services not available", "Regulatory/visa issue", "Scheduling conflict", "Other"];
const SERVICE_CATS = [
  { prefix: "SCS", name: "SC Transit — Southbound", count: 8 },
  { prefix: "SCN", name: "SC Transit — Northbound", count: 8 },
  { prefix: "PRT", name: "Port & Harbour", count: 9 },
  { prefix: "NAV", name: "Navigation & Pilotage", count: 6 },
  { prefix: "CLR", name: "Clearance & Formalities", count: 10 },
  { prefix: "PRM", name: "Permits & Licences", count: 5 },
  { prefix: "AGT", name: "Agency Fees", count: 6 },
  { prefix: "SUP", name: "Supplies & Logistics", count: 10 },
  { prefix: "TRN", name: "Transport & Services", count: 6 },
];
const VISA_METHODS = ["e-Visa (Pre-Arrival)", "Airport Visa (on Arrival)", "Visa Sticker (Felix Inventory)", "Residence Visa", "Not Required"];
const CURRENCIES = { USD: 1, EUR: 0.92, EGP: 50.85, GBP: 0.79, SAR: 3.75, AED: 3.67 };

// SAMPLE DATA — Following exact entity models from spec
const YACHTS=[
{id:"y1",name:"AZURA",type:"Motor",loa:72,beam:13.5,draught:3.8,gt:299,flag:"Cayman Islands",imo:"IMO9876543",mmsi:"319001234",callSign:"ZCAB1",officialNumber:"743210",model:"73m Custom Tri-Deck",hullMaterial:"Steel",superstructureMaterial:"Aluminium",yearBuilt:2018,engines:"2x MTU 16V 4000 M73L",maxSpeed:17,cruisingSpeed:14,range:5500,fuelCapacity:120000,guestCapacity:12,crewCapacity:22,classificationSociety:"Lloyd's Register",status:"Inactive",prevNames:["AL SHAHEEN"],ownerId:"o1",builderId:"c1",exteriorDesignerId:"c8",interiorDesignerId:"c11",navalArchitectId:"c1",managementId:"c17",brokerId:"c13",centralAgentId:"c13",marinaId:"c19",category:"Pleasure",charterable:true,charterPrice:"€450,000/week"},
{id:"y2",name:"SERENITY STAR",type:"Motor",loa:88,beam:14.8,draught:4.2,gt:2940,flag:"Marshall Islands",imo:"IMO9887654",mmsi:"538005678",callSign:"V7AB2",hullMaterial:"Steel",superstructureMaterial:"Aluminium",yearBuilt:2020,engines:"2x Caterpillar 3516C",maxSpeed:16,cruisingSpeed:13,range:6000,fuelCapacity:180000,guestCapacity:14,crewCapacity:28,classificationSociety:"DNV GL",status:"Inactive",prevNames:["NORTHERN LIGHT"],ownerId:"o2",builderId:"c2",exteriorDesignerId:"c9",interiorDesignerId:"c12",navalArchitectId:"c22",managementId:"c18",brokerId:"c14",centralAgentId:"c14",category:"Pleasure",forSale:true,askingPrice:"€115M"},
{id:"y3",name:"BELLA VITA",type:"Motor",loa:55,beam:10.2,draught:3,gt:880,flag:"Malta",imo:"IMO9865432",mmsi:"256001234",callSign:"9HA3456",officialNumber:"MLT-55821",model:"Heesen 55 Steel",hullMaterial:"Steel",superstructureMaterial:"Aluminium",yearBuilt:2016,engines:"2x MTU 12V 4000 M73",maxSpeed:15.5,cruisingSpeed:12,range:4500,fuelCapacity:85000,guestCapacity:10,crewCapacity:14,classificationSociety:"RINA",status:"Inactive",prevNames:[],ownerId:"o3",builderId:"c3",exteriorDesignerId:"c10",interiorDesignerId:"c10",navalArchitectId:"c3",brokerId:"c13",centralAgentId:"c13",marinaId:"c20",category:"Pleasure",charterable:true,charterPrice:"€220,000/week"},
{id:"y4",name:"QUANTUM",type:"Motor",loa:93,beam:15.2,draught:4.5,gt:3200,flag:"Bermuda",imo:"IMO9912345",mmsi:"310001234",callSign:"ZCBC4",hullMaterial:"Steel",superstructureMaterial:"Aluminium",yearBuilt:2022,engines:"2x MTU 20V 4000 M73L",maxSpeed:18.5,cruisingSpeed:15,range:5000,fuelCapacity:200000,guestCapacity:16,crewCapacity:30,classificationSociety:"Lloyd's Register",status:"Inactive",prevNames:["PROJECT DELTA"],ownerId:"o4",builderId:"c4",exteriorDesignerId:"c8",interiorDesignerId:"c12",navalArchitectId:"c23",managementId:"c17",brokerId:"c15",centralAgentId:"c15",category:"Pleasure"},
{id:"y5",name:"FALCON V",type:"Motor",loa:50,beam:9.5,draught:2.8,gt:650,flag:"Cayman Islands",imo:"IMO9898765",mmsi:"319005678",callSign:"ZCAB5",hullMaterial:"Aluminium",superstructureMaterial:"Aluminium",yearBuilt:2019,engines:"2x MTU 16V 2000 M96L",maxSpeed:27,cruisingSpeed:22,range:3200,fuelCapacity:52000,guestCapacity:10,crewCapacity:12,classificationSociety:"Lloyd's Register",status:"Inactive",prevNames:["SWIFT"],ownerId:"o1",builderId:"c5",exteriorDesignerId:"c10",interiorDesignerId:"c10",navalArchitectId:"c5",brokerId:"c14",centralAgentId:"c14",category:"Pleasure",charterable:true,forSale:true,charterPrice:"€145,000/week",askingPrice:"€24.5M"},
{id:"y6",name:"OLYMPUS",type:"Motor",loa:110,beam:17.8,draught:5,gt:250,flag:"Egypt",imo:"IMO9854321",mmsi:"538009876",callSign:"V7CD6",officialNumber:"EG-110-0042",model:"Lürssen 110 Commercial",hullMaterial:"Steel",superstructureMaterial:"Aluminium",yearBuilt:2015,engines:"2x MTU 20V 4000 M73L",maxSpeed:17,cruisingSpeed:14,range:7000,fuelCapacity:310000,guestCapacity:18,crewCapacity:36,classificationSociety:"DNV GL",status:"Inactive",prevNames:["ATHENA GRANDE"],ownerId:"o5",builderId:"c1",exteriorDesignerId:"c8",interiorDesignerId:"c11",navalArchitectId:"c1",managementId:"c18",brokerId:"c15",centralAgentId:"c15",marinaId:"c21",category:"Commercial"},
{id:"y7",name:"AURORA BOREALIS",type:"Motor",loa:62,beam:11.8,draught:3.4,gt:1200,flag:"Cayman Islands",imo:"IMO9909876",mmsi:"319007890",callSign:"ZCAB7",hullMaterial:"Steel",superstructureMaterial:"Aluminium",yearBuilt:2021,engines:"2x Caterpillar C32 ACERT",maxSpeed:16,cruisingSpeed:13,range:4800,fuelCapacity:95000,guestCapacity:12,crewCapacity:18,classificationSociety:"RINA",status:"Inactive",prevNames:[],ownerId:"o3",builderId:"c3",exteriorDesignerId:"c10",interiorDesignerId:"c3",navalArchitectId:"c3",brokerId:"c13",centralAgentId:"c13",charterable:true,charterPrice:"€280,000/week"},
{id:"y8",name:"ZEPHYR",type:"Sail",loa:56,beam:10.8,draught:5.5,gt:480,flag:"Malta",imo:"IMO9843210",mmsi:"256005678",callSign:"9HA7890",hullMaterial:"Aluminium",superstructureMaterial:"Aluminium",yearBuilt:2014,engines:"1x MTU 12V 2000 M72",maxSpeed:14,cruisingSpeed:11,range:3000,fuelCapacity:42000,guestCapacity:8,crewCapacity:10,classificationSociety:"RINA",status:"Inactive",prevNames:["WIND SPIRIT"],ownerId:"o5",builderId:"c6",exteriorDesignerId:"c6",interiorDesignerId:"c6",navalArchitectId:"c6",brokerId:"c14",centralAgentId:"c14",marinaId:"c19",category:"Pleasure",charterable:true,charterPrice:"€120,000/week"},
{id:"y9",name:"NEBULA",type:"Motor",loa:85,beam:14.2,draught:4,gt:2600,flag:"Cayman Islands",imo:"IMO9923456",mmsi:"319009012",callSign:"ZCBC9",hullMaterial:"Steel",superstructureMaterial:"Aluminium",yearBuilt:2024,engines:"2x MTU 16V 4000 M73L",maxSpeed:18,cruisingSpeed:15,range:5500,fuelCapacity:160000,guestCapacity:14,crewCapacity:26,classificationSociety:"Lloyd's Register",status:"Inactive",prevNames:["PROJECT NOVA"],ownerId:"o6",builderId:"c4",exteriorDesignerId:"c9",interiorDesignerId:"c12",navalArchitectId:"c23",managementId:"c18",brokerId:"c15",centralAgentId:"c15"},
{id:"y10",name:"PEGASUS",type:"Motor",loa:78,beam:13,draught:3.9,gt:2100,flag:"Marshall Islands",imo:"IMO9832109",mmsi:"538003456",callSign:"V7EF0",hullMaterial:"Steel",superstructureMaterial:"Aluminium",yearBuilt:2012,engines:"2x Caterpillar 3516B",maxSpeed:16,cruisingSpeed:12,range:5500,fuelCapacity:140000,guestCapacity:12,crewCapacity:24,classificationSociety:"DNV GL",status:"Inactive",prevNames:["DREAM WEAVER"],ownerId:"o5",builderId:"c2",exteriorDesignerId:"c2",interiorDesignerId:"c11",navalArchitectId:"c22",brokerId:"c13",centralAgentId:"c13",marinaId:"c21",charterable:true,forSale:true,charterPrice:"€320,000/week",askingPrice:"€45M"},
{id:"y11",name:"TEMPEST",type:"Motor",loa:47,beam:9,draught:2.5,gt:470,flag:"France",imo:"IMO9934567",mmsi:"226001234",callSign:"FNAB1",hullMaterial:"Aluminium",superstructureMaterial:"Aluminium",yearBuilt:2023,engines:"2x MTU 16V 2000 M96L",maxSpeed:30,cruisingSpeed:24,range:2800,fuelCapacity:38000,guestCapacity:10,crewCapacity:10,classificationSociety:"Bureau Veritas",status:"Inactive",prevNames:[],ownerId:"o7",builderId:"c5",exteriorDesignerId:"c10",interiorDesignerId:"c10",navalArchitectId:"c5",brokerId:"c16",centralAgentId:"c16",charterable:true,charterPrice:"€130,000/week"},
{id:"y12",name:"JADE EMPEROR",type:"Motor",loa:65,beam:12.2,draught:3.5,gt:1400,flag:"Hong Kong",imo:"IMO9945678",mmsi:"477001234",callSign:"VRAB2",hullMaterial:"Steel",superstructureMaterial:"Aluminium",yearBuilt:2025,engines:"2x Caterpillar C32 ACERT",maxSpeed:16.5,cruisingSpeed:13,range:4200,fuelCapacity:90000,guestCapacity:12,crewCapacity:17,classificationSociety:"Lloyd's Register",status:"Inactive",prevNames:["PROJECT JADE"],ownerId:"o8",builderId:"c7",exteriorDesignerId:"c7",interiorDesignerId:"c7",navalArchitectId:"c7",brokerId:"c15",centralAgentId:"c15"},
{id:"y13",name:"CHAMPAGNE SEAS",type:"Motor",loa:49.99,beam:8.58,draught:2.04,nt:150,gt:499,flag:"Cayman Islands",imo:"IMO9599676",mmsi:"319937000",callSign:"ZGCP8",hullMaterial:"Aluminium",superstructureMaterial:"Aluminium",yearBuilt:2012,engines:"2x Main Engines",maxSpeed:18,cruisingSpeed:14,guestCapacity:11,crewCapacity:10,classificationSociety:"American Bureau of Shipping",status:"Inactive",prevNames:[],ownerId:"o9",builderId:"c25",exteriorDesignerId:"",interiorDesignerId:"",navalArchitectId:"",managementId:"",brokerId:"",centralAgentId:"",category:"Pleasure",documents:[
{id:"d13a",name:"Certificate of British Registry",docType:"Certificate of Registry",issueDate:"2025-09-19",expiryDate:"",issuedBy:"Cayman Islands Shipping Registry",refNumber:"743771",notes:"Private Pleasure Yacht. Port of Registry: George Town. Official No. 743771"},
{id:"d13b",name:"Certificate of Class",docType:"Certificate of Class",issueDate:"2025-01-28",expiryDate:"2027-05-19",issuedBy:"American Bureau of Shipping (ABS)",refNumber:"12200708-6810130-003",notes:"✠A1, Commercial Yachting Service, ✠AMS. Class No. 12200708. Builder ID: 057 (Gulf Coast Shipyard Group)"},
{id:"d13c",name:"International Tonnage Certificate (1969)",docType:"International Tonnage Certificate",issueDate:"2025-05-22",expiryDate:"",issuedBy:"American Bureau of Shipping",refNumber:"12200708-7020661-068",notes:"GT: 499, NT: 149. Length 43.01m, Breadth 8.58m, Depth 2.72m"},
{id:"d13d",name:"International Load Line Certificate",docType:"Loadline Certificate",issueDate:"2022-01-01",expiryDate:"2027-12-31",issuedBy:"Flag State",refNumber:"",notes:"2022-2027 period"},
{id:"d13e",name:"P&I Club Certificate of Entry",docType:"P&I Club Certificate",issueDate:"2025-02-20",expiryDate:"2026-02-20",issuedBy:"Standard Club",refNumber:"21071390 25962306 Z",notes:"P&I insurance. CEO25 policy year"},
{id:"d13f",name:"H&M Yacht Insurance Endorsement",docType:"Insurance Certificate",issueDate:"2026-01-01",expiryDate:"2027-01-01",issuedBy:"Underwriters",refNumber:"",notes:"Hull & Machinery 2026-27 endorsement. Champagne Seas Ltd Partnership"},
{id:"d13g",name:"H&M Insurance Policy",docType:"Insurance Certificate",issueDate:"2025-01-01",expiryDate:"2026-12-31",issuedBy:"Underwriters",refNumber:"",notes:"Full H&M policy document. Champagne Seas Ltd Partnership"},
{id:"d13h",name:"Legal Cost Cover (Defence)",docType:"Insurance Certificate",issueDate:"2025-02-20",expiryDate:"2026-02-20",issuedBy:"Standard Club",refNumber:"21071390 25962307 Z",notes:"Defence / Legal cost cover COE"},
{id:"d13i",name:"MLC Liability Certificate",docType:"MLC Compliance Certificate",issueDate:"2025-02-20",expiryDate:"2026-02-20",issuedBy:"Standard Club",refNumber:"RS494 - 21071390 25962309 Z",notes:"MLC 2006 shipowner liability insurance"},
{id:"d13j",name:"MLC Repatriation Certificate",docType:"MLC Compliance Certificate",issueDate:"2025-02-20",expiryDate:"2026-02-20",issuedBy:"Standard Club",refNumber:"",notes:"Financial security for seafarer repatriation per MLC 2006"},
{id:"d13k",name:"IOPP Certificate (Oil Pollution Prevention)",docType:"International Oil Pollution Prevention",issueDate:"2022-01-01",expiryDate:"2027-12-31",issuedBy:"Flag State",refNumber:"",notes:"IOPP Certificate with Form A. 2022-2027 period"},
{id:"d13l",name:"Ship Radio Station Licence",docType:"Radio Licence",issueDate:"2026-01-09",expiryDate:"2026-10-08",issuedBy:"OfReg (Utility Regulation & Competition Office, Cayman Islands)",refNumber:"",notes:"Call Sign: ZGCP8, MMSI: 319937000, Official: 743771. Valid 09 Oct 2025 - 08 Oct 2026"},
{id:"d13m",name:"Cargo Ship Safety Radio Certificate",docType:"GMDSS Certificate",issueDate:"",expiryDate:"",issuedBy:"",refNumber:"",notes:"Safety radio equipment certification"},
{id:"d13n",name:"General Arrangement Drawing",docType:"Other",issueDate:"",expiryDate:"",issuedBy:"Trinity Yachts",refNumber:"",notes:"Deck layout and arrangement plan"},
{id:"d13o",name:"Equipment List",docType:"Other",issueDate:"",expiryDate:"",issuedBy:"",refNumber:"",notes:"11 cabins, 2 TVs, 2 machines, 2 generators, 2 desalination, 1 zodiac. Wine: 109, Spirits: 186, Beer: 119"},
{id:"d13p",name:"Statement of Compliance (Sewage Pollution Prevention)",docType:"Other",issueDate:"",expiryDate:"",issuedBy:"",refNumber:"",notes:"Sewage pollution prevention compliance"},
{id:"d13q",name:"Tank Sounding Table",docType:"Other",issueDate:"",expiryDate:"",issuedBy:"",refNumber:"",notes:"Tank capacities and sounding references"}
]},
{id:"y14",name:"POPPING BOTTLES II",type:"Motor",loa:11.6,beam:3.36,draught:1.31,nt:10.91,gt:10.91,flag:"Cayman Islands",callSign:"ZGVY7",hullMaterial:"Fibreglass",superstructureMaterial:"Fibreglass",yearBuilt:2022,engines:"2x Mercury Marine Outboard V6 350HP",maxSpeed:45,cruisingSpeed:30,status:"Inactive",prevNames:[],ownerId:"o9",builderId:"c26",exteriorDesignerId:"",interiorDesignerId:"",navalArchitectId:"",managementId:"",brokerId:"",centralAgentId:"",motherShipId:"y13",category:"Tender",documents:[
{id:"d14a",name:"Certificate of British Registry",docType:"Certificate of Registry",issueDate:"2026-03-06",expiryDate:"",issuedBy:"Cayman Islands Shipping Registry",refNumber:"754826",notes:"Pleasure Yacht. Port of Registry: George Town. Official No. 754826. Call Sign: ZGVY7. Owner: Champagne Seas Limited Partnership, 692 McKay Street, Kingston, Ontario K7M 7G2, Canada. 64 Shares."},
{id:"d14b",name:"Tender Declaration (Egypt)",docType:"Customs Clearance",issueDate:"",expiryDate:"",issuedBy:"",refNumber:"",notes:"Declaration for Egyptian port authorities identifying POPPING BOTTLES II as tender to M/Y CHAMPAGNE SEAS"},
{id:"d14c",name:"Tender Declaration (General)",docType:"Other",issueDate:"",expiryDate:"",issuedBy:"",refNumber:"",notes:"General tender declaration for port authorities"},
{id:"d14d",name:"Tender Equipment List",docType:"Other",issueDate:"",expiryDate:"",issuedBy:"",refNumber:"",notes:"Equipment and safety gear inventory for POPPING BOTTLES II"},
{id:"d14e",name:"Tender Radio Licence",docType:"Radio Licence",issueDate:"",expiryDate:"",issuedBy:"",refNumber:"",notes:"VHF radio licence for tender operations"}
]},
{id:"y20",name:"Ocean One",type:"Motor",loa:0,gt:0,flag:"",status:"Inactive",prevNames:[],ownerId:"o4",forSale:true,askingPrice:"EUR 10,000,000"},
{id:"y21",name:"Platinum",type:"Sail",loa:0,gt:0,flag:"",status:"Inactive",prevNames:[],ownerId:"o3",charterable:true},
{id:"y22",name:"PANAKEIA",type:"Motor",loa:0,gt:0,flag:"",status:"Inactive",prevNames:[],ownerId:"o5",charterable:true},
{id:"y23",name:"ARTEMISEA",type:"Motor",loa:0,gt:0,flag:"",status:"Inactive",prevNames:[],ownerId:"o5"},
{id:"y24",name:"ELDAMAR",type:"Motor",loa:0,gt:0,flag:"",status:"Inactive",prevNames:[]},
{id:"y25",name:"IMLADRIS",type:"Sail",loa:0,gt:0,flag:"",status:"Inactive",prevNames:[]}
];

// Each yacht is identified by a serial number, e.g. Y000001.
// Seed yachts get a stable serial from their position; explicitly-set
// `serial` (imported or newly assigned) always wins. New yachts are numbered
// after the highest existing serial.
const YACHT_SERIAL_PREFIX = "Y";
const padSerial = (n) => YACHT_SERIAL_PREFIX + String(n).padStart(6, "0");
const _seedSerialBase = YACHTS.reduce((max, y, i) => Math.max(max, i + 1), 0);
function yachtSerial(yacht, index) {
  if (yacht && yacht.serial) return yacht.serial;
  if (typeof index === "number" && index >= 0) return padSerial(index + 1);
  // fallback: derive from numeric part of id (y13 -> 13) if present
  const m = yacht && /(\d+)/.exec(yacht.id || "");
  return padSerial(m ? parseInt(m[1]) : _seedSerialBase + 1);
}
function nextYachtSerial(existing) {
  let max = 0;
  (existing || []).forEach((y, i) => {
    const s = y.serial || padSerial(i + 1);
    const m = /(\d+)\s*$/.exec(s);
    if (m) max = Math.max(max, parseInt(m[1]));
  });
  return padSerial(max + 1);
}

// Companies and persons use the same serial scheme as yachts: a single-letter
// prefix + 6-digit zero-padded number (C000001, P000001). An explicitly-set
// `serial` always wins; otherwise the number is derived from list position so
// each record keeps a stable ID regardless of search/filtering.
const COMPANY_SERIAL_PREFIX = "C";
const PERSON_SERIAL_PREFIX = "P";
const padCompanySerial = (n) => COMPANY_SERIAL_PREFIX + String(n).padStart(6, "0");
const padPersonSerial = (n) => PERSON_SERIAL_PREFIX + String(n).padStart(6, "0");
function companySerial(company, index) {
  if (company && company.serial) return company.serial;
  if (typeof index === "number" && index >= 0) return padCompanySerial(index + 1);
  const m = company && /(\d+)/.exec(company.id || "");
  return padCompanySerial(m ? parseInt(m[1]) : 1);
}
function personSerial(person, index) {
  if (person && person.serial) return person.serial;
  if (typeof index === "number" && index >= 0) return padPersonSerial(index + 1);
  const m = person && /(\d+)/.exec(person.id || "");
  return padPersonSerial(m ? parseInt(m[1]) : 1);
}
// Normalize a website to a canonical URL form, e.g. "felix.com " -> "https://felix.com".
function normalizeWebsite(raw) {
  let v = (raw || "").trim();
  if (!v) return "";
  v = v.replace(/\s+/g, "");
  if (!/^https?:\/\//i.test(v)) v = "https://" + v.replace(/^\/+/, "");
  try {
    const u = new URL(v);
    u.hostname = u.hostname.toLowerCase();
    if (u.pathname === "/" && !u.search && !u.hash) return u.origin;
    return u.toString();
  } catch (e) {
    return v;
  }
}

// IMO number = "IMO" + exactly 7 digits, e.g. IMO8712345.
// Keep only the 7 digits while typing; format for display/storage.
const imoDigits = (v) => String(v || "").replace(/\D/g, "").slice(0, 7);
const formatIMO = (v) => { const d = imoDigits(v); return d ? "IMO" + d : ""; };
const isValidIMO = (v) => imoDigits(v).length === 7;

// Maritime call sign (ITU RR Art. 19). Letters A-Z and digits only, uppercase,
// 4–7 chars. The leading prefix is one or two characters where the FIRST may be
// a letter or digit (ITU allocates prefixes such as 9H Malta, V7 Marshall Is.)
// and is followed by a letter; structures then add letters/digits:
//   4: PP + 2 alnum            (e.g. GBAB, AA22, ZCAB→ZCAB1 is 5)
//   5: PP + LL + D / PP + L + DD / PP + 3 alnum
//   6: PP + 4 alnum            (e.g. XY1234)
//   7: PP + L + 4 digits       (e.g. ABC1234, 9HA3456)
// where PP = [A-Z0-9][A-Z] (first char letter-or-digit, second always a letter).
const cleanCallSign = (v) => String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
const CALLSIGN_PATTERNS = [
  /^[A-Z0-9]{2}[A-Z0-9]{2}$/,        // 4 chars
  /^[A-Z0-9]{2}[A-Z0-9]{3}$/,        // 5 chars
  /^[A-Z0-9]{2}[A-Z0-9]{4}$/,        // 6 chars
  /^[A-Z0-9]{2}[A-Z0-9]{5}$/,        // 7 chars
];
const isValidCallSign = (v) => { const c = cleanCallSign(v); return c.length >= 4 && c.length <= 7 && /[A-Z]/.test(c) && CALLSIGN_PATTERNS.some(re => re.test(c)); };

// Tonnage resolver — single source of truth for "the yacht's tonnage".
// Priority: SCNT → SCGT → GT. Returns the value, which measurement it came
// from, and whether SC-specific tonnage was missing (so rules can warn).
// Every tonnage rule (Suez dues, Sea Trial, directory filter/tiles, badges)
// should call this instead of reading y.gt directly.
function resolveTonnage(yacht) {
  if (!yacht) return { value: 0, basis: "none", missingSC: true };
  const scnt = Number(yacht.scnt) || 0;
  const scgt = Number(yacht.scgt) || 0;
  const gt = Number(yacht.gt) || 0;
  if (scnt > 0) return { value: scnt, basis: "SCNT", missingSC: false };
  if (scgt > 0) return { value: scgt, basis: "SCGT", missingSC: false };
  return { value: gt, basis: "GT", missingSC: true };
}
// Convenience: just the number, for inline comparisons.
const tonnageOf = (yacht) => resolveTonnage(yacht).value;

// Suez Canal transit dues calculator for vessels under 300 tons.
// SCA practice: Suez tonnage = (L × W × D) ÷ 2.82; dues = tonnage × 5 SDR × USD/SDR.
function SuezDuesCalculator({ yacht }) {
  const [L, setL] = useState(yacht?.loa ? String(yacht.loa) : "");
  const [W, setW] = useState(yacht?.beam ? String(yacht.beam) : "");
  const [D, setD] = useState(yacht?.draught ? String(yacht.draught) : "");
  const [sdr, setSdr] = useState("1.35");
  const l = parseFloat(L) || 0, w = parseFloat(W) || 0, d = parseFloat(D) || 0, rate = parseFloat(sdr) || 0;
  const tonnage = (l * w * d) / 2.82;
  const dues = tonnage * 5 * rate;
  const inp = { width: "100%", border: `1px solid ${S.border}`, borderRadius: 4, padding: "8px 10px", fontSize: 15, fontWeight: 600, color: S.text, boxSizing: "border-box" };
  const lbl = { fontSize: 12, color: S.textS, marginBottom: 4, display: "block" };
  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: S.navy, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Vessel Dimensions (metres)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div><label style={lbl}>Length</label><input type="number" value={L} onChange={e => setL(e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Width</label><input type="number" value={W} onChange={e => setW(e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Depth</label><input type="number" value={D} onChange={e => setD(e.target.value)} style={inp} /></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: S.textS }}>USD per 1 SDR</label>
        <input type="number" min="0.5" max="3" step="0.0001" value={sdr} onChange={e => setSdr(e.target.value)} style={{ ...inp, width: 110, flex: "none", borderColor: (Number(sdr) < 1 || Number(sdr) > 2) ? S.red : undefined }} />
        {(Number(sdr) < 1 || Number(sdr) > 2)
          ? <span style={{ fontSize: 12, color: S.red, fontWeight: 500 }}>⚠ Rate outside 1.0–2.0 — check for a typo</span>
          : <span style={{ fontSize: 12, color: S.textH }}>live exchange rate</span>}
      </div>
      <div style={{ background: S.blueBg, borderLeft: `3px solid ${S.brand}`, borderRadius: "0 4px 4px 0", padding: "9px 14px", fontSize: 12, color: S.text, marginBottom: 14 }}>
        Dues rate fixed at <strong>5 SDR per ton</strong> for vessels under 300 tons.
      </div>
      <div style={{ borderTop: `1px solid ${S.borderL}`, paddingTop: 12, marginBottom: 12 }}>
        <code style={{ fontSize: 11, color: S.textS, fontFamily: "monospace" }}>tonnage = (L × W × D) ÷ 2.82 · dues = tonnage × 5 × (USD per SDR)</code>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: S.bg, borderRadius: 8, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, color: S.textS, marginBottom: 6 }}>Suez Canal tonnage</div>
          <div><span style={{ fontSize: 26, fontWeight: 700, color: S.text }}>{tonnage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> <span style={{ fontSize: 13, color: S.textS }}>tons</span></div>
        </div>
        <div style={{ background: S.blueBg, borderRadius: 8, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, color: S.brand, marginBottom: 6 }}>Suez Canal dues</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: S.brand }}>${dues.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: S.textH, marginTop: 12, lineHeight: 1.5 }}>
        Tonnage divisor 2.82 and 5 SDR per ton per SCA practice for vessels under 300 tons. Confirm the live SDR exchange rate at time of transit. Surcharges not included.
      </div>
    </div>
  );
}


const FLAG_COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua & Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Cook Islands","Costa Rica","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Ivory Coast","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts & Nevis","Saint Lucia","Saint Vincent & Grenadines","Samoa","San Marino","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];
const COUNTRY_CODES = [{n:"Afghanistan",d:"+93"},{n:"Albania",d:"+355"},{n:"Algeria",d:"+213"},{n:"Andorra",d:"+376"},{n:"Angola",d:"+244"},{n:"Antigua & Barbuda",d:"+1268"},{n:"Argentina",d:"+54"},{n:"Armenia",d:"+374"},{n:"Australia",d:"+61"},{n:"Austria",d:"+43"},{n:"Azerbaijan",d:"+994"},{n:"Bahamas",d:"+1242"},{n:"Bahrain",d:"+973"},{n:"Bangladesh",d:"+880"},{n:"Barbados",d:"+1246"},{n:"Belarus",d:"+375"},{n:"Belgium",d:"+32"},{n:"Belize",d:"+501"},{n:"Benin",d:"+229"},{n:"Bhutan",d:"+975"},{n:"Bolivia",d:"+591"},{n:"Bosnia & Herzegovina",d:"+387"},{n:"Botswana",d:"+267"},{n:"Brazil",d:"+55"},{n:"Brunei",d:"+673"},{n:"Bulgaria",d:"+359"},{n:"Burkina Faso",d:"+226"},{n:"Burundi",d:"+257"},{n:"Cambodia",d:"+855"},{n:"Cameroon",d:"+237"},{n:"Canada",d:"+1"},{n:"Cape Verde",d:"+238"},{n:"Chad",d:"+235"},{n:"Chile",d:"+56"},{n:"China",d:"+86"},{n:"Colombia",d:"+57"},{n:"Comoros",d:"+269"},{n:"Congo (DRC)",d:"+243"},{n:"Congo (Rep.)",d:"+242"},{n:"Costa Rica",d:"+506"},{n:"Croatia",d:"+385"},{n:"Cuba",d:"+53"},{n:"Cyprus",d:"+357"},{n:"Czech Republic",d:"+420"},{n:"Denmark",d:"+45"},{n:"Djibouti",d:"+253"},{n:"Dominica",d:"+1767"},{n:"Dominican Republic",d:"+1809"},{n:"Ecuador",d:"+593"},{n:"Egypt",d:"+20"},{n:"El Salvador",d:"+503"},{n:"Equatorial Guinea",d:"+240"},{n:"Eritrea",d:"+291"},{n:"Estonia",d:"+372"},{n:"Eswatini",d:"+268"},{n:"Ethiopia",d:"+251"},{n:"Fiji",d:"+679"},{n:"Finland",d:"+358"},{n:"France",d:"+33"},{n:"Gabon",d:"+241"},{n:"Gambia",d:"+220"},{n:"Georgia",d:"+995"},{n:"Germany",d:"+49"},{n:"Ghana",d:"+233"},{n:"Greece",d:"+30"},{n:"Grenada",d:"+1473"},{n:"Guatemala",d:"+502"},{n:"Guinea",d:"+224"},{n:"Guyana",d:"+592"},{n:"Haiti",d:"+509"},{n:"Honduras",d:"+504"},{n:"Hong Kong",d:"+852"},{n:"Hungary",d:"+36"},{n:"Iceland",d:"+354"},{n:"India",d:"+91"},{n:"Indonesia",d:"+62"},{n:"Iran",d:"+98"},{n:"Iraq",d:"+964"},{n:"Ireland",d:"+353"},{n:"Israel",d:"+972"},{n:"Italy",d:"+39"},{n:"Ivory Coast",d:"+225"},{n:"Jamaica",d:"+1876"},{n:"Japan",d:"+81"},{n:"Jordan",d:"+962"},{n:"Kazakhstan",d:"+7"},{n:"Kenya",d:"+254"},{n:"Kuwait",d:"+965"},{n:"Kyrgyzstan",d:"+996"},{n:"Laos",d:"+856"},{n:"Latvia",d:"+371"},{n:"Lebanon",d:"+961"},{n:"Lesotho",d:"+266"},{n:"Liberia",d:"+231"},{n:"Libya",d:"+218"},{n:"Liechtenstein",d:"+423"},{n:"Lithuania",d:"+370"},{n:"Luxembourg",d:"+352"},{n:"Macau",d:"+853"},{n:"Madagascar",d:"+261"},{n:"Malawi",d:"+265"},{n:"Malaysia",d:"+60"},{n:"Maldives",d:"+960"},{n:"Mali",d:"+223"},{n:"Malta",d:"+356"},{n:"Mauritania",d:"+222"},{n:"Mauritius",d:"+230"},{n:"Mexico",d:"+52"},{n:"Moldova",d:"+373"},{n:"Monaco",d:"+377"},{n:"Mongolia",d:"+976"},{n:"Montenegro",d:"+382"},{n:"Morocco",d:"+212"},{n:"Mozambique",d:"+258"},{n:"Myanmar",d:"+95"},{n:"Namibia",d:"+264"},{n:"Nepal",d:"+977"},{n:"Netherlands",d:"+31"},{n:"New Zealand",d:"+64"},{n:"Nicaragua",d:"+505"},{n:"Niger",d:"+227"},{n:"Nigeria",d:"+234"},{n:"North Korea",d:"+850"},{n:"North Macedonia",d:"+389"},{n:"Norway",d:"+47"},{n:"Oman",d:"+968"},{n:"Pakistan",d:"+92"},{n:"Palestine",d:"+970"},{n:"Panama",d:"+507"},{n:"Papua New Guinea",d:"+675"},{n:"Paraguay",d:"+595"},{n:"Peru",d:"+51"},{n:"Philippines",d:"+63"},{n:"Poland",d:"+48"},{n:"Portugal",d:"+351"},{n:"Qatar",d:"+974"},{n:"Romania",d:"+40"},{n:"Russia",d:"+7"},{n:"Rwanda",d:"+250"},{n:"Saudi Arabia",d:"+966"},{n:"Senegal",d:"+221"},{n:"Serbia",d:"+381"},{n:"Seychelles",d:"+248"},{n:"Sierra Leone",d:"+232"},{n:"Singapore",d:"+65"},{n:"Slovakia",d:"+421"},{n:"Slovenia",d:"+386"},{n:"Somalia",d:"+252"},{n:"South Africa",d:"+27"},{n:"South Korea",d:"+82"},{n:"South Sudan",d:"+211"},{n:"Spain",d:"+34"},{n:"Sri Lanka",d:"+94"},{n:"Sudan",d:"+249"},{n:"Suriname",d:"+597"},{n:"Sweden",d:"+46"},{n:"Switzerland",d:"+41"},{n:"Syria",d:"+963"},{n:"Taiwan",d:"+886"},{n:"Tajikistan",d:"+992"},{n:"Tanzania",d:"+255"},{n:"Thailand",d:"+66"},{n:"Togo",d:"+228"},{n:"Trinidad & Tobago",d:"+1868"},{n:"Tunisia",d:"+216"},{n:"Turkey",d:"+90"},{n:"Turkmenistan",d:"+993"},{n:"Uganda",d:"+256"},{n:"Ukraine",d:"+380"},{n:"United Arab Emirates",d:"+971"},{n:"United Kingdom",d:"+44"},{n:"United States",d:"+1"},{n:"Uruguay",d:"+598"},{n:"Uzbekistan",d:"+998"},{n:"Venezuela",d:"+58"},{n:"Vietnam",d:"+84"},{n:"Yemen",d:"+967"},{n:"Zambia",d:"+260"},{n:"Zimbabwe",d:"+263"}];
const COUNTRY_CODE_LABELS = COUNTRY_CODES.map(cc => cc.n + " (" + cc.d + ")");
const extractDial = (s) => { const m = (s || "").match(/\+\d+/); return m ? m[0] : (s || ""); };
const CLASS_SOCIETIES = ["American Bureau of Shipping (ABS)","BV Marine & Offshore","Bermuda Shipping Registry","Bureau Veritas","Cayman Islands Shipping Registry","China Classification Society","Croatian Register of Shipping","DNV GL","Det Norske Veritas (DNV)","Hellenic Register of Shipping","Indian Register of Shipping","International Register of Shipping","Isthmus Bureau of Shipping","Korean Register","Lloyd's Register","Marshall Islands Registry","Nippon Kaiji Kyokai (ClassNK)","Panama Maritime Authority","Polish Register of Shipping","RINA","Registro Italiano Navale","Russian Maritime Register of Shipping","Turkish Lloyd"];
const BUILDERS = ["189 Company","3.MAJ d.d","30 Métres Plus Yachts","A&Z Marina","Aalborg Shipyard","Aarhus Flydedok","Aarhus Vaerft AS","Aasheim Verksted","Ab Torre Holms Skeppsvarf","AB Yachts","ABD Aluminium Yachts","Abeking & Rasmussen","Aberg","Able Custom Yachts","Abu Dhabi MAR Kiel GmbH","Acico Yachts","Ada Shipyard","ADA Yacht Works","Adele Yachts","ADM Shipyards","Admiral","Admiral Marine Works","Advanced Ocean Systems","Aegean Builders","Aegean Yacht","AES Yacht","Affinity Yachts","Afro Marine","Aganlar Shipyard & Marina","Agantur Yachting","Ahmad Bin Suloom","Aicon Yachts","Ailsa Shipyard","Akdeniz Shipyard","AKYACHT","Al Boom Marine","Al Jadaf","Al Mannai Marine","Al Shaali Marine","Alan Hinks & Co","Alaskan Yachts","Albin Engineering Services","Albina Engine","Albwardy Marine Engineering","Alexander Stephens & Son","Alfamarine","Alia Yachts","Allegro Yacht","Alloy Yachts","AllSeas Yachts","Almaz","Alpha Custom Yachts","Alpha Marine Ltd - Yacht Designers & Naval Architects","Alstom (Aker Yards)","Alter Navis","Altinel Shipyard","Altinova Tersaneleri Imalat","Alu Marine","Alucraft","Aluminium Boats","Aluminium Marine Reefmaster","Alva Yachts","Alze Tur","Amels","American Brown Boveri","American Custom Yachts, inc.","Ameriship","Amsterdamsche Scheepwerf G. de Vries Lentsch Jr","AMTEC","Anadolu Shipyard (ADIK)","Anastassiades & Tsortanides","Anderson & Cristofani","Angus Robertson","Angus Yachts","Ansaldo","Antago Yachts","Antibes Marine Chantier Trehard Sa","Antonini Navi","Appledore Shipbuilders Ltd","Apreamare","Aptic S.A.","Aquaton Yard","AR Roberts","Arcadia Yachts","Ares Custom Yachts","ARES Yachts","Ark Yacht","Arkin Pruva Argos","Arksen","Armour","Arnhemsche Scheepsbouw Maatschappij","Arsenal","Arsenal do Alfeite","ART Shipyard","Arthur Holgate","Arzana Navi","Arzu/Beril","Asenav","Asi-Verken","ASL Shipyard","Astillero Buquebus","Astillero Tecnao","Astilleros Armon","Astilleros Celaya S.A.","Astilleros de Mallorca S.A.","Astilleros Jorge R. Chediek","Astilleros Luzuriaga","Astilleros MCIES (Oassive)","Astilleros Nuevo Vulcano","Astilleros Udondo","Astilleros Zamakona S.A","Astondoa S.A. (Astilleros)","Astoria Marine","ATB Shipyard","Ateliers et Chantiers de La Rochelle-Pallice (ACRP)","Ateliers et Forges de l'Ouest (AFO)","Atlantic Shipbuilding Company","ATM Yachts & Design","Auroux","Austal","Austin & Pickersgill Ltd.","Austin Parker Yachts","Australian Yacht Builders","AvA Yachts","Avangard Yachts","Avlis Shipyard","Aydin Shipyard","Aydos Yat","Azimut Yachts","Azzura Yachts","B & B Boatbuilders","Baglietto S.p.A.","Baia Yachts","Balk Shipyard","Baltic Yachts","Baltyk","Bandido","Barattucci Yachts","Barcos Deportivos S.L.","Barka Shipyard","Basimakopouloi Shipyard","Bath Iron Works","Batservice Verft A/S","Bay Class","Bayaco","Bayards Yacht Structures","Bayliss Boatworks","Başaran Gemi Sanayi","Beconal","Beliard Crighton Oostende","Bellevue International Shipyard","Bender Shipbuilding & Repair Co.","Benetti M&B","Benetti Sail Division","Benetti SpA","Bering Yachts","Beykoz Shipyard","BGB Yachts","Bideford SY","Bilgin Yachts","Billings Shipyard","Black Sea Yachts Shipyard","Blaundus Yachts","Bloemsma & van Breemen","Blohm & Voss GmbH","Blount Marine","Blue Diamond Yachts","Blue Sea Maritime","Blue-Trend","BoatSpeed Performance Sailcraft","Bod-Yat A.S.","Bodenwerft","Bodrum Oguz Marin","Bodrum Shipyard","Bodrum Yachts","Boeing Aircraft","Bolero Yachts","Bolici Yachts","Bolson & Son","Bon Pelley Enterprises Ltd","Bora Shipyard","Botje Ensing & Co","Boundless Yachts","Boustead Langkawi Naval Shipyard","Bozburun Shipyard","BPT Trade","Brandino","Brandstätter","Brattvaag Skipsverft AS","Brazen Island Shipyard","Breaux Bay Craft","Bremer Vulkan","Brinkhuis Scheepstechniek","Bristol Boats","Brodogradiliste Korcula","Brodogradiliste Punat","Brodogradiliste Titovo","Brodosplit Inc.","BrodoTrogir","Brodrene Lothe AS","Brodska Montaža d.o.o.","Brooke Marine Ltd.","Brooklin Boat Yard","Broward Marine","Broward Shipyard","Bugari Custom Yacht srl.","Bulyard Shipbuilding Industries","Burger Boat Company","Burmester","Burrard Dry Dock","C & G Boat Works, Inc.","C&R Poillon","C.A. Morse","C.Boat Yacht Builder","C.N. Felszegi","C.N. Officine Meccaniche Rossato","C.P.N. S.r.l.","C.V. Mutiara Murni","Caique","Calixas Yachts","Camcraft","Cammenga","Campanella S.p.A. (Cantieri Navali)","Campbell Shipyards","Camper & Nicholsons Shipyard","Can Yatcilik","Canadair","Canadian Vickers","Canados","Candies Shipbuilders (formerly Houma)","Cantiere delle Marche (CdM)","Cantiere di Donna","Cantiere Mariano Craglietto","Cantiere Martinolich","Cantiere Navale Crotone (CNC)","Cantiere Navale De Cesari A. S.N.C.","Cantiere Navale Ferrari S.p.a.","Cantiere Navale Ippolito","Cantiere Navale Mediterranea SRL","Cantiere Navale Spertini Alalunga","Cantiere Navale St. Margherita Ligure","Cantiere Navale Vittoria","Cantiere Valdettaro S.r.l.","Cantieri de la Monica","Cantieri di Fiumicino srl","Cantieri di Pisa","Cantieri Federigo","Cantieri Navali Artemare","Cantieri Navali Beconcini","Cantieri Navali Di Chiavari","Cantieri Navali Di Pesaro","Cantieri Navali di Senigallia","Cantieri Navali di Termoli","Cantieri Navali ed Officine Meccaniche di Venezia (CNOMV)","Cantieri Navali Nicolini Srl","Cantieri Navali Riuniti","Cantieri Navali Rizzardi","Cantieri S.A.G.I.","Cantieri Solimano","Carbo Yacht","Carp Navi","Carpe Diem Yachting Ltd","Carrius & Bigot","Cassens-Werft","Castors","Catamar","Catana","Catman Cats","Cavusoglu Yat Imalathanesi","Cayman Yachts","CBI Navi","CCN - Pisa","CCYD","CDK Technologies","Ceksan","Cerri Cantieri Navali (CCN)","Challenge Marine Ltd.","Chantelot & Lemaistre","Chantier Aluminium Normandie","Chantier de L'Estérel","Chantier de La Perrière","Chantier Multiplast","Chantier Naval d'Antibes","Chantier Naval de Caen","Chantier Naval de Marseille","Chantiers Naval de Biot","Charin Pongampai","Charles E Robertson","Cheoy Lee","Christensen Shipyards, LLC.","Cihan Marine","CIM - Constructions Industrielles et Maritimes","Circa Marine","Citadel Yachts","Cizgi Yat","CL Yachts","Claasen Shipyards","Clelands Shipbuilding Co Ltd","Clemna Srl","CMB Yachts","CMN Yacht Division","CNB - Construction Navale Bordeaux","Co.Na.Vi","Coban Denizcilik","Cobra Yacht","Cochrane","Codecasa S.p.A.","Cole","Columbus Yachts","Comar Yachts","Commercial Iron","CompositeWorks","Concept Marine","Concept Yachts","Concorde Yachts","Concordia","Conrad Yachts","Consolidated Shipbuilding","Continental","Cookson Boats","Cooper Queenship","Corsair Yachts","Cosbey Bros","Cosmo Explorer","Costruzioni Navali Del Tirreno Srl","Costruzioni Navali Tigullio - Castagnola","Couach Yachts","Covey Island Boatworks","CPMG Yachts","Craig Shipbuilding Company","Creation Marine","Crescent Custom Yachts","Crestitalia","CRN","Crystal Yachts","CTB Carbon Trimaran Bau GmbH","Cubow","Culham Engineering","Custom Line","Cyrus Yachts","D Peyton","Daedalus Yachts","Damen Maaskant Shipyards","Damen Shipyards","Damen Yachting","Damietta Shipyard","Daniel Goodman","Danish Royal Dockyard","Danish Yachts","Darling Yachts","Dauphin Yachts","Davie Yards Inc.","DCAN","De Amstel","De Birs Yachts","De Bock & Mejester","De Hoop","De Liesbosch","De Vooruitgang","De Vries Lentsch","Dearsan Gemi Insaat Sanayii A.S.","Deep Sea Marine","Deep Sea Trawlers","Defoe Shipbuilding Co.","Delta Marine","Denison","Derecktor Shipyards","Destiny Yachts","Deterni (Cantieri Navali)","Devonport","Diano Cantiere Navale","Dickie & Sons","Diedrich Werft","Dittmar Donaldson","Diverse Projects","DK Yachts","DL Yachts","Dogueshi","Dominator Yachts","Don Gilkison","Dorset Yacht Co","Dover Yachts","Dovercraft Marine","Dragomar S.p.A.","Dragon Yacht Build","Dragos Yachts","Dream Boat Builders","Dream Ship Victory Ltd.","Dubbel & Jesse Yachtbau GmbH & Co. KG","Dubigeon-Normandie","Dubuque Boat","Dunston Shipyard","Dunya Yachts","Durabo Construction Ltd","Durukos","Dyna Yachts","Dynamic Sea Craft","Dynamic Supercats","Dynamiq Yachts","Dynamique Yachts S.A.","Dörries Yachts","E.J. Smit & Zoon's Scheepswerven N.V.","Eagle Yachts","Earl Edwards","East Yachting","Eastern Shipbuilding Group","Echo Yachts","Edgar André","Edward Richard Bradley","Ege Yat","Egeria Yachts","El Kotbi","Electric Boat","Elefsis Shipyard","Elegan Group","Elegance Yachts","Elizabeth City Shipyard","Elsflether Werft GmbH & Co. KG","Elthom","Endeavour Yacht Services","Engelaer Scheepsbouw","Equipe Thierry Stump","Erdogan Usta","Erin Shipyard","Esenyacht","Eser Yat","Estaleiro Kalmar","Estaleiro Maccarini Ltda","Estaleiro Marbono","Estaleiros Navais de Viana do Castelo (ENVC)","Estel Marine","Etemoglu Boatyard","Eurocraft Cantieri Navali srl","Euroship Cees Cornelissen BV","Euroyacht S.R.L.","Evadne Yachts","Evergreen Shipyard","Evolution Yachts","Extra Yachts","Fabbro Yachts","Factoria Naval Marin","Faenoe","Fairline Maldives","Fairmile Construction Company Ltd","Falcon Yachts S.r.l.","Farocean Marine","Fassmer","Fast Cruising Ltd","FBM Babcock Marine","FC Cube","FDC Yachts","FEAB Marstrandsverken","Feadship","Fellow & Stewart","Ferguson Industries","Ferretti Yachts","Ferri Cantieri Navali (s.r.l.)","Ferronavale","Fethiye Shipyard","Fibre Mechanics","Filippetti Yacht","Fincantieri Yachts","Firebird","Fittipaldi Yachts","Fitzroy Yachts","Fjellstrand AS","Flagship","Flevo Ship Holland","Floeth Yachts","Flyghtship Construction Ltd","Forgacs Shipyard Tomago","Forges et Chantiers de la Mediterranee","Forza Yachts","Fr. Schweers Shipyard","Frangescos","Franz Kluhspies","Fratelli D'Amato S.p.A.","Fratelli Rossi Cantiere Navale Srl","Fred Preiss","Frederikshavn Værft & Tørdok A/S","Frederikssund","Freeport Shipbuilding, Inc.","Freire Shipyard","Friedrich Krupp Germaniawerft","Fuat Turan Marine","Fulton Yachts","Fuzhou Shipyard","FX Yachts","G & S","G Frost","Gambol Industries, Inc.","Garcia (Chantier Naval)","Gdansk & Jaroslaw Filipiak","Gentech Yachts Ltd","Georges E.K. Carraz","GeTa","GHI Yachts","Gianetti Yachts","Giangrasso Group","Gibbs Marine","Gilbert, Richardson & Swindall","Glasstech Corp.","Global Engineering","Glommens Mekaniske Verksted","Golden Yachts Ltd.","Goole Shipyard","Gorkem Yat","Goudy & Stevens","GraafShip","Grand Harbour Yachts","Grand Ocean Yachts","Grandi Yatcilik Mimarlik","Grandweld Shipyards","Granocean Ltd","Gravdals Skibsbyggeri","Great Lakes Engineering Works","Greavette","Green Marine","Greenbay Marine Pte Ltd.","Greenport Basin Shipyard","Grubic","Gulet Yat Insaat Turizm Hizmetleri San. Ve Tic. Ltd. Sti","Gulf Craft","Gulf Craft, LLC","Gulfport","Gunboat","Gustafsson & Andersson Varvs","GX Superyachts","Gölcük Shipyard","Götaverken","Güllük Shipyard","H Reynolds","H. Dantas","H.J Baso Shipyard","H.M.A. Naval Dockyard","H2X Yachts & Ships","Haak B.V.","Haarlemse Scheepsbouw Maats","Hage & Knapp","Haji Abdullah","Haji Awang","Hakes Marine Construction","Hakvoort Maritiem","Halic Tersaneleri","Halkitis Shipyards S.A.","Hall Russell","Halter Marine","Hargrave Custom Yachts","Harland and Wolff Heavy Industries","Hart Marine","Harvey F Gamage","Harwal Marine","Hatteras Yachts","HDW - Howaldtswerke-Deutsche Werft GmbH","Heesen Yachts","Heinrich Grube Schiffswerft","Heisley Shipyard","Heli Yachts","Hellenic Shipyards S.A.","Helsingfors","Helsingor Vaerft","Henry B. Nevins Yacht Builders","Herreshoff","Hershine Marine","Heysea Yachts","HG Yachts","Higashi Marine","Hike Metal Works","Hitachi Zosen","Hitzler Werft GmbH","Hjorne & Jacobsen","Hodgdon Yachts","Hoffar-Beeching Shipyards","Holland Jachtbouw","Holterman Shipyard","Horizon Yachts","Hotchya Shipyard","Howard & Sons","Huckins Yacht Corp.","Hudson Yacht","Huffstutler","Hugh McLean & Sons","Humber St. Andrews Engineering Co.","Hunan Xiangchuan Heavy Industry Co Ltd","Huntress Yachts","Husumer Shipyard","Huzur Yat","Hyundai Yachts","I-SEA Yachts","IAG Yachts Ltd","Iatemoto","IB/SABBA","ICE Yachts","ICON Yachts","IHC Verschure","Imperial Yacht Shipyard","IMS Shipyard","INACE Yachts","Insark Marine","Intermarine S.p.A.","Intermarine Savannah","International Cruising Yachts","Ira S. Bushey & Sons","ISA Yachts","Ishikawajima-Harima Heavy Ind.","Istanbul Naval Shipyard (Istanbul Tersanesi Komutanligi)","Italcraft","Italian Vessels Cantieri Navali","Italmarine","Italyachts","Izar","Izumi Zosen Kk","J Walker & Son","J. & K. Smits Scheepswerven N.V.","J. Ring Andersen Skibsvaerft","J.J. Sietas KG","Jacht Ontwikkelings Maatschappij Holland BV","Jachtbouw De Alm","Jacoby Bros","Jade Yachts","Jadewerft","Jaguar Yachts","James S Gardner","Janssen & Schmilinsky","Jarrett Bay Boatworks","Jasmine Yat","Jet Tern Marine","JFA Yachts","Jim Smith Tournament Boats Inc.","Jinlong Mega Yacht","JMV Industries","John Borve","John Brown & Sons","John F. James & Sons","John I Thornycroft & Co Ltd","John Lewis & Sons Ltd.","John Manly Shipyard","John Perry Marine","Johnson Yachts","Jones-Goodell Corporation","Jongert Yachts","Joseph French","Jotar Ship Building & Repair Services","Jp Rennoldson & Sons","K. Damen","Kadir Turhan","KaiserWerft GmbH","Kanagawa Shipyard","Kanasashi Heavy Industries","Kanellos Bros","Kanter","Kapal Pagatan","Karadeniz","Karides Yachts","Karlskronavarvet","Karlstads Varv A/B","Karmsund Verft & Mekanisk Verksted","Kastrinos","Keith Marine","Kelly Yachts","Kesgin Yachts Ltd.","Kha Shing Enterprises Co., LTD.","Khersonskiy SSRZ imeni Kominterna","King Yacht Corporation","Kingship Yacht","Kingston Shipyard","Kleven Maritime AS","KM Yachtbuilders","Knight & Carver","Kocatepe Gemi Sti","Kocatepe Tersanesi","Kockums AB","Kolotura j.d.o.o.","Kong & Halvorsen","Koninklijke Niestern Sander","Koninklijke Schelde","Konjo Boat Builders","Konjo Boat Builders of Ara","Konjo Boat Builders of Tana Beru","Kose","Koser & Meyer","Koyunbaba Boat Manufacturing","Kraljevica Shipyard","Kristiansands Mek Verksted","Kröger Werft GmbH & Co","Kuipers Woudsend","Kulach Yachts","Kumeu /Export Yachts","Ladenstein Yacht","Lake Union Drydocks","Lake Washington Shipyard","Laky Verf","Lamda Nafs Shipyards S.A.","Lantana Shipyard Florida","Latitude Yachts","Latvia Yard","Lauderdale Marine Center","Lawley","Lazzara Yachts","Leapher Shipbuilding BV","LeBlanc Shipyard","LeClercq Marine","Leda d.o.o.","Leight Notika","Leningrad Northern","Leopard Yachts","LeVen Yachts","Leymar","Lie-Nielsen","Liman JSC Shipbuilding Yard","Little Hoquiam Shipyard","Lloyd Werft","Lloyds Ships","Logica Yachts","Logos Marine Ltd","Long Reach Shipyard","Lowland Yachts B.V.","Loyd Shipyard","Lubbe-Voss","Lubecker Flender Werke","Lusben Shipyard","Luxury Motor Yachts Inc","Lydia Yachts","Lyman-Morse Boatbuilding","Lynx Yachts","Lübeck Yacht","Lürssen Yachts","M. Eissa Shipyard","M.C.S. S.R.L.","Mac-Craft","Mackeddie Marine","MAG France","Magic Yachts","Magnolia Yachts","Maguro Shipyard","Maiora","Manabe Zoki KK","Maniwotoc Shipbuilding Company","Maori Yacht","Marco Yachts","Mares Marazul","Mares Power Catamarans","Marietta Manufacturing","Marina Group","Marine Builders","Marine Industrial Technologies Ltd.","Marine Iron Shipbuilding Co","Marinteknik Verkstads AB","Mariotti Yachts","Maritima de Axpe","Marlow Yachts","Marmara Deniz","Marstrom Composite shipyard","Marsun","Marti Yat","Martinolich Shipbuilding","Mastori Yachts","Mathis Yacht Building Co","Max Oertz Yachtwerft","Maxi Dolphin s.r.l.","Maxi Marine","Mayra Yachts","Mazu Yachts","McConaghy Boats","McKinna Yachts","McMullen & Wing Ltd","MCP Yachts","McQueen's Boat Works","Mefasa","MegaTechnica S.A.","Megaway Engineering & Trading Pte Ltd","Megri Yachting","Mengi Yay Yachts","MerConcept","Merrifield-Roberts","Merritt Boats & Engine Works","Metal Shark Boats","Metalships & Docks S.A.","Meyer Werft GmbH & Co. KG","Michael Rybovich & Sons Boat Works","Michael Turk","Midland Boat Works","Midship Marine","Mie Zosen","Milaha Shipyard & Ship repair","Millennium Superyachts","Millkraft Boatyard Pty","Minett-Shields","Miss Tor Yacht (Orucoglu Shipyard)","Mitsubishi Heavy Industries Ltd.","Mjellem & Karlsen Verft AS","MMGI Shipyard","MMH Malta","Mochi Craft","Monaco Yachting & Technologies","Mondomarine SpA","Monroe Boats","Monte Carlo Yachts","Monte Fino","Monty North","Moonen Yachts","Moss Point Marine","MSY","MTG Ship Repair","Mulder Shipyard","Mural Yachts","Mutlutur Yachting","MVC Charter & Communication Srl.","MY Premium","Myanmar Shipyards","Myklebust Verft AS","N2A","Nakilat Damen Shipyards Qatar Ltd.","Nakskov Skibsvaerft","Nalbantogulu","Nanhua High Speed Engineering","Narasaki Shipbuilding","National Bulk Carriers Inc. Ltd.","Nautor Swan","Naval Yachts","Navalmeccanica","Navilux","Nebula Yacht","Ned Ship Group","Neorion","Nereide Yachting Ltd.","Nereids Yachts S.A.","Neta Marine","Neue Brand Werft","Neue Jadewerft GmbH","New England Boatworks","New Ocean yachts","New Versilcraft srl","New York Yacht & Launch Co","New Zealand Yachts Ltd","Newbert & Wallace","Newcastle Marine","Nichols Bros. Boat Builders","Nicholson Shipyard (Brazil)","Niigata Shipyard","Nikolai Shipyard","Nishii Shipyards","Nj Blanchard Boat Co","NOA Yachts","Nobiskrug","Noble Yachts","Nolimits","Nord Winds Yachts","Nordhavn Yachts","Nordlund Boat Company. Inc.","Norfolk Shipbuilding","Norman R. Wright & Son's","Norship","North American Shipbuilding (NAS)","North American Yachts and Shipbuilding","North West Bay Yachts Pty Ltd","Northcoast Yachts","Northern Marine Co. LLC","NorthStar Yachts","Norwegian Navy","Notika Teknik","NQEA Yachts","Nuic Nautika D.O.O","Numarine","Nunes","Nuovi Cantieri Apuania S.p.A.","Nuovi Cantieri Liguri","Nuovo Arsenale Cartubi (N. A. C.)","NV Scheepswerf Kerstholt","NV Scheepswerven van Langerbrugge","Nv Werf Gusto V/H Firma Af Smulders","Nylen","Nysa Denizcilik Turizm San. Tic. Ltd. Şti.","Ocea","Ocean Alexander","Ocean Classic of Sweden","Ocean King","Ocean Pacifico Services Inc.","Ocean Voyager","Oceanco","Oceandro","Oceanfast","Odisej Shipyard","Offshore Yachts","Offshore Yard","Ole Haktorsen","Oliver Perry Smith","Olivier F. van Meer","Oman Royal Yacht Squadron","Omega Marine Developers","Omikron Yachts","Onar","Orenstein & Koppel","Orion Yachts","Orkun Yachting","Ortona Navi","Oshima Shipbuilding Co Ltd","Oskarshamns Varv (Swedeship)","Otam","Otto Hansen","Outer Reef Yachts","Overmarine Group SPA","OY Laivateollisuus","Oyster Yachts","OZ Marine","P Smit","Pachoud Yachts","Pacific High","Pacific Marine (Qatar)","Pak Haji Saka","Palatka Shipbuilding Inc.","Palm Beach Motor Yachts","Palmer Johnson Savannah","Palmer Johnson Yachts","Palmer Marine","Panteleakos","Paragon Motor Yachts","Parkol Marine Engineering Ltd.","Pax Navi","Pearl Yachts","Pecal Shipyard","Peene-Werft GmbH","Peer Gynt Yachts Ltd","Pendennis Shipyard Ltd","Penglai","Pensacola Shipbuilding Co","Perama Shipyard","Peri Yachts","Perini Navi","Permare s.r.l.","Pershing S.p.a.","Persico Marine","Peters Werft GmbH","Philip & Sons","Philip Zepter Yachts","Philipp Ebert & Söhne GMBH& CO kg","Phithak Shipyard and Services","Picchiotti","Piriou","Pisa SuperYachts","Pita Yachts SLU","Platinum","Platinum Yachts FZCO","Polson Iron Works","Poly Marine & Engineering Co. Ltd.","Poole","Porsius","Port Pin Rolland SAS","Port Townsend Shipwrights","Port Weller Dry Docks","PR Marine AG","President Boat International Co., Ltd.","Pride Mega Yachts","Princess Yachts","Privilege Yard S.p.A.","Profab Central Engineering Ltd","ProMarine Yachts S.A.","Proname Shipyard","Proteksan","Prout International","Psarros Shipyard","PT Bahtera Bahari shipyard","Puglia","Pusey & Jones","Qingdao Huaao Marine Manufacturing Co., Ltd.","Quality Shipbuilders","R.A. Newman & Sons","R.B.Dereli Yachts","Radez d.d. Shipyard","Ramage & Ferguson","Rasmus Moller","Rauma Shipyard","Ray Kemp","Rayburn Custom Yachts","Reale Yachts","Renaissance Yachts","Reposaaren Konepaja","Richards Iron Works","Richards Shipbuilders","Richmond Boat Works USA","Richmond Yachts","Ridas Yachts","RioStar Yachts","Riva S.p.A.","Riviera","Rivolta Yachts","RMK Marine","Robinson","Rockport Marine","Rockport Yacht & Supply Co., (RYSCO)","Roda Yacht","Rodman","Rodriquez Yachts","Rolland Garde","Romeo Marine LLC","Rosetti Superyachts","Rossinavi","Royal Craft","Royal Denship A/S","Royal Hakvoort Shipyard","Royal Huisman","Russel Hipwell Engines Ltd","Ruth Yachting","Rybinsk Shipyard","S Yachting","S.A. Pritchard","S.E. Ward & Co","Saba Yacht","Sabre Catamarans Pty Ltd","Sackett & Pendlebury","Sadko Yatçılık Ticaret A.S.","Saenz Yachts","Safe Harbor Newport Shipyard","Sagstad Shipyard","Saif Mohd. Belqaizi Ship Building","Salim Craft Factory","Salthouse Marine Limited","Samos Shipyard","Samuda Bros.","Samuel White","Samussky Ship Building","San Marino Yachts","Sangermani","Sanlorenzo","Santierul Naval Galați","Sanuki Shipbuilding & Iron Works Co Ltd","Sarp Yachts","Sarri","Sayer Yachts FZC","SBF Shipbuilders","SCA Yachting","Scarano Boat Building, Inc.","Scheepswerf A.Vuyk & Zonen","Scheepswerf Boot Leiden","Scheepswerf De Beer","Scheepswerf De Industrie","Scheepswerf De Waal","Scheepswerf Friesland","Scheepswerf Gebr. Pot","Scheepswerf Gebr. van der Werf","Scheepswerf Peter Sijperda","Scheepswerf Piet Smit","Scheepswerf Schouten","Schichau Unterweser AG","Schiffswerft Hameln","Schless Werf","Scott & Sons","Sea Force IX, Inc.","Sea Management","Seaspray Marine Services & Engineering","Sedef Shipyard","Sedna Yachts","Segue Yachts","Sensation Yachts","Senses Yachts","Serenity Shipbuilders","Sermons","SES Yachts","Seven Stars Marina & Shipyard","Severnav Shipyard","Sevil Yachting","Shama Yachts","Shanghai Blunauta Yacht Co","Shaw Boats","Sheer Yachts","Shin Kurushima Onishi Shipyard","Shipborn","Shipworks Brisbane","Shipyard Izola p.l.c.","Shore Boat Builders","Shoreline Marine Fabrication","Siar & Moschini","Sieghold","Silent Yachts","Silkline International","Silver Yachts","Silvers Marine Ltd.","SIMAN Srl","Simek AS","Sipa","Sirena Yachts","Sixten Groth","Skaalurens Skibsbyggeri","Sky Walker Yachts","SM Europe Ltd. - Chacewicz Yachten","Smith & Rhuland","Socarenam","Societe et Commerciale Nouvelle Industrie (SECNI)","Società Navale Pisa","Société française de construction navale (SFCN)","Sodra Varv","Solaris Yachts","South Red Sea Shipyard","Southern Marine Shipyard","Southern Ocean Marine","Southern Ocean Yachts","Southern Pacific","Southern Wind","Sovereign Yachts","Soyaslan Denizcilik Ltd","Spap - Slovenska Plavba A Pristavy","Spencer Yachts","Spirit Yachts Ltd","St. Augustine Trawlers Inc.","St. Petersburg Shipyard","Stabbert Maritime","Stadskanaal Shipyards","Star Shipyard (Mercers)","Star-Marin Yard","StellarPM, Inc","Stemat BV","Stephens Marine","Sterling Yachts","Stocznia im Komuny Paryskiej","Stocznia Polnocna Sa","Stord Verft A/S","Stow & Son","Stülcken Werft","Su Marine Yat San. ve Tic. Ltd. Sti.","Suez Shipyard","Sulis Marine","Summers and Payne","Sun Yatcilik","Sunbird Yacht","Sunboats","Sunreef Yachts","Sunrise Yachts","Sunseeker","Supercraft","Suprimar","Sutton Boat Works","Swan Hunter & Wigham Richardson","Swede Ship Composite AB","Swets Scheepsbouw en Constructie B.V.","Swiftships Inc.","Sylte Shipyard","Symbol Yachts","Sökmen Kardeşler","T Van Duijvendijks Scheepswerf Nv","T-Craft","Ta Chiao Chou Yacht Building Co Ltd","Tacoma Boat Building Co","Tactical Custom Boats","Tamsen Maritim GmbH","Tango Yachts","Tankerville Chamberlayne Esq","Tankoa Yachts S.p.A.","Tansu Yachts","Tarrab Yachts","Tecnomar","Tecnomarine","Teledyne Sewart Seacraft","Tempest Marine","Tencara Shipyard","Tenix Defence","Teraoka Shipyard CO., LTD.","Terranova Yachts","Thackwray Yachts","The Yard Brisbane","Thetis Ware Shipyard","Timmerman Yachts","TM Jemison","Torgem Shipyard","Torlak Shipyard","Torre del Greco","Tough Bros","Toughs Shipyard","Townsend & Downey","Townsend Bay Marine","Tramontana Yachts","Trans World Boat Building Co. Ltd.","Treworgy Custom Boat Building","Tribale Yachts","Tricon Marine","Trident","Trinity Yachts","Troia Shipyard","Tropical Adventure Maldives PVT LTD","Troy Marine","Tréhard Marine","Tukuoka Zosen K.K.","Tum Tour Yacht","Turkter Shipyard","Turquoise Yachts","Tuzla Shipyard","Two Oceans Marine Manufacturing","U4 Marine & Interiors","Ulan-Ude Shipyard","Uljanik Shipyard","Ulstein Verft AS","Umut Yillikci","Unidos Do Ensenada","Uniesse Marine Group","Union Iron Works","United Shipyard","Universal Yachts Corp.","Ursa Tersanesi","Us Navy Shipyards","US Yacht Building Corporation","Usuki Iron Works Co","Uyav Shipyard","Uzmar Marine","Vace Yacht Builders","Vahali Shipyards","Valena Yachting","Valmet","Van Cott","Van Dam Nordia Shipyard","Van de Voorde","Van Den Beldt","Van der Giessen - de Noord BV","Van der Graaf B.V.","Van der Valk Shipyard","Van der Vuijk Scheepbouw","Van Der Windt","Van Mill","Van Toledo Holland","Vancouver Shipyards","Vanquish Yachts","Vard Group AS","VBG Super Yachts","Veb J.Warnke","Vega Yachts","Velena Denizcilik","Ventnor Boat Works","Venture Yachts","Verolme Cork Shipyard","Versilcraft","Versilmarina","Vic Franck's Boat Co.","Vicem Yachts","Vige Werf","Viking Yachts","Viking Yat","VisionF","Vismara Marine","Vitech Marine","Vitters Shipyard","Viudes Yachts","VMG Yachtbuilders","Vos Marine","Vosper Thornycroft","Voyager Boat Yard","VSY","W.A. Souter & Sons","W.White & Sons","Wa Gibbs","Wadia Boat Builders","Wally","Wang Tak Engineering & Shipbuilding Co Ltd.","Warnowwerft","Warren Yachts","Watty M Ford JR","Weaver Boat Works","Weiner Werft","Weist Industries","Welding Shipyards","Welin Boat & Davit","Werf Conrad","Wesmac","West Bay SonShip Yacht Builders Ltd.","West Coast Custom","West-Vlaamse Scheepswerven","Westcon","Westminster Marine Railway","Westport Yachts","Westship Yachts","Whangarei Engineering & Construction Ltd (WECO)","White Brothers","Whiteman","WHS Marine Services Ltd","Wider s.r.l.","Willard Boat Works","William Beardmore","William Fife","William Fife & Sons","Wilmington Boat Works","Wilton Fijenoord","Windship","Windship Trident","Winslow Marine Rail & Shipbuilding Co.","Winter Yachts","Wisla Stocznia","Witsen & Vis","Wm. Osbourne & Sons ltd.","Woodies at BerLin","Workboats Northwest","Xiagang Shipyard","Y.B.M. Ltd","Yachting Developments","Yachtley","Yachts Industries","Yantai Raffles","Yarrow & Co","Yaz Gunesi","Yener Yat","Yihong Yachts","Yildiz Shipyard","Yildizlar Mesrubat","Yokohama Yacht Co Ltd","Yonca Shipyard","York Bros (Trading) Pty","Ystads Skeppsvarv","YYachts","Zelenodolsk Shipyard","Zenith Dredge Co","Zhejiang Fangyuan Ship Industry Co., Ltd.","Zigler Shipyards","Zvezda","Ürkmezler Yachts","Şahin Çelik Tersanesi (Rona Custom)","Custom","Unknown","Other"];
const HULL_MATERIALS = ["Steel", "Aluminium", "GRP", "Wood", "Carbon Fibre", "Ferrocement", "N/A"];
const NAVAL_ARCHITECTS = ["Abeking & Rasmussen","Acubens","Admiral","Affinity Yachts","Akivades","Al Mannai Marine","Alan Dowd","Alan Muir Designs","Alfa Marine Design","Alfamarine","Alfaro Design","AllSeas Yachts","Alter Navis","Angelo Lavranos Marine Design","Apollo Victory","Arcadia Yachts","ARES Yachts","Ark Yacht","Astillero Buquebus","Astondoa S.A. (Astilleros)","Ateliers et Forges de l'Ouest (AFO)","Auroux","AvA Yachts","Avangard Yachts","Azure Yacht Design & Naval Architecture","Azzura Marine","Beiderbeck Designs","Benetti SpA","Big Blue Yachts","Blohm & Voss GmbH","Bod-Yat A.S.","Bodrum Shipyard","Botin Partners Naval Architecture","Brooke Marine Ltd.","Broward Marine","Burrard Dry Dock","C.N. Felszegi","C.Raymond Hunt Associates","Cantiere Navale De Cesari A. S.N.C.","Cantiere Navale Spertini Alalunga","Cantiere Navali Leopard","Cantieri di Pisa","Cantieri Navali di Termoli","Cantieri Navali Nicolini Srl","Carbo Yacht","Cassens-Werft","Charles E. Nicholson","Clelands Shipbuilding Co Ltd","Cobra Yacht","Codecasa S.p.A.","Couach Yachts","Crestitalia","CRN","CTB Carbon Trimaran Bau GmbH","Custom Line","Daedalus Yachts","Damen Yachting","Danish Royal Dockyard","DBR Huisman","Delta Design Group","Delta Marine","Diana Yacht Design","Diaship Design","Dixon Kemp","Dominator Yachts","Dominique Presles","Don O'Keeffe","Don Shead Yacht Design","Dover Yachts","Dragos Yachts","Du Toit Yacht Design","Duck Design","Dunston Shipyard","Durkaya Avci","Dykstra Naval Architects","Ed Monk Yacht Design","Elsflether Werft GmbH & Co. KG","Equipe Thierry Stump","Eryan","Esenyacht","Extra Yachts","Farr Yacht Design","Fontaine Design Group","Francesco Guida Design","Franco Harrauer","Francois Chevalier Y D","Fratelli D'Amato S.p.A.","Fratelli Rossi Cantiere Navale Srl","Fred Elliot","Frers Design","Fuat Turan Marine","G.L. Watson & Co. Ltd","Georges Auzepy Brenneur","Gerhard Gilgenast","German Yacht Couture by Frank Neubelt Yacht Design","Glommens Mekaniske Verksted","Grant Robinson","Guarino & Cox","Gulf Craft","Hage-Marine","Halic Tersaneleri","Hall Russell","Harry Jorgensen Marine Ltd","Hoek Design Naval Architects B.V.","Horst Stichnoth","Humphreys Yacht Design","Huntress Yachts","HYS Yachts","IAG Yachts Ltd","Imperial Yacht Shipyard","IMT Marine Consultants Ltd","Inigo Echenique","Internaval Engineering","Isonaval","Javier Soto Acebal","Jim Smith Tournament Boats Inc.","Joe Langlois","Jongert Yachts","Juan Kouyoumdjian","Kapal Pagatan","Kasten Marine Design","Kerim Acar Yacht Design","Kerim Demir","KMC & KHMB Enkhuizen","Kusch Yachts","Kværner Stord AS","Ladenstein Yacht","Lennart Edström","Ljungberg","Lloyd Werft","Loyd Shipyard","Luca Brenta & Co","Malcolm McKeon Yacht Design","Marc Lombard Yacht Design Group","Marco Fancellu","Marimecs BV","Marin Teknikk AS","McFarlane ShipDesign","Meccano Engineering s.r.l.","Med Yachts (Yat)","Mengi Yay Yachts","Mie Zosen","Mills Design Ltd","Mondomarine SpA","Moonen Yachts","Mural Yachts","Nafpigiki Hellas & Co","NAMES by Francesco Rogantin","NavalHEAD","New Versilcraft srl","Next Yacht Group","Niigata Shipyard","Nobiskrug","Nord Winds Yachts","Nordhavn Yachts","Nordlund Boat Company. Inc.","NQEA Yachts","Nuovi Cantieri Apuania S.p.A.","Nusret Celikoz","Ocean Gecko","Okus Soli d.o.o.","Ole Steen Knudsen A/S","Omega Marine Developers","One2Three","Ortona Navi","Outer Reef Yachts","Ozgur Deli","Palumbo Superyachts","Paragon Design","Pendennis Shipyard Ltd","PentaNed Shipyard Ltd.","Permare s.r.l.","Persico Marine","PierLuigi Ausonio Naval Architecture","Platinum Yachts FZCO","Radez d.d. Shipyard","Ricky Smith Designs","Riva S.p.A.","Riviera","RMK Marine","Rob Doyle Design","Robert van Dam","Roberto Del Re","Roda Yacht","Rodriquez Yachts","Ron Holland Design","Royal Falcon Fleet","Samussky Ship Building","Scheepswerf Gebr. Pot","Scheepswerf Gebr. van der Werf","Schichau Unterweser AG","Sedna Yachts","Sener Denizcilik","Sevil Yachting","Sodergren Yacht Design","Soyaslan Denizcilik Ltd","Spirit Yachts Ltd","Stanyon Marine Consulting","Stefano Natucci","Stephens Marine","Stephens Waring Yacht Design","Studio Arch. Tommaso Spadolini","Studio C.E.D.","Studio Navale Samarelli","Sun Yatcilik","Sunreef Yachts","Tarrab Yachts","Tecnomar","Tenix Defence","Thackwray Yachts","Tresno Seery","Trinity Yachts","Tripp Design Naval Architects","Troy Marine","Turquoise Yachts","Ugo Costaguta","Ullberg Yacht Design","Ulstein Design & Solutions AS","USCS d.o.o.","Uyav Shipyard","Van Gorkom Yacht Design LLC","Vaton Design","Vega Yachts","Vento Yachting-Hakan Humali","Vicem Yachts","Viking Yachts","Vincent Lebailly Yacht Design","Vitech Marine","Vripack","Wally","Walter Hahn","Warren Yachts","White Brothers","William Fife & Sons","Williams Fabrication","Witsen & Vis","Yacht & Powercraft Design Services Ltd","Yacht Studio Strawinski","Yachting Developments","Yachts Industries","Unknown","Custom","Other"];
const EXTERIOR_DESIGNERS = ["Acube Design","ADA Yacht Works","Affinity Yachts","Akivades","Al Mannai Marine","Alan Muir Designs","Albert Stanton Chesebrough","Alberto Mancini Yacht Design","Alberto Mercati","Alfa Marine Design","Alfamarine","Alpha Marine Ltd - Yacht Designers & Naval Architects","Angelo Lavranos Marine Design","Apollonio Naval Architecture & Marine Engineering","Arcadia Yachts","Ark Yacht","Astondoa S.A. (Astilleros)","AvA Yachts","Azzura Marine","Bannenberg & Rowell Design","Beiderbeck Designs","Bod-Yat A.S.","Bodrum Shipyard","Bristol Harbor Design","Broward Marine","Bruce Culver","C.N. Felszegi","Caliari Superyacht Inc.","Canti & Partners","Cantiere Navale De Cesari A. S.N.C.","Cantiere Navale Spertini Alalunga","Cantiere Navali Leopard","Cantieri di Pisa","Cantieri Navali di Termoli","Cantieri Navali Nicolini Srl","Carbo Yacht","Carr Design","Charles E. Nicholson","Christian Oliver Design","Clelands Shipbuilding Co Ltd","Cobra Yacht","Cor D. Rover Design","Couach Yachts","Cox & Stevens","Crestitalia","CTB Carbon Trimaran Bau GmbH","Daedalus Yachts","Danish Royal Dockyard","Darko Mikulandra","David Wright Design","DBR Huisman","De Voogt Naval Architects","Delta Design Group","Diaship Design","Dixon Kemp","Dominator Yachts","Don O'Keeffe","Don Shead Yacht Design","Douglas Sharp Yacht Design","Dragos Yachts","Du Toit Yacht Design","Duck Design","Ed Monk Yacht Design","Equipe Thierry Stump","ER Yacht Design","Esenyacht","Espen Øino International","Filippo Salvetti","Fontaine Design Group","Foster + Partners","Francesco Guida Design","Francis Design","Fratelli Rossi Cantiere Navale Srl","Frers Design","G.L. Watson & Co. Ltd","George Nicholson","Georges Auzepy Brenneur","German Yacht Couture by Frank Neubelt Yacht Design","Gian Marco Companino Design","Gielow & Orr","Gloss Design","Grant Robinson","Guarino & Cox","Guido de Groot Design","Gulf Craft","Götaverken","H2 Yacht Design","Hall Russell","Harrison Eidsgaard","Harry Jorgensen Marine Ltd","Hoek Design Naval Architects B.V.","Hot Lab","Humphreys Yacht Design","Huntress Yachts","Hydro Tec","HYS Yachts","IAG Yachts Ltd","Imperial Yacht Shipyard","Inigo Echenique","Isonaval","Italstyle Yacht Design","Jarkko Jämsén - Aivan","Javier Soto Acebal","Jim Smith Tournament Boats Inc.","Joe Langlois","John Munford Design","Jongert Yachts","Joseph Dirand Architecture","Jozeph Forakis","JP Donovan Design","Juan Kouyoumdjian","Kapal Pagatan","Karli Yatcilik","Kasten Marine Design","Ken Freivokh Design","Kerim Demir","Kirschstein Designs Ltd","KMC & KHMB Enkhuizen","Kusch Yachts","Ladenstein Yacht","Lally Poulias","Lazzara Ombres Architects","Lenci Marine","Lennart Edström","Liebowitz & Partners","Lobanov Design","Loyd Shipyard","Luca Brenta & Co","Luca Dini Design & Architecture","Luigi Sturchio","Malcolm McKeon Yacht Design","Marc Lombard Yacht Design Group","Marco Casali Too Design","Marco Fancellu","Marino Alfani Design","Med Yachts (Yat)","Metal Shark Boats","Mie Zosen","Monk Design","Mural Yachts","Nacira Design - Axel de Beaufort","Nauta Yachts S.r.l.","Neil Taylor","New Versilcraft srl","Newcruise","Next Yacht Group","Nissan Design Group","Nordhavn Yachts","NQEA Yachts","Nusret Celikoz","Ocean Gecko","Officina Italiana Design (Mauro Micheli)","Ole Steen Knudsen A/S","Omega Architects","Optima Design","Outer Reef Yachts","P&N Homes","Pastrovich Studio","PentaNed Shipyard Ltd.","Perini Navi","Periscope Naval Architects","Persico Marine","Peter Burnet","Peter Lowe Design","Philippe Briand Ltd.","Philippe Starck","Pierrejean Design Studio","Pieter Beeldsnijder Design","Pino Spagnolo","Platinum Yachts FZCO","Progetti & Associati","ProLine","Radez d.d. Shipyard","Ramasco Yacht Design","Rayburn Custom Yachts","Reichel / Pugh Yacht Design","René van der Velden Yacht Design","Reymond Langton Design Ltd.","Richard Hein","Ricky Smith Designs","Riviera","Rivolta Yachts","Robert Delus","Roberto Del Re","Roda Yacht","Ron Holland Design","RWD","Sam Sorgiovanni Designs P/L","SCA Yachting","Scheepswerf Schouten","Sener Denizcilik","Setzer Design Group","Sevil Yachting","Shadow Marine","Soyaslan Denizcilik Ltd","Spirit Yachts Ltd","Stanyon Marine Consulting","Stefano Natucci","Stephens Marine","Stephens Waring Yacht Design","Studio Agon","Studio Arch. Tommaso Spadolini","Studio Architettura Marco Ciampa","Studio Cervi","Studio de Jorio","Studio F.A. Porsche","Studio Lenci","Studio Navale Samarelli","Studio Starkel Sas","Studio Tassin Design","Studio Vafiadis","Sun Yatcilik","Sunreef Yachts","Tansu Yachts","Tarrab Yachts","Team for Design - Enrico Gobbi","Tenix Defence","Tim Nolan Marine Design","Tim Saunders Yacht Design (TSYD)","Tom Fexas Yacht Design Inc.","Tripp Design Naval Architects","Ullberg Yacht Design","Uniellé Yacht Design","USCS d.o.o.","Uyav Shipyard","Van Gorkom Yacht Design LLC","Vaton Design","Vento Yachting-Hakan Humali","Veronika Blomgren","Vicem Yachts","Viking Yachts","Vincent Lebailly Yacht Design","Vitech Marine","Vripack","VYD Studio","Walter Hahn","Water Line ltd.","Westport Yachts","White Brothers","William Fife & Sons","Williams Fabrication","Winch Design","Witsen & Vis","Yacht Studio Strawinski","Yachts Industries","Yankee Delta Studio","Zuccon International Project","Unknown","Custom","Other"];
  const INTERIOR_DESIGNERS = ["A Lab","Affinity Yachts","Alberto Mancini Yacht Design","Alberto Pinto","Aldo Cichero","Ales Bratina","Alessandra Negrato","Alexandre Thiriat","Alfamarine","Ali Riza Turan","Allori Design","AllSeas Yachts","Alpha Marine Ltd - Yacht Designers & Naval Architects","AMK Architecture & Design","Anna Signorini","Antonio Citterio Patricia Viel","Arcadia Yachts","Archea Associati","Architecture At Large","Ark Yacht","Art Line","Ashley Sutton Design","AvA Yachts","Aylin Örs","Azzura Marine","Bannenberg & Rowell Design","Baran Akalin Design","Bayliss Boatworks","Benetti SpA","Bilgin Yachts","Bjorn Johansson Design","Bodrum Oguz Marin","Bodrum Shipyard","Bonville Associates","Borzelli & Berta","Brindan Byrne Design","BTA Design","Burger Boat Company","Caliari Superyacht Inc.","Canti & Partners","Cantiere Navale De Cesari A. S.N.C.","Cantiere Navale Spertini Alalunga","Cantiere Navali Leopard","Carbo Yacht","Carla Guilhem","Catman Cats","Celeste Dell`Anna","Christian Oliver Design","Ciarmoli Queda Studio (CQS)","Claudia Rijntjes","Claudio Zampetti","Cobra Yacht","Conrad Yachts","Couëdel Hugon Design","Crestitalia","Cristiano Gatto Design","Daedalus Yachts","Dalton Designs Inc.","Danish Royal Dockyard","Darnet Design","David Wright Design","Dee Robinson Interiors","Deirdre Renniers Interior Design Pte Ltd","Della Role Design","Design Unlimited","Destry Darr Designs","Diane Johnson Design","Diaship Design","Donald Starkey Designs","Dragos Yachts","Droulers Architecture","Dölker + Voges GmbH","E.T. Yacht Design","East Yachting","Egg and Dart","Emma Tabone","ER Yacht Design","Esenyacht","Evan K Marshall","Felix Buytendijk Yacht Design","Finn Nilsson","Fontaine Design Group","Francesca Cianficconi Interior Design","Francesco Guida Design","Francois Catroux","Francois Marquet","Furniture Manufacturing Company Of Australia (FMCA)","GCA Architects","GCA Arquitectes Associats","German Yacht Couture by Frank Neubelt Yacht Design","Gian Marco Companino Design","Gloss Design","Gold Coast Design Studio","Gulf Craft","H2 Yacht Design","Hale Doke","Harrison Eidsgaard","Hoek Design Naval Architects B.V.","Hot Lab","Howard Holtzman","HYS Yachts","IAG Yachts Ltd","Imperial Yacht Shipyard","Ing. Russo","Inigo Echenique","J.G. Verges Design","Jack Setton Design","Jane Plachter","Jarkko Jämsén - Aivan","Jasna Bogdanovic","Javier Sitges","Javier Soto Acebal","Joachim Kinder Yacht Design","Joao Paquito","Joe Thome","John Munford Design","Jonas Panacek Yacht Design GmbH","Joseph Artese Design","Joseph Dirand Architecture","Jozeph Forakis","JP Donovan Design","Kapal Pagatan","Ken Freivokh Design","Kirschstein Designs Ltd","Ladenstein Yacht","Lally Poulias","Laura Brocchini Design","Lenci Marine","Liebowitz & Partners","Lissoni & Partners","Loyd Shipyard","Luca Catino Architect","Luca Dini Design & Architecture","Luciano Di Pilla Design","Luigi Sturchio","Luiz de Basto Designs","Luxury Projects","m2atelier","Marcelo Penna","Marco Casali Too Design","Marino Alfani Design","Mark Berryman Design Ltd","Mark Whiteley Design","Martin Kemp Design","Marty Lowe","Mary Flores","Matteo Picchio Naval Architects & Yacht Designers","Mer et Design","Metrica GmbH & Co. KG","Michela Reverberi","Misa Poggi","Monk Design","Mural Yachts","Nacira Design - Axel de Beaufort","Natacha Tanguy","Nauta Yachts S.r.l.","Navaltecnica - Costruzioni Navali - S.R.L","Nesactium d.o.o.'","New Versilcraft srl","Newcruise","Nicoletti Design","NO.mad Design","Nordlund Boat Company. Inc.","Ocean Gecko","Officina Italiana Design (Mauro Micheli)","Oliver Design","Olivier F. van Meer","Omega Architects","Orsini Design Associates","Outer Reef Yachts","Overmarine Group SPA","Oyster Yachts","P&N Homes","Palmer Johnson Yachts","Paola D. Smith & Associates","Pastrovich Studio","Patrick Knowles Designs","Pavlik Design Team","Peker Design Ltd","Peter Burnet","Peter Lowe Design","Peter Sijm","Philippe Starck","Picchiotti","Pier Vittorio Cerruti","Pierrejean Design Studio","Pininfarina","Pino Spagnolo","Platinum Yachts FZCO","Porfiristudio","ProLine","Puleo Inc. / International Yacht Design","Pulina Exclusive Interiors","Quartostile","Rainsford Mann Design","Ralph Lauren","Ramasco Yacht Design","Rayburn Custom Yachts","Red Yacht Design","René van der Velden Yacht Design","Reymond Langton Design Ltd.","Rhoades Young Design","Ricky Smith Designs","Riviera","Rivolta Yachts","Robert Delus","Robin Rose & Associates","Roda Yacht","Ron Holland Design","Rune Design A/S","RWD","Rémi Tessier","Salvagni Architetti","Sam Sorgiovanni Designs P/L","SCA Yachting","Scheepswerf Schouten","Sener Denizcilik","Sevil Yachting","Shadow Marine","Stand By / Marijana Radovic","Stanyon Marine Consulting","Stephens Waring Yacht Design","Stirling & Co.","Stuart Cockram","Studio Cervi","Studio de Jorio","Studio F.A. Porsche","Studio Faggioni Yacht Design","Studio Laura Sessa","Studio Tassin Design","Studio Vafiadis","Sun Yatcilik","Sunreef Yachts","Sylvie Charest","Ta Chiao Chou Yacht Building Co Ltd","Tansu Yachts","Tarrab Yachts","Team for Design - Enrico Gobbi","Terence Disdale Design","Thackwray Yachts","Thomas Hamel","Tiffany's","Tim Saunders Yacht Design (TSYD)","Tony Castro","Traditional Timber Interiors Pty Ltd","Trident","Two Oceans Marine Manufacturing","Ugar Kose","Ugur Isik","Uyav Shipyard","Van Dam Nordia Shipyard","Veronika Blomgren","Vicem Yachts","Viking Yachts","Vincent Van Duysen Architects","Vincenzo Ruggiero","Vitech Marine","Vripack","VYD Studio","Water Line ltd.","Watermark Design","Wetzels Brown Partners","William Fife & Sons","Winch Design","Yachts Industries","Yutaka Jojima","Zaniz Interiors","Zuretti Interior Design","Unknown","Custom","Other"];
const SUPERSTRUCTURE_MATERIALS = ["Steel", "Aluminium", "GRP", "Wood", "Carbon Fibre", "Ferrocement"];
const YEARS = (() => { const now = new Date().getFullYear(); const a = []; for (let y = now + 1; y >= 1900; y--) a.push(String(y)); return a; })();
const YACHT_MODELS = ["Aarhus 44","AB 100","AB 110","AB 116","AB 120 Beach","AB 130","AB 140","AB 145","AB 92","AB 95","Ada 50 Z","Adele Yachts 45m","Admiral 35","Admiral 40","Admiral 55 S-Force","Admiral GC-Force 70","Admiral Panorama 50","Aicon 85 FB","Aicon Navetta 110","Akhir 100","Akhir 105S","Akhir 108","Akhir 110","Akhir 118","Akhir 125","Akhir 135","Akhir 153","Akhir 34S","Akhir 35S","Akhir 90","Alfresco 125","Alpha Spritz 102","Alpha Spritz 116","Alpha Spritz 140","Alva Ocean Eco 90","Amels 60","Amels 80","Amels Limited Edition 180","Amels Limited Edition 188-200","Amels Limited Edition 199","Amels Limited Edition 242","Amels Limited Edition 272","Amels Limited Editions 171","Amels Limited Editions 212","Amels Tigre D'Or 50","Amer 110","Amer 116","Amer 120","Amer 92","Amer 94","Amer Am 499","Amer Cento","Antago 27M","Antago Yachts 32m","Arcadia 100","Arcadia 105","Arcadia 115","Arcadia A96","Arksen 85","Astondoa 102 GLX","Astondoa 106 GLX","Astondoa 122 GLX","Astondoa 125 Century","Astondoa 82 GLX","Astondoa 95 GLX","Astondoa Century 100","Astondoa Century 110","AvA Kando 110","Aycer 110","Azimut 100 Grande","Azimut 100 Jumbo","Azimut 100 Leonardo","Azimut 103S","Azimut 105","Azimut 116","Azimut 84","Azimut 85","Azimut 86S","Azimut 88","Azimut 95","Azimut 98 Leonardo","Azimut Grande 120SL","Azimut Grande 25 Metri","Azimut Grande 27 Metri","Azimut Grande 30 Metri","Azimut Grande 30M (2023)","Azimut Grande 32 Metri","Azimut Grande 35 Metri","Azimut Grande 36 Metri","Azimut Grande 38 Trideck","Azimut Grande 44M","Azimut Grande 95 RPH","Azimut Magellano 30 Metri","Azimut S10","Baglietto 115 Ischia","Baglietto 34m Fast","Baglietto 42m","Baglietto 44","Baglietto 46m Displacement","Baglietto 48 T-Line","Baglietto 52m T Line","Baglietto 54m T Line","Baglietto 60m T Line","Baglietto DOM 115","Baglietto DOM 133","Baglietto Fast 50","Baia One Hundred","Baltic Yachts 112","Bandido 90 Explorer","Benetti B.Now 50m","Benetti B.Now 66-67M Oasis","Benetti B.YOND 37m","Benetti B.YOND 40m","Benetti B.Yond 57m","Benetti Class 44M","Benetti Classic 121","Benetti Classic 35","Benetti Classic 37","Benetti Classic Supreme 132","Benetti Crystal 140","Benetti Delfino 93","Benetti Delfino 95","Benetti Diamond 44","Benetti Fast 125","Benetti Fast 140","Benetti FB800 series","Benetti Golden Bay Series","Benetti Imagination","Benetti Mediterraneo 116","Benetti Motopanfilo 37M","Benetti Motopanfilo 45M","Benetti Oasis 34M","Benetti Oasis 40M","Benetti Sail Division 105","Benetti Tradition 100","Benetti Tradition 105","Benetti Tradition Supreme 108","Benetti Vision 45","Bering B125","Bering B145","Bilgin 156","Bilgin 160 Classic","Bilgin 163","Bilgin 170","Bilgin 173","Bilgin 263","Blaundus B30","Broward 120","Burger 180","Calixas 105","Canados 110","Canados 116","Canados 120 Caesar","Canados 86","Canados 888 Evolution","Canados 919 Gladiator RD","Canados Gladiator 961","Canados Sport 90","Carbo Yacht 90","CdM Acciaio 123","CdM Darwin 102","CdM Darwin 107","CdM EXP 43","CdM Flexplorer 165","CdM Nauta Air 90","CdM RAW 105","CdM RJ115","Centaurian 108","Centaurian 115","Cerri 102' FlyingSport","Cheoy Lee 104 Global","Cheoy Lee 95 Bravo","Christensen 155","Christensen 157","Christensen 160","ClubSwan 125","CMN Custom Line 60","CNB 105","Codecasa 35S","Codecasa 41S","Codecasa 45S","Codecasa 50S","Codecasa Vintage Series","Columbus 40S Hybrid","Columbus Atlantique 37m","Columbus Atlantique 43m","Columbus Atlantique 47","Columbus Crossover 42","Conrad C144S","Couach 2800 Fly","Couach 2800 Open","Couach 5000 Fly","Couach Yachts 3000 Fly","Couach Yachts 3300","Couach Yachts 3500 Fly","Couach Yachts 3700 Fly","Crescent 110","Crescent 117","CRN 128","CRN 43","CRN 54","CRN 60","Custom Line 100","Custom Line 106","Custom Line 108","Custom Line 112","Custom Line 112 Next","Custom Line 120","Custom Line 124","Custom Line 125","Custom Line 140","Custom Line 50","Custom Line 94","Custom Line 97","Custom Line Navetta 28","Custom Line Navetta 30 (2001)","Custom Line Navetta 30 (2019)","Custom Line Navetta 33 (2008)","Custom Line Navetta 33 (2017)","Custom Line Navetta 33 Crescendo (2012)","Custom Line Navetta 37","Custom Line Navetta 38","Custom Line Navetta 42","Cyrus Yachts 33","Cyrus Yachts 34","Damen Yachting Xplorer 60","Damen Yachting YS 4508","Damen Yachting YS 5009","Damen Yachting YS 53","Damen Yachting YS 6711-6911","Deep Blue 141","Delta 124","Doge 400","Dominator Ilumen 28M","Dreamline DL26","Dreamline DL30","Dreamline DL34/35","Drettmann Bandido 80","Dynamiq GTT 135","Dynamiq GTT 165 (2022)","Dynamiq GTT115","Eurocraft Explorer 44","Evadne Rock 85/Rock 90","Extra 96","Extra X100 Triplex","Extra X90 Fast","Extra X99 Fast","Falcon 100","Falcon 102","Falcon 106","Falcon 115","Falcon 90","Falcon 92","Feadship F45 Vantage","Feadship Lagoon Series","Feadship SL39","Ferretti 1000","Ferretti 860","Ferretti 870","Ferretti 880","Ferretti 881","Ferretti 881 RPH","Ferretti 920","Ferretti 940","Ferretti 960","Ferretti INFYNITO 90","Filippetti F100","Filippetti Navetta 26","Filippetti Navetta 30","Fittipaldi 110","Flexplorer 146","Gianetti Star 105 Semi Wide Body","Giant 33","Hargrave 100 Capri","Hargrave 101","Hargrave 105' Flushdeck","Hargrave 114","Hargrave 116","Hargrave 99 Capri","Hargrave E116/118","Hatteras 100RPH","Hatteras 105 Cockpit Motor Yacht","Hatteras 105RPH","Hatteras 90MY","Hatteras M98 Panacera","Heesen 3700","Heesen 4000","Heesen 4400","Heesen 4700 Displacement","Heesen 4700 Semi-Displacement","Heesen 5000 Aluminium","Heesen 5000 Semi-Displacement","Heesen 50m Alu FDHF","Heesen 50m Steel Displacement","Heesen 50m steel FDHF","Heesen 55m Steel","Heesen 5700 Aluminium","Heesen 65M Fast Displacement","Heysea Asteria 108","Heysea Asteria 112","Heysea Asteria 116","Heysea Asteria 126","Heysea Asteria 139-142","Heysea Asteria 96","Hoek Design Truly Classic 90","Hoek Truly Classic 128","Horizon CC110","Horizon CC115","Horizon E88/E90","Horizon E98","Horizon Elegance 115","Horizon Elegance 82","Horizon Elegance 90","Horizon Elegance 92","Horizon Elegance 94","Horizon Elegance 98","Horizon FD100 Skyline","Horizon FD102-FD110 Skyline","Horizon FD77/FD80","Horizon FD87/FD90","Horizon FD92 Tri Deck","Horizon Premier 105","Horizon Premier 130","Horizon RP110","Horizon RP120","Horizon RP122","Horizon RP97","IAG 100","IAG 127","Inace FHI 90","ISA Continental 80","ISA Gran Turismo 45","ISA Super Sportivo 100 GTO","ISA Yachts 120","ISA Yachts 133","ISA Yachts 136","ISA Yachts 140","ISA Yachts 470","ISA Yachts 480","ISA Yachts 500","ISA Yachts 65","Italcraft 105","Italcraft 90","Italyachts 43","Jinlong Yacht 46","Johnson 103","Johnson 105","Johnson 108","Johnson 87","Jongert 26 DS","Jongert 26T","Jongert 2800S","Jongert 40T","KaiserWerft Baron 31","Kingship Expedition 110","Kingship Magellan 110","Lazzara LSX 92","Lazzara Yachts LMY 106","Lazzara Yachts LMY 110","Lazzara Yachts LMY 116","Leopard 26","Leopard 27","Leopard 31m","Leopard 32m","Leopard 34m","Leopard 46","LeVen 90","Lynx YXT 24 Evolution","Maestro 88","Maiora 27","Maiora 30","Maiora 31DP","Maiora 33DP","Maiora 35 DP","Maiora 36 Exuma (2025)","Maiora 38DP","Maiora 39DP","Maiora Exuma 35","Maiora M36","Majesty 100","Majesty 100 Terrace","Majesty 101","Majesty 105","Majesty 110","Majesty 111","Majesty 118","Majesty 120","Majesty 121","Majesty 122","Majesty 125","Majesty 135","Majesty 140","Majesty 155","Majesty 160","Majesty 175","Majesty 90","Mangusta 100","Mangusta 104 REV Sport","Mangusta 105 S","Mangusta 107 S","Mangusta 108","Mangusta 110","Mangusta 130","Mangusta 130 S","Mangusta 132","Mangusta 132E","Mangusta 165","Mangusta 165 REV","Mangusta 92","Mangusta 94","Mangusta GranSport 33","Mangusta GranSport 45","Mangusta GranSport 54","Mangusta Oceano 39","Mangusta Oceano 43","Mangusta Oceano 44","Mangusta Oceano 46","Mangusta Oceano 50","Mangusta Oceano 52","Maori M125","Marlow 100 Voyager","Marlow 97E","Marlow Explorer 88","Marlow Voyager 90V","Maxi Ocean Explorer","Mazu 92 DS","MCP 121","MCP Europa Explorer 100","MCY 105","MCY 96","Mengi Yay 47M Virtus","Mengi Yay Atlante Classic 35","Mengi Yay S1","Mengi Yay Virtus XP53","Merritt 88","Mondo Marine 41M","Monte Fino 100","Monte Fino 90","Moonen 110 Mustique","Moonen 137","Moonen 84","Moonen 94 Alu","Moonen 96","Moonen 97","Moonen 99 Alu","Moonen Martinique","Moonen Matica","Mothership OneTwenty","Mulder ThirtySix","NOA 48","Nobiskrug 73","Nomad 101","Nomad 95","Nomad 95S","Nordhavn 120","Nordhavn 86","Nordhavn 96","Numarine 102","Numarine 105 HT","Numarine 26XP","Numarine 30XP","Numarine 32XP","Numarine 37XP","Numarine 40MXP","Ocea Commuter 108","Ocea Commuter 155","Ocean Alexander 100","Ocean Alexander 102","Ocean Alexander 112","Ocean Alexander 120","Ocean Alexander 27-28 Explorer","Ocean Alexander 27R","Ocean Alexander 28 Revolution","Ocean Alexander 28L","Ocean Alexander 30R Skylounge","Ocean Alexander 32 Explorer","Ocean Alexander 32 Legend","Ocean Alexander 35 Revolution","Ocean Alexander 35P","Ocean Alexander 36-37L","Ocean Alexander 88E","Ocean Alexander 90","Offshore Voyager 80","Onyx 87","Outer Reef 880","Oyster 100","Oyster 1225","Oyster 125 Flybridge","Oyster 885","Palm Beach 107","Palm Beach 85","Palmer Johnson 120","Palmer Johnson 123","Palmer Johnson 135","Palmer Johnson 150","Palmer Johnson 170","Palmer Johnson 210","Palmer Johnson 48 Supersport","Pearl 100","Pearl 95","Peri 29","Peri 37","Peri 41T","Perini Navi 42m E-Volution","Perini Navi 45m Series","Perini Navi 47m","Perini Navi 56m Series","Perini Navi 60m Series","Pershing 108","Pershing 115","Pershing 115 Gas Turbine","Pershing 140","Pershing 88","Pershing 90","Pershing 92","Pershing 9X","Pershing GTX116","Posillipo Technema 120","Posillipo Technema 85","Posillipo Technema 95","President 107","President 950","Princess 30M","Princess 32M","Princess 35M","Princess 40M","Princess 95","Princess 98","Princess X90","Princess X95","Princess Y88","Princess Y95","Project Moonflower","Reale Pacifico 32","Richmond Yachts 142","RioStar Procion 110","Riva 100 Corsaro","Riva 102 Corsaro Super","Riva 110 Dolcevita","Riva 112 Dolcevita Super","Riva 115 Athena","Riva 122 Mythos","Riva 130 Bellissima","Riva 50 MT","Riva 54M","Riva 88 Domino","Riva 88 Florida","Riva 88 Folgore","Riva 90 Argo","Riva 92 Duchessa","Rodriquez 38m","Rosetti 38M Explorer","Royal Denship 105 Open","Royal Denship 120 Trideck","Rui Ying 125","San Marino 88","Sanlorenzo 100","Sanlorenzo 108","Sanlorenzo 40 Alloy","Sanlorenzo 44 X-Space","Sanlorenzo 44/46 Steel","Sanlorenzo 460-500EXP","Sanlorenzo 50 Steel","Sanlorenzo 50 X-Space","Sanlorenzo 52 Steel","Sanlorenzo 57 Steel","Sanlorenzo 62-64 Steel","Sanlorenzo 74 Steel","Sanlorenzo 88","Sanlorenzo Alloy","Sanlorenzo SD112","Sanlorenzo SD118","Sanlorenzo SD122","Sanlorenzo SD126","Sanlorenzo SD132","Sanlorenzo SD90","Sanlorenzo SD92","Sanlorenzo SD96","Sanlorenzo SL102/SL106 Asymmetric","Sanlorenzo SL104","Sanlorenzo SL106","Sanlorenzo SL110 Asymmetric","Sanlorenzo SL118","Sanlorenzo SL120 Asymmetric","Sanlorenzo SL86","Sanlorenzo SL86 Asymmetric","Sanlorenzo SL90 Asymmetric","Sanlorenzo SL94","Sanlorenzo SL96","Sanlorenzo SL96 Asymmetric","Sanlorenzo SP110","Sanlorenzo SP92","Sanlorenzo SX100","Sanlorenzo SX112","Sanlorenzo SX120","Sanlorenzo SX88","Sedna 100","Shama Yachts 116","Shama Yachts 118 Sport","Signature 40","Silver Loft","SilverCat","Sirena 118","Sirena 42M","Sirena 88 RPH","Southern Wind 100 DS","Southern Wind 100 RS","Southern Wind 102 DS","Southern Wind 102 RS","Southern Wind 105","Southern Wind 110 RS","Southern Wind 123","Southern Wind 94","Southern Wind 96","Southern Wind SW100X","Squalo 100","StellarONE ST108","Sunreef 100 Eco","Sunreef 100 Power","Sunreef 43m Eco","Sunreef 88 Ultima","Sunrise Yachts 45","Sunseeker 100 Yacht","Sunseeker 101","Sunseeker 105","Sunseeker 116","Sunseeker 131","Sunseeker 155","Sunseeker 28M","Sunseeker 30M","Sunseeker 34M","Sunseeker 37M","Sunseeker 40M","Sunseeker 86 (2008)","Sunseeker 86 (2014)","Sunseeker 88","Sunseeker 88 Yacht","Sunseeker 90","Sunseeker 90 Ocean","Sunseeker 94","Sunseeker 94 Yacht","Sunseeker 95","Sunseeker Manhattan 84","Sunseeker Ocean 182","Sunseeker Predator 108","Sunseeker Predator 115","Sunseeker Predator 130","Sunseeker Predator 84","Sunseeker Predator 92","SW108 Hybrid","Swan 100 FD","Swan 100 S","Swan 108","Swan 112","Swan 115","Swan 120","Swan 128","Swan 88","Swan 90","Swan 98","Tactical 110","Tamsen Yachts 41M","Tankoa S501","Tankoa S65","Tankoa T450","Tankoa T55 Sportiva","Tecnomar Evo 120","Tecnomar Nadara 30","Tecnomar Nadara 43","Tecnomar Velvet 100'","Tecnomar Velvet 120'","Tecnomar Velvet 30","Tecnomar Velvet 35","Tecnomar Velvet 36","Tecnomar Velvet 90","Terranova 115","Timmerman 33","Timmerman 40","Timmerman 47","Trans World Alaskan 116","Trumpy 125","Vanquish VQ115 Veloce","Versilcraft Planet 110","Versilcraft Planet 120 H.T.","Viking 90","Viking 92","Viking 93","Vittoria Veloce 32 RPH","Wally 50m","Wally 88","Wally Ace","Wally WHY200","WallyCento","Wallywind 110","Warren S87","Westport 112","Westport 125-135","Westport 130","Westport 164","Westport W117","Westship 103","Westship 106","Wider 150","Wider 165","Widercat 92","YYachts Y9","Custom","Other"];
const BASE_COMPANIES = [
  { id: "c1", name: "Felix Maritime Agency", type: "Agency", country: "Egypt", founded: 1983 },
  { id: "c2", name: "Cruising Agency", type: "Agency", country: "Egypt" },
  { id: "c3", name: "Hill Robinson", type: "Management", country: "UK" },
  { id: "c4", name: "Azimut|Benetti Group", type: "Builder", country: "Italy" },
  { id: "c5", name: "Morii Yachting d.o.o.", type: "Management", country: "Croatia" },
  { id: "c6", name: "Red Sea Provisions", type: "Supplier", country: "Egypt" },
  { id: "c7", name: "Canal Fuels Ltd", type: "Supplier", country: "Egypt" },
  { id: "c8", name: "Marine Parts Int'l", type: "Supplier", country: "UAE" },
  // Egyptian government authorities
  { id: "s1", name: "Suez Canal Authority", nameAr: "هيئة قناة السويس", type: "Government Authority", country: "Egypt" },
  { id: "s2", name: "Port Said Port Authority", nameAr: "هيئة ميناء بورسعيد", type: "Government Authority", country: "Egypt" },
  { id: "s3", name: "Suez Port Authority", nameAr: "هيئة ميناء السويس", type: "Government Authority", country: "Egypt" },
  { id: "s4", name: "Alexandria Port Authority", nameAr: "هيئة ميناء الاسكندرية", type: "Government Authority", country: "Egypt" },
  { id: "s5", name: "Hurghada Port Authority", nameAr: "هيئة ميناء الغردقة", type: "Government Authority", country: "Egypt" },
  { id: "s6", name: "Red Sea Ports Authority", nameAr: "هيئة موانى البحر الاحمر", type: "Government Authority", country: "Egypt" },
  { id: "s7", name: "Canal Pilotage Company", nameAr: "شركة القناة للارشاد", type: "Supplier", country: "Egypt" },
  { id: "s8", name: "Canal Mooring & Lights Co.", nameAr: "شركة القناة للرسو والاضاءة", type: "Supplier", country: "Egypt" },
  { id: "s9", name: "National Security", nameAr: "الامن الوطنى", type: "Government Authority", country: "Egypt" },
  { id: "s10", name: "Immigration", nameAr: "الجوازات", type: "Government Authority", country: "Egypt" },
  { id: "s11", name: "Customs", nameAr: "الجمارك", type: "Government Authority", country: "Egypt" },
  { id: "s12", name: "Quarantine / Health", nameAr: "الحجر الصحى", type: "Government Authority", country: "Egypt" },
  { id: "s13", name: "Single Window for Yachts", nameAr: "النافذة الواحدة لليخوت", type: "Government Authority", country: "Egypt" },
  { id: "s14", name: "Yacht Club", nameAr: "نادى اليخت", type: "Government Authority", country: "Egypt" },
  // Egyptian fuel suppliers
  { id: "s15", name: "Misr Petroleum Co.", type: "Supplier", country: "Egypt", cat: "Fuel" },
  { id: "s16", name: "COOP - Cooperative of Petrol", type: "Supplier", country: "Egypt", cat: "Fuel" },
  { id: "s17", name: "TOTAL Petroleum", type: "Supplier", country: "Egypt", cat: "Fuel" },
  { id: "s18", name: "SHELL Egypt", type: "Supplier", country: "Egypt", cat: "Fuel" },
  // Egyptian service suppliers
  { id: "s19", name: "Mooring Services", nameAr: "الرباط", type: "Supplier", country: "Egypt" },
  { id: "s20", name: "Fantasia Co.", type: "Supplier", country: "Egypt" },
  { id: "s21", name: "Remar", type: "Supplier", country: "Egypt" },
  // Key industry companies
  { id: "c10", name: "Lürssen Yachts", type: "Builder", country: "Germany", founded: 1875 },
  { id: "c11", name: "Feadship", type: "Builder", country: "Netherlands", founded: 1949 },
  { id: "c12", name: "Oceanco", type: "Builder", country: "Netherlands", founded: 1987 },
  { id: "c13", name: "Heesen Yachts", type: "Builder", country: "Netherlands", founded: 1978 },
  { id: "c14", name: "Perini Navi", type: "Builder", country: "Italy", founded: 1983 },
  { id: "c15", name: "Edmiston & Company", type: "Broker", country: "UK" },
  { id: "c16", name: "Burgess", type: "Broker", country: "UK" },
  { id: "c17", name: "Fraser Yachts", type: "Broker", country: "Monaco" },
  { id: "c18", name: "IYC", type: "Broker", country: "USA" },
  { id: "c19", name: "Abu Tig Marina", type: "Marina", country: "Egypt", founded: 1996, employees: 60, email: "info@abutig.com", phone: "", website: "abutig.com" },
  { id: "c20", name: "Soma Bay Marina", type: "Marina", country: "Egypt" },
  { id: "c21", name: "Port Ghalib Marina", type: "Marina", country: "Egypt" },
  { id: "c22", name: "Hurghada Marina", type: "Marina", country: "Egypt" },
];

// Auto-derive directory profiles from the master picklists so every builder/shipyard,
// exterior designer, interior designer, naval architect, and classification society
// has a company profile. Single source of truth = the lists above; one profile per
// unique name, typed by priority. Skips names already in BASE_COMPANIES and sentinels.
const DIRECTORY_COMPANIES = (() => {
  const SENTINELS = new Set(["Custom", "Other", "Unknown", ""]);
  const taken = new Set(BASE_COMPANIES.map(c => (c.name || "").trim().toLowerCase()));
  const byName = new Map();
  const priority = [
    ["Builder", BUILDERS],
    ["Naval Architect", NAVAL_ARCHITECTS],
    ["Exterior Designer", EXTERIOR_DESIGNERS],
    ["Interior Designer", INTERIOR_DESIGNERS],
    ["Classification Society", CLASS_SOCIETIES],
  ];
  for (const [type, list] of priority) {
    for (const raw of list) {
      const name = (raw || "").trim();
      if (!name || SENTINELS.has(name)) continue;
      const key = name.toLowerCase();
      if (taken.has(key) || byName.has(key)) continue;
      byName.set(key, { name, type });
    }
  }
  return [...byName.values()]
    .sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1))
    .map((c, i) => ({ id: "cd" + (i + 1), name: c.name, type: c.type }));
})();
const OWNER_COMPANIES = [
  { id: "o9", name: "Champagne Seas Limited Partnership", type: "Owner / Principal", country: "Canada", nationality: "Canadian", addresses: [{ id: "a9a", label: "Billing — Canada", lines: "692 McKay Street, Kingston, Ontario K7M 7G2, Canada", isDefault: true }] },
];
const COMPANIES = [...BASE_COMPANIES, ...DIRECTORY_COMPANIES, ...OWNER_COMPANIES];

const PERSONS = [
  { id: "p1", fullName: "James Williams", nationality: "British", rank: "Captain", passportNumber: "GB1234567", passportExpiry: "2028-03-15" },
  { id: "p2", fullName: "Marco Rossi", nationality: "Italian", rank: "Captain", passportNumber: "IT9876543", passportExpiry: "2027-11-20" },
  { id: "p3", fullName: "Jan de Vries", nationality: "Dutch", rank: "Captain", passportNumber: "NL5678901", passportExpiry: "2029-06-01" },
  { id: "p4", fullName: "Jorge Santos", nationality: "Portuguese", rank: "Chief Officer", passportNumber: "PT1112233", passportExpiry: "2028-09-10" },
  { id: "p5", fullName: "Rui Chen", nationality: "Chinese", rank: "2nd Engineer", passportNumber: "CN4455667", passportExpiry: "2027-04-22" },
  { id: "p6", fullName: "Alexei Petrov", nationality: "Russian", rank: "Bosun", passportNumber: "RU7788990", passportExpiry: "2028-01-30" },
  { id: "p7", fullName: "Michel Dubois", nationality: "French", rank: "Chef", passportNumber: "FR2233445", passportExpiry: "2029-02-14" },
  { id: "o1", fullName: "Hassan Al-Rashid", nationality: "UAE", rank: "Owner", netWorth: "$2.1B", email: "h.alrashid@gulfinvest.ae", notes: "Real estate magnate", yachtIds: ["y1", "y5"], addresses: [{ id: "a1a", label: "Dubai Office", lines: "Gulf Investment Tower, Sheikh Zayed Rd, Dubai, UAE", isDefault: true }] },
  { id: "o2", fullName: "Elena Voronova", nationality: "Russia", rank: "Owner", netWorth: "$890M", email: "e.voronova@voronovagroup.com", notes: "Tech & media entrepreneur", yachtIds: ["y2"], addresses: [{ id: "a2a", label: "Moscow Office", lines: "Tverskaya St. 12, Moscow 125009, Russia", isDefault: true }] },
  { id: "o3", fullName: "Marcus Lindström", nationality: "Sweden", rank: "Owner", netWorth: "$1.5B", email: "m.lindstrom@lindstromshipping.se", notes: "Shipping dynasty", yachtIds: ["y3", "y7"], addresses: [{ id: "a3a", label: "Stockholm HQ", lines: "Strandvägen 7A, 114 56 Stockholm, Sweden", isDefault: true }] },
  { id: "o4", fullName: "James Whitfield", nationality: "UK", rank: "Owner", netWorth: "$640M", email: "j.whitfield@whitfieldcapital.co.uk", notes: "Financial services", yachtIds: ["y4"], addresses: [{ id: "a4a", label: "London Office", lines: "1 Mayfair Place, London W1J 8AJ, United Kingdom", isDefault: true }] },
  { id: "o5", fullName: "Nikos Papadopoulos", nationality: "Greece", rank: "Owner", netWorth: "$3.2B", email: "n.papadopoulos@papagroup.gr", notes: "Shipping & energy", yachtIds: ["y6", "y8", "y10"], addresses: [{ id: "a5a", label: "Athens Office", lines: "Akti Miaouli 85, Piraeus 185 38, Greece", isDefault: true }, { id: "a5b", label: "Monaco Office", lines: "7 Avenue de Grande Bretagne, MC 98000 Monaco", isDefault: false }] },
  { id: "o6", fullName: "Fatima Al-Maktoum", nationality: "UAE", rank: "Owner", netWorth: "$1.8B", email: "f.almaktoum@almaktoumpe.ae", notes: "Private equity", yachtIds: ["y9"], addresses: [{ id: "a6a", label: "Abu Dhabi Office", lines: "Capital Gate Tower, Al Khaleej Al Arabi St, Abu Dhabi, UAE", isDefault: true }] },
  { id: "o7", fullName: "Pierre Dumont", nationality: "France", rank: "Owner", netWorth: "$520M", email: "p.dumont@dumonthotels.fr", notes: "Luxury hospitality", yachtIds: ["y11"], addresses: [{ id: "a7a", label: "Paris Office", lines: "28 Avenue Montaigne, 75008 Paris, France", isDefault: true }] },
  { id: "o8", fullName: "Chen Wei", nationality: "China", rank: "Owner", netWorth: "$4.1B", email: "c.wei@weiglobaltech.cn", notes: "Tech conglomerate", yachtIds: ["y12"], addresses: [{ id: "a8a", label: "Hong Kong Office", lines: "Two IFC, 8 Finance St, Central, Hong Kong", isDefault: true }] },
];

// Operations — Section 3
const OPERATIONS = [
  { id: "op1", opNumber: "FMA-OPS-2026-0041", status: "Active", entity: "Felix Maritime Agency", vesselName: "M/Y Champagne Seas", yachtId: "y13", clientName: "Hill Robinson", clientEmail: "ops@hillrobinson.com", vesselLoa: 62, vesselGt: 1180, vesselFlag: "GB", ports: ["HRG", "SMB", "EGN"], eta: "2026-05-15", etd: "2026-05-25", lastPort: "Jeddah", nextPort: "Antalya", baseCurrency: "USD", staffId: "s1", created: "2026-05-01", notes: "Red Sea program — multiple guest groups via EgyptAir", timestamps: { enquiryReceived: "2026-04-20T09:00:00", confirmed: "2026-04-25T14:30:00", activated: "2026-05-15T08:00:00" }, serviceCount: 12, pdaCount: 2, fdaCount: 0, totalRevenue: 18500, totalCost: 12200 },
  { id: "op2", opNumber: "GRA-OPS-2026-0042", status: "Active", entity: "German Agency", vesselName: "M/Y Ocean One", yachtId: "y20", clientName: "Azimut|Benetti Group", vesselLoa: 36, vesselGt: 285, vesselFlag: "IT", ports: ["PSD", "SUZ"], eta: "2026-05-18", etd: "2026-05-18", lastPort: "Limassol", nextPort: "Jeddah", baseCurrency: "EUR", staffId: "s2", created: "2026-05-10", notes: "Southbound transit — delivery voyage", timestamps: { enquiryReceived: "2026-05-05T10:00:00", confirmed: "2026-05-08T16:00:00", activated: "2026-05-18T06:00:00" }, serviceCount: 8, pdaCount: 1, fdaCount: 0, totalRevenue: 8200, totalCost: 5400 },
  { id: "op3", opNumber: "FMA-OPS-2026-0043", status: "Upcoming", entity: "Felix Maritime Agency", vesselName: "S/Y Platinum", yachtId: "y21", clientName: "Hill Robinson", vesselLoa: 48, vesselGt: 490, vesselFlag: "NL", ports: ["PSD", "ISM", "SUZ"], eta: "2026-05-20", etd: "2026-05-20", lastPort: "Piraeus", nextPort: "Aqaba", baseCurrency: "USD", staffId: "s1", created: "2026-05-12", notes: "Northbound transit with Ismailia bunkering stop", timestamps: { enquiryReceived: "2026-05-08T11:00:00", confirmed: "2026-05-12T09:00:00" }, serviceCount: 6, pdaCount: 1, fdaCount: 0, totalRevenue: 0, totalCost: 0 },
  { id: "op4", opNumber: "GRA-OPS-2026-0044", status: "Upcoming", entity: "German Agency", vesselName: "M/Y ARTEMISEA", yachtId: "y23", clientName: "Nikolaos Stavros", vesselLoa: 44, vesselGt: 420, vesselFlag: "GR", ports: ["PSD", "SUZ"], eta: "2026-05-22", etd: "2026-05-22", lastPort: "Rhodes", nextPort: "Hurghada", baseCurrency: "EUR", staffId: "s3", created: "2026-05-14", notes: "Southbound transit", timestamps: { enquiryReceived: "2026-05-10T14:00:00", confirmed: "2026-05-14T10:00:00" }, serviceCount: 4, pdaCount: 1, fdaCount: 0, totalRevenue: 0, totalCost: 0 },
  { id: "op5", opNumber: "FMA-OPS-2026-0040", status: "Completed", entity: "Felix Maritime Agency", vesselName: "M/Y Champagne Seas", yachtId: "y13", clientName: "Hill Robinson", vesselLoa: 62, vesselGt: 1180, vesselFlag: "GB", ports: ["SUZ", "PSD"], eta: "2026-05-12", etd: "2026-05-12", lastPort: "Suez", nextPort: "Limassol", baseCurrency: "USD", staffId: "s1", created: "2026-05-05", notes: "Northbound transit — completed", timestamps: { enquiryReceived: "2026-05-01T09:00:00", confirmed: "2026-05-03T11:00:00", activated: "2026-05-12T06:00:00", completed: "2026-05-12T19:00:00" }, serviceCount: 8, pdaCount: 1, fdaCount: 1, totalRevenue: 12800, totalCost: 8600 },
  { id: "op6", opNumber: "CRA-OPS-2026-0038", status: "Closed", entity: "Cruising Agency", vesselName: "M/Y ELDAMAR", yachtId: "y24", clientName: "Morii Yachting d.o.o.", vesselLoa: 24, vesselGt: 95, vesselFlag: "HR", ports: ["HRG", "EGN"], eta: "2026-04-20", etd: "2026-04-28", lastPort: "El Gouna", nextPort: "Bodrum", baseCurrency: "EUR", staffId: "s4", created: "2026-04-10", notes: "Red Sea stay — closed", timestamps: { enquiryReceived: "2026-04-05T08:00:00", confirmed: "2026-04-08T10:00:00", activated: "2026-04-20T07:00:00", completed: "2026-04-28T18:00:00", closed: "2026-05-10T14:00:00" }, serviceCount: 5, pdaCount: 1, fdaCount: 1, totalRevenue: 4200, totalCost: 2800 },
  { id: "op7", opNumber: "FMA-OPS-2026-0039", status: "Lost", entity: "Felix Maritime Agency", vesselName: "M/Y Lady Azure", yachtId: null, clientName: "Private Client", vesselLoa: 50, vesselGt: 700, vesselFlag: "MT", ports: ["PSD"], eta: "2026-05-15", etd: null, lastPort: null, nextPort: null, baseCurrency: "USD", staffId: "s2", created: "2026-04-28", notes: "", lostReason: "Client chose competitor", lostDate: "2026-05-02", timestamps: { enquiryReceived: "2026-04-28T11:00:00", lost: "2026-05-02T16:00:00" }, serviceCount: 0, pdaCount: 1, fdaCount: 0, totalRevenue: 0, totalCost: 0 },
  { id: "op8", opNumber: "CRA-OPS-2026-0045", status: "Enquiry", entity: "Cruising Agency", vesselName: "M/Y PANAKEIA", yachtId: "y22", clientName: "Direct — Stavros Family Office", vesselLoa: 55, vesselGt: 980, vesselFlag: "GR", ports: ["SMB", "HRG"], eta: "2026-05-28", etd: "2026-06-10", lastPort: "Piraeus", nextPort: "Maldives", baseCurrency: "EUR", staffId: "s1", created: "2026-05-16", notes: "Red Sea summer program enquiry — pending confirmation", timestamps: { enquiryReceived: "2026-05-16T10:00:00" }, serviceCount: 0, pdaCount: 0, fdaCount: 0, totalRevenue: 0, totalCost: 0 },
];

// Crew Changes — Section 11
const CREW_CHANGES = [
  { id: "cc1", opId: "op1", yacht: "M/Y Champagne Seas", type: "Embark", crewName: "Jorge Santos", role: "Chief Officer", nationality: "Portuguese", port: "HRG", date: "2026-05-19", phase: 7, status: "Confirmed", visa: "Approved", visaMethod: "Airport Visa (on Arrival)", flight: "MS 319", glStatus: "Submitted", services: { gl: true, visa: true, flight: true, transport: true, hotel: false, immigration: true } },
  { id: "cc2", opId: "op1", yacht: "M/Y Champagne Seas", type: "Disembark", crewName: "Rui Chen", role: "2nd Engineer", nationality: "Chinese", port: "HRG", date: "2026-05-19", phase: 6, status: "Confirmed", visa: "Approved", visaMethod: "e-Visa (Pre-Arrival)", flight: "MS 320", glStatus: "Acknowledged", services: { gl: true, visa: true, flight: true, transport: true, hotel: false, immigration: true } },
  { id: "cc3", opId: "op3", yacht: "S/Y Platinum", type: "Embark", crewName: "Alexei Petrov", role: "Bosun", nationality: "Russian", port: "PSD", date: "2026-05-20", phase: 4, status: "Pending", visa: "Processing", visaMethod: "Visa Sticker (Felix Inventory)", flight: "MS 054", glStatus: "Drafted", services: { gl: true, visa: true, flight: true, transport: true, hotel: false, immigration: false }, restricted: true },
  { id: "cc4", opId: "op1", yacht: "M/Y Champagne Seas", type: "Embark", crewName: "Michel Dubois", role: "Chef", nationality: "French", port: "SMB", date: "2026-05-21", phase: 3, status: "Pending", visa: "Processing", visaMethod: "Airport Visa (on Arrival)", flight: "MS 701", glStatus: null, services: { gl: false, visa: true, flight: true, transport: true, hotel: false, immigration: false } },
  { id: "cc5", opId: "op2", yacht: "M/Y Ocean One", type: "Disembark", crewName: "Luis Fernandez", role: "Deckhand", nationality: "Spanish", port: "ISM", date: "2026-05-18", phase: 9, status: "In Progress", visa: "Approved", visaMethod: "Not Required", flight: null, glStatus: null, services: { gl: false, visa: false, flight: false, transport: true, hotel: false, immigration: true } },
];

// Visa Inventory — Section 12
const VISA_BATCHES = [
  { id: "vb1", type: "Tourist Entry", code: "TES", batchRef: "TES-2026-003", dateReceived: "2026-04-15", totalStickers: 50, costPerSticker: 25, available: 12, assigned: 30, used: 8, expiry: "2026-10-15" },
  { id: "vb2", type: "Transit Visa", code: "TRV", batchRef: "TRV-2026-007", dateReceived: "2026-04-20", totalStickers: 100, costPerSticker: 15, available: 33, assigned: 55, used: 12, expiry: "2026-12-31" },
  { id: "vb3", type: "Crew Shore Pass", code: "CSP", batchRef: "CSP-2026-002", dateReceived: "2026-05-01", totalStickers: 50, costPerSticker: 10, available: 26, assigned: 18, used: 6, expiry: "2026-11-30" },
  { id: "vb4", type: "Emergency Visa", code: "EMV", batchRef: "EMV-2026-001", dateReceived: "2026-03-10", totalStickers: 25, costPerSticker: 50, available: 20, assigned: 3, used: 2, expiry: "2027-03-10" },
];

// Logistics / Provisions / Bunker
const LOGISTICS = [
  { id: "lg1", opId: "op1", yacht: "M/Y Champagne Seas", type: "Provision", code: "SUP-003", desc: "Fresh produce & dry stores", port: "SMB", date: "2026-05-18", status: "In Progress", value: 4200, currency: "USD", supplierId: "c6", supplier: "Red Sea Provisions", poNumber: "FMA-PO-2026-018", markup: "pct", markupVal: 15 },
  { id: "lg2", opId: "op2", yacht: "M/Y Ocean One", type: "Bunker", code: "SUP-001", desc: "MGO 15,000L", port: "ISM", date: "2026-05-18", status: "Vendor Assigned", value: 12500, currency: "USD", supplierId: "c7", supplier: "Canal Fuels Ltd", bunkerGrade: "MGO", qtyOrdered: 15000, bunkerStatus: "Vendor Assigned" },
  { id: "lg3", opId: "op3", yacht: "S/Y Platinum", type: "Spare Parts", code: "SUP-006", desc: "Watermaker membranes", port: "PSD", date: "2026-05-19", status: "Customs", value: 3800, currency: "USD", supplierId: "c8", supplier: "Marine Parts Int'l" },
  { id: "lg4", opId: "op1", yacht: "M/Y Champagne Seas", type: "Provision", code: "SUP-010", desc: "Beverages & wine cellar restock", port: "HRG", date: "2026-05-20", status: "Pending", value: 6700, currency: "USD", supplierId: "c6", supplier: "Red Sea Provisions", poNumber: null },
  { id: "lg5", opId: "op4", yacht: "M/Y ARTEMISEA", type: "Technical", code: "SUP-007", desc: "Generator service parts", port: "SSH", date: "2026-05-22", status: "Ordered", value: 8900, currency: "EUR", supplierId: "c8", supplier: "Marine Parts Int'l" },
];

// Transit data — Section 15
const TRANSITS = [
  { id: "tr1", opId: "op2", yacht: "M/Y Ocean One", direction: "Southbound", lastPort: "Limassol", nextPort: "Jeddah", anchorage: "Port Said Roads", convoy: "07:00", pilotEtb: "2026-05-18T06:30", roadPilot: null, inspector: "SCA Team A", transitDay: "2026-05-18", ismailiaStop: "No", status: "Underway", bookingRef: "SCA-2026-1847", notes: "Smooth transit expected" },
  { id: "tr2", opId: "op3", yacht: "S/Y Platinum", direction: "Northbound", lastPort: "Piraeus", nextPort: "Aqaba", anchorage: null, convoy: "06:00", pilotEtb: null, roadPilot: null, inspector: null, transitDay: "2026-05-20", ismailiaStop: "Yes - Bunkering", ismailiaEta: "2026-05-20T12:00", ismailiaEtd: "2026-05-20T15:00", status: "Planned", bookingRef: "SCA-2026-1852" },
  { id: "tr3", opId: "op4", yacht: "M/Y ARTEMISEA", direction: "Southbound", lastPort: "Rhodes", nextPort: "Hurghada", anchorage: null, convoy: null, pilotEtb: null, transitDay: "2026-05-22", ismailiaStop: "No", status: "Planned", bookingRef: "SCA-2026-1860" },
  { id: "tr4", opId: "op5", yacht: "M/Y Champagne Seas", direction: "Northbound", lastPort: "Suez", nextPort: "Limassol", anchorage: "Suez Anchorage", convoy: "06:00", pilotEtb: "2026-05-12T05:30", transitDay: "2026-05-12", ismailiaStop: "No", status: "Completed", bookingRef: "SCA-2026-1835" },
];

// Financial — Section 16-18
// Finance is COMPUTED from operations data (FDAs = invoices; op rollups = revenue/cost),
// not hardcoded. FIN_BASELINE holds the few accountant-entered figures the system can't
// derive yet (G&A expenses — until supplier bills/cash ledger modules exist).
const FIN_BASELINE = { gaExpenses: 3200 };
const ENTITY_CODE = { "Felix Maritime Agency": "FMA", "German Agency": "GRA", "Cruising Agency": "CRA" };

// ---- Operation team (2-3 people often share one yacht) ------------------------
// op.team = [{ staffId, role }] with the Lead first; op.staffId stays synced to
// the Lead so every existing staffId read keeps working.
const OP_TEAM_ROLES = ["Lead", "Support", "Finance", "Field"];
const opTeam = (op) => (op?.team && op.team.length ? op.team : (op?.staffId ? [{ staffId: op.staffId, role: "Lead" }] : []));
const onTeam = (op, uid) => !!uid && opTeam(op).some(m => m.staffId === uid);
const teamMembers = (op) => opTeam(op).map(m => ({ ...m, name: STAFF.find(s => s.id === m.staffId)?.name || m.staffId }));
const fdaDocTotal = (d) => (d.items || []).reduce((s, i) => s + (Number(i.actualAmount != null ? i.actualAmount : (Number(i.qty) || 0) * (Number(i.price) || 0)) || 0), 0);
const fdaDocVat = (d) => (d.items || []).reduce((s, i) => s + ((Number(i.qty) || 0) * (Number(i.price) || 0) * (Number(i.vat) || 0) / 100), 0);
// Pass-through vs agency-fee classification (audit B01, pending Finance sign-off).
// Default: third-party tolls/government fees billed onward = pass-through disbursements
// (client money, NOT revenue); only Felix's own fee/commission lines are revenue.
// An explicit line.feeType always wins over the name heuristic.
const AGENCY_FEE_RX = /agency\s*fee|agency\s*commission|agency\s*attendance|meet\s*(&|and)\s*assist|handling|supervision|coordination|attendance/i;
const lineFeeType = (l) => l.feeType || (AGENCY_FEE_RX.test(`${l.name || ""} ${l.svc || ""} ${l.group || ""}`) ? "Agency fee" : "Disbursement");
const fdaDocSplit = (d) => (d.items || []).reduce((acc, i) => {
  const amt = Number(i.actualAmount != null ? i.actualAmount : (Number(i.qty) || 0) * (Number(i.price) || 0)) || 0;
  if (lineFeeType(i) === "Agency fee") acc.fee += amt; else acc.passThrough += amt;
  return acc;
}, { fee: 0, passThrough: 0 });
// Live financial position from the operations list. Per entity: FDA-invoice counts,
// value, paid/unpaid split, AR (unpaid FDA totals). Unbilled = op revenue with no FDA
// issued yet (accrued, flagged separately from true AR). GL: revenue/cost from op
// rollups, VAT from released FDAs.
function computeFinance(ops) {
  const blank = () => ({ inv: 0, usd: 0, paid: 0, unpaid: 0, ar: 0, unbilled: 0 });
  const per = { FMA: blank(), GRA: blank(), CRA: blank() };
  let revenue = 0, cost = 0, vat = 0, feeRevenue = 0, passThrough = 0;
  (ops || []).forEach(op => {
    const p = per[ENTITY_CODE[op.entity] || "FMA"];
    const fdas = op.fdas || [];
    fdas.forEach(f => {
      const t = fdaDocTotal(f);
      const split = fdaDocSplit(f);
      feeRevenue += split.fee; passThrough += split.passThrough;
      p.inv++; p.usd += t;
      if (f.paymentStatus === "Paid") p.paid++; else { p.unpaid++; p.ar += t; }
      if (f.status === "Released" || f.glPosted) vat += fdaDocVat(f);
    });
    const rev = Number(op.totalRevenue) || 0;
    revenue += rev; cost += Number(op.totalCost) || 0;
    if (rev > 0 && fdas.length === 0 && !(op.fdaCount > 0)) p.unbilled += rev;   // actuals booked, no FDA issued
  });
  const sum = (k) => per.FMA[k] + per.GRA[k] + per.CRA[k];
  const r2 = (n) => Math.round(n * 100) / 100;
  const grossProfit = r2(revenue - cost);
  return { per, gl: {
    totalRevenue: r2(revenue), totalCost: r2(cost), grossProfit,
    gaExpenses: FIN_BASELINE.gaExpenses, netIncome: r2(grossProfit - FIN_BASELINE.gaExpenses),
    arBalance: r2(sum("ar")), unbilled: r2(sum("unbilled")), vatPayable: r2(vat),
    // Audit B01: gross billings ≠ revenue. Fee lines = Felix income; pass-through = client
    // money owed onward to SCA/ports/government (an "advances from principals" liability).
    netAgencyIncome: r2(feeRevenue), passThroughBilled: r2(passThrough),
  } };
}
// Pre-ERP invoice history (imported from the accounting records, fixed). Live ERP
// figures from computeFinance() are ADDED on top of this baseline wherever shown.
const FIN_HISTORY = {
  FMA: { invoices: 50, usd: 2132344, paid: 38, unpaid: 11, ar: 86400 },
  GRA: { invoices: 203, usd: 4091503, paid: 159, unpaid: 42, ar: 312100 },
  CRA: { invoices: 214, usd: 582041, paid: 150, unpaid: 64, ar: 34700 },
};

// ════════════════════════════════════════════════════════════════════
// EMAIL → OPERATION (stage 1 of the email integration)
// Paste-based for now: an enquiry email is parsed into a prefilled operation,
// and every later message (quote sent/accepted, arrival confirmation, service
// requests) links onto the op with a lifecycle stage. Stage 2 (live Microsoft
// 365 shared-inbox via MS Graph) plugs into the same op.emails structure.
// ════════════════════════════════════════════════════════════════════
const EMAIL_STAGES = ["Enquiry", "Quote sent", "Quote accepted", "Arrival confirmation", "Service request", "General"];
const emailStageColor = (s) => ({
  "Enquiry": [S.goldBg, S.gold], "Quote sent": [S.blueBg, S.blue], "Quote accepted": [S.greenBg, S.green],
  "Arrival confirmation": [S.cyanBg, S.cyan], "Service request": [S.orangeBg, S.orange],
}[s] || [S.bg, S.textS]);

// Best-effort extraction from a pasted email. Every field is optional — whatever
// is found prefills the create form; the operator confirms the rest.
function parseEmailEnquiry(raw) {
  const t = raw || "";
  const out = { from: "", clientName: "", subject: "", vessel: "", loa: "", gt: "", eta: "", ports: [], services: [] };
  const fromLine = t.match(/^\s*From:\s*(.+)$/im);
  if (fromLine) {
    const m = fromLine[1].match(/"?([^"<]+?)"?\s*<([^>]+)>/);
    if (m) { out.clientName = m[1].trim(); out.from = m[2].trim().toLowerCase(); }
    else out.from = (fromLine[1].match(/[\w.+-]+@[\w.-]+\.\w+/) || [""])[0].toLowerCase();
  }
  if (!out.from) out.from = (t.match(/[\w.+-]+@[\w.-]+\.\w+/) || [""])[0].toLowerCase();
  const subj = t.match(/^\s*Subject:\s*(.+)$/im);
  if (subj) out.subject = subj[1].trim();
  const vessel = t.match(/\b([MS]\/?[YV])\s+([A-Z][A-Za-z0-9' -]{2,30})/);
  if (vessel) out.vessel = `${vessel[1].toUpperCase().replace(/([MS])(\/?)([YV])/, "$1/$3")} ${vessel[2].trim()}`;
  const loa = t.match(/(\d{1,3}(?:\.\d+)?)\s*(?:m|meters?|metres?)\b[^\n]{0,12}(?:LOA)?/i) || t.match(/LOA\D{0,8}(\d{1,3}(?:\.\d+)?)/i);
  if (loa) out.loa = loa[1];
  const gt = t.match(/(\d[\d,]{0,6})\s*(?:GT|gross\s*tonn?age?)/i);
  if (gt) out.gt = gt[1].replace(/,/g, "");
  const eta = t.match(/ETA\D{0,10}(\d{4}-\d{2}-\d{2})/i) || t.match(/(\d{4}-\d{2}-\d{2})/);
  if (eta) out.eta = eta[1];
  if (/north\s*bound|N\/?B\b|N\.B\.?/i.test(t)) out.ports.push("SC-NB");
  else if (/south\s*bound|S\/?B\b|S\.B\.?/i.test(t)) out.ports.push("SC-SB");
  if (/red sea cruis/i.test(t)) out.ports.push("AREA-RS");
  PORTS_EG.forEach(p => { if (new RegExp(p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(t) && !out.ports.includes(p.code)) out.ports.push(p.code); });
  if (/bunker|fuel|MGO|MDO/i.test(t)) out.services.push("Bunkering");
  if (/provision|fresh produce|stores/i.test(t)) out.services.push("Provisions");
  if (/crew\s*change|embark|disembark|sign\s*(on|off)/i.test(t)) out.services.push("Crew change");
  if (/visa/i.test(t)) out.services.push("Visas");
  if (/spare|parts|technical/i.test(t)) out.services.push("Spare parts");
  return out;
}

// Inline team editor shown in the operation header: chips per member (Lead
// first), click a chip to cycle its role, × to remove, + to add a colleague.
function OpTeamChips({ op, patchOp }) {
  const [adding, setAdding] = useState(false);
  const team = teamMembers(op);
  const commit = (next) => {
    const lead = next.find(m => m.role === "Lead") || next[0];
    patchOp({ team: next.map(({ staffId, role }) => ({ staffId, role })), staffId: lead ? lead.staffId : null });
  };
  const cycleRole = (idx) => {
    const next = team.map((m, i) => i === idx ? { ...m, role: OP_TEAM_ROLES[(OP_TEAM_ROLES.indexOf(m.role) + 1) % OP_TEAM_ROLES.length] } : m);
    if (!next.some(m => m.role === "Lead")) next[idx] = { ...next[idx], role: "Lead" }; // never leadless
    commit(next);
  };
  const remove = (idx) => { if (team.length <= 1) return; commit(team.filter((_, i) => i !== idx)); };
  const avail = STAFF.filter(s => !team.some(m => m.staffId === s.id));
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
      {team.map((m, i) => (
        <span key={m.staffId} title={`${m.name} — ${m.role}. Click to change role${team.length > 1 ? ", × to remove" : ""}.`}
          style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 7px", borderRadius: 10, fontSize: 11, fontWeight: 500, cursor: "pointer", background: m.role === "Lead" ? S.brandL : S.bg, color: m.role === "Lead" ? S.brand : S.textS, border: `1px solid ${m.role === "Lead" ? S.line : S.borderL}` }}
          onClick={() => cycleRole(i)}>
          {m.role === "Lead" && "★ "}{m.name.split(" ")[0]}<span style={{ fontSize: 9, opacity: .75 }}>· {m.role}</span>
          {team.length > 1 && <X size={10} style={{ marginLeft: 1 }} onClick={ev => { ev.stopPropagation(); remove(i); }} />}
        </span>
      ))}
      <span style={{ position: "relative" }}>
        <button onClick={() => setAdding(!adding)} title="Add a team member" style={{ width: 18, height: 18, borderRadius: "50%", border: `1px dashed ${S.textH}`, background: "transparent", color: S.textS, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0 }}><Plus size={10} /></button>
        {adding && (
          <span style={{ position: "absolute", left: 0, top: "100%", marginTop: 4, zIndex: 30, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,.14)", minWidth: 180, display: "block" }}>
            {avail.length === 0 && <span style={{ display: "block", padding: "6px 12px", fontSize: 11, color: S.textH }}>Everyone's on it</span>}
            {avail.map(s => (
              <span key={s.id} onClick={() => { commit([...team, { staffId: s.id, role: "Support", name: s.name }]); setAdding(false); }}
                style={{ display: "block", padding: "6px 12px", fontSize: 12, cursor: "pointer", color: S.text }}
                onMouseEnter={e => e.currentTarget.style.background = S.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{s.name}</span>
            ))}
          </span>
        )}
      </span>
    </span>
  );
}

// Correspondence tab on the operation: linked emails with lifecycle stages.
function OpEmailsTab({ op, patchOp }) {
  const emails = op.emails || [];
  const [adding, setAdding] = useState(false);
  const [raw, setRaw] = useState("");
  const [stage, setStage] = useState("General");
  const [openId, setOpenId] = useState(null);
  const link = () => {
    if (!raw.trim()) return;
    const p = parseEmailEnquiry(raw);
    const e = { id: `em${Date.now()}`, dir: "in", stage, from: p.from || "—", subject: p.subject || raw.trim().split("\n")[0].slice(0, 90), body: raw.trim(), date: new Date().toISOString().slice(0, 16).replace("T", " ") };
    patchOp({ emails: [...emails, e] });
    // A service-request email should surface on the voyage too — nudge, don't automate silently.
    setRaw(""); setStage("General"); setAdding(false); setOpenId(e.id);
  };
  const remove = (id) => patchOp({ emails: emails.filter(e => e.id !== id) });
  const setStageOf = (id, s) => patchOp({ emails: emails.map(e => e.id === id ? { ...e, stage: s } : e) });
  return <>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: S.textS }}>Correspondence — {emails.length} linked email{emails.length === 1 ? "" : "s"} · newest last</div>
      <div style={{ display: "flex", gap: 6 }}>
        {op.clientEmail && <a href={`mailto:${op.clientEmail}?subject=${encodeURIComponent(`${op.opNumber} — ${op.vesselName}`)}`} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, border: `1px solid ${S.border}`, color: S.text, textDecoration: "none" }}><ExternalLink size={12} /> Email client</a>}
        <button onClick={() => setAdding(!adding)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: adding ? "transparent" : S.brand, color: adding ? S.brand : "#fff" }}><Plus size={12} /> {adding ? "Cancel" : "Link email"}</button>
      </div>
    </div>
    {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: S.textS, marginBottom: 6 }}>Paste the email (headers included if possible — From/Subject are auto-detected) and tag which stage of the operation it belongs to.</div>
      <textarea value={raw} onChange={e => setRaw(e.target.value)} rows={7} placeholder={"From: Captain Smith <captain@yacht.com>\nSubject: RE: Quote — accepted\n\nWe confirm acceptance of your PDA..."}
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${S.border}`, borderRadius: 6, padding: 10, fontSize: 12, fontFamily: "inherit", resize: "vertical" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: S.textS }}>Stage:</span>
        <select value={stage} onChange={e => setStage(e.target.value)} style={{ border: `1px solid ${S.border}`, borderRadius: 4, padding: "4px 8px", fontSize: 12 }}>{EMAIL_STAGES.map(s => <option key={s}>{s}</option>)}</select>
        <span style={{ flex: 1 }} />
        <button onClick={link} disabled={!raw.trim()} style={{ padding: "6px 16px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: raw.trim() ? "pointer" : "default", border: "none", background: raw.trim() ? S.brand : S.border, color: raw.trim() ? "#fff" : S.textH }}>Link to {op.opNumber}</button>
      </div>
    </div>}
    {emails.length === 0 && !adding && <div style={{ background: S.surface, border: `1px dashed ${S.border}`, borderRadius: 8, padding: "36px 24px", textAlign: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: S.brandL, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><MessageCircle size={20} color={S.brand} /></div>
      <div style={{ fontSize: 13, fontWeight: 500, color: S.text, marginBottom: 4 }}>No emails linked yet</div>
      <div style={{ fontSize: 12, color: S.textS, maxWidth: 420, margin: "0 auto" }}>Link the enquiry, your quote, the acceptance, arrival confirmations and service requests here — the whole email thread of the operation in one place.</div>
    </div>}
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {emails.map(e => {
        const [bg, fg] = emailStageColor(e.stage);
        const open = openId === e.id;
        return <div key={e.id} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div onClick={() => setOpenId(open ? null : e.id)} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <MessageCircle size={15} style={{ color: S.brand, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: S.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.subject}</div>
              <div style={{ fontSize: 11, color: S.textS }}>{e.from} · {e.date}</div>
            </div>
            <span style={{ padding: "2px 9px", borderRadius: 10, fontSize: 10.5, fontWeight: 500, background: bg, color: fg, flexShrink: 0 }}>{e.stage}</span>
            <ChevronDown size={15} style={{ color: S.textH, transform: open ? "rotate(180deg)" : "none", transition: ".15s", flexShrink: 0 }} />
          </div>
          {open && <div style={{ borderTop: `1px solid ${S.borderL}`, padding: "12px 14px" }}>
            <pre style={{ margin: 0, fontFamily: "inherit", fontSize: 12, color: S.text, whiteSpace: "pre-wrap", lineHeight: 1.5, maxHeight: 260, overflowY: "auto" }}>{e.body}</pre>
            <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10.5, color: S.textS }}>Stage:</span>
              <select value={e.stage} onChange={ev => setStageOf(e.id, ev.target.value)} style={{ border: `1px solid ${S.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11 }}>{EMAIL_STAGES.map(s => <option key={s}>{s}</option>)}</select>
              {e.from && e.from !== "—" && <a href={`mailto:${e.from}?subject=${encodeURIComponent(`RE: ${e.subject} [${op.opNumber}]`)}`} style={{ fontSize: 11, color: S.brand, display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}><ExternalLink size={11} /> Reply</a>}
              {e.stage === "Service request" && <span style={{ fontSize: 10.5, color: S.textS, background: S.orangeBg, padding: "2px 8px", borderRadius: 4 }}>→ add the service on the Voyage tab so it shows on the journey timeline</span>}
              <span style={{ flex: 1 }} />
              <button onClick={() => remove(e.id)} style={{ fontSize: 11, color: S.red, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}><Trash2 size={11} /> Unlink</button>
            </div>
          </div>}
        </div>;
      })}
    </div>
  </>;
}

// ════════════════════════════════════════════════════════════════════
// SC TRANSIT PACKAGES — vessels below 300 tons (PDA/FDA builder)
// Hierarchical: groups (SN item) → sub-items. `internalNote` is employee-only,
// NEVER rendered on the PDA/FDA document. `onRequest` rows print "On request"
// until priced. `autoCalc:"canalDues"` = SCNT×5×SDR from vessel dims + live SDR.
// ════════════════════════════════════════════════════════════════════
const DEFAULT_SDR = 1.3682;
const FX_RATE_EGP = 50.85; // EGP per USD — persisted onto PDAs so documents stay auditable when the rate moves (audit B05)
const SUB300_GROUPS_COMMON = {
  dues: { name: "SUEZ CANAL DUES", unit: "Per transit", subs: [
    { name: "Canal transit dues (per net ton)", autoCalc: "canalDues", qty: 1, include: true, internalNote: "Based on vessel tonnage certificate — and the SDR on the time of Transit. (L×W×D)/2.82 = SCNT; SCNT×(5×SDR) = USD dues. Rate auto-fills from the calc bar — override allowed." },
  ]},
  visa: { name: "VISA", unit: "Per person", subs: [
    { name: "Sea Visa stamp", qty: "", price: 30, include: false, internalNote: "No visa required for direct transit. If the vessel stops at Ismailia for crew embarkation/disembarkation, visa charges apply $30 per person. Qty = persons." },
  ]},
  immigration: { name: "IMMIGRATION", unit: "Per each", subs: [
    { name: "Immigration Check-in", price: "", include: false, internalNote: "Only applicable in case of visa issuance. 2,000 EGP" },
    { name: "Immigration Check-out", price: "", include: false, internalNote: "Only applicable in case of visa issuance. 2,000 EGP" },
    { name: "Immigration (embarking)", price: "", include: false, internalNote: "2,000 EGP per Operation" },
    { name: "Immigration (disembarking)", price: "", include: false, internalNote: "2,000 EGP per Operation" },
  ]},
  natsec: { name: "NATIONAL SECURITY", unit: "Per each", subs: [
    { name: "National Security clearance — Check In", price: "", include: false, internalNote: "Only applicable in case of visa issuance. 1,220 EGP" },
    { name: "National Security clearance — Check Out", price: "", include: false, internalNote: "Only applicable in case of visa issuance. 1,220 EGP" },
    { name: "National Security clearance (embarking)", price: "", include: false, internalNote: "Only applicable in case of embarking. 1,220 EGP per Operation" },
    { name: "National Security clearance (disembarking)", price: "", include: false, internalNote: "Only applicable in case of disembarking. 1,220 EGP per Operation" },
  ]},
  inspection: { name: "INSURANCE & INSPECTION", unit: "Per each", subs: [
    { name: "Marine Inspection", price: 10, include: true },
  ]},
  marina: { name: "MARINA ISMAILIA", unit: "Per day", subs: [
    { name: "Berth fee — up to 10m LOA", qty: "", price: 30, include: false, internalNote: "Charged and collected directly by the marina. Applies only if vessel berths at Ismailia. Qty = days." },
    { name: "Berth fee — 10m to 20m LOA", qty: "", price: 40, include: false, internalNote: "Charged and collected directly by the marina. Qty = days." },
    { name: "Berth fee — over 20m LOA", price: "", include: false, internalNote: "Charged and collected directly by the marina." },
  ]},
};
const SC_SUB300_PACKAGES = {
  nb: { key: "nb", label: "SC transit — Northbound under 300 Tons", groups: [
    SUB300_GROUPS_COMMON.dues,
    { name: "PORT CLEARANCE", unit: "Per transit", groupNote: "Applicable to yachts under 300 GT transiting northbound from Suez to Port Said only.", subs: [
      { name: "Same-day transit", price: 60, include: true, internalNote: "Arrival before 10:00 at anchorage. Rack $60–100." },
      { name: "Weekends / holidays", price: 180, include: false, internalNote: "Weekend / Holiday." },
    ]},
    SUB300_GROUPS_COMMON.visa, SUB300_GROUPS_COMMON.immigration, SUB300_GROUPS_COMMON.natsec, SUB300_GROUPS_COMMON.inspection, SUB300_GROUPS_COMMON.marina,
  ]},
  sb: { key: "sb", label: "SC transit — Southbound under 300 Tons", groups: [
    SUB300_GROUPS_COMMON.dues, SUB300_GROUPS_COMMON.visa, SUB300_GROUPS_COMMON.immigration, SUB300_GROUPS_COMMON.natsec, SUB300_GROUPS_COMMON.inspection, SUB300_GROUPS_COMMON.marina,
  ]},
};
const SUB300_TERMS = {
  title: "TERMS & CONDITIONS — Vessels Below 300 T",
  intro: "All fees are estimated and subject to change based on actual port tariffs and Egyptian government regulation. Felix Maritime will notify the Client in advance where possible.",
  payment: "Payment Terms: 100% advance prior to vessel arrival.",
  clauses: [
    "Fees are quoted per vessel, unless stated otherwise. Visa stamps are charged per person.",
    "Once a request has been submitted to the relevant authorities on the Client's behalf, the Client remains liable for the full amount of any official charges incurred, regardless of any later cancellation, withdrawal, or change of instruction.",
    "The Client, owner, and/or Captain bear sole and full responsibility for the accuracy and authenticity of all documents, certificates, and information provided to Felix Maritime. Should any document be found forged, false, inaccurate, or misleading, the Client, owner, and/or Captain shall bear exclusive liability for any resulting consequences, including but not limited to fines, penalties, delays, or legal action by the relevant authorities, and Felix Maritime shall be held harmless in respect thereof.",
    "The above constitutes a Proforma Disbursement Account (PDA). A Final Disbursement Account (FDA) will be issued prior to or following the vessel's departure.",
    "The above calculation excludes any Master's requirements, including but not limited to: fresh water supply, sludge removal, cash to Master, crew change arrangements, sterilization, clearance expenses, and port facilities.",
    "In accordance with the SCA Rules of Navigation, all electrical connections and searchlight sockets must conform to Suez Canal specifications.",
    "The Suez Canal Authority retains the right to claim any differences in transit dues arising from amendments to the vessel's tonnage for a statutory limitation period of five (5) years, commencing from the end of the year in which the dues were payable.",
    "The Felix Maritime fees quoted above apply exclusively to the Suez Canal transit. For any further assistance within Egypt — including berthing arrangements, hospitality services, provisioning, bunkering, and additional support — please enquire separately.",
  ],
};
// Vessel document/certificate types — drives the Documents tab dropdown.
const YACHT_DOC_TYPES = [
  "Certificate of Registry", "Certificate of Class", "Safety Equipment Certificate", "Radio Licence",
  "Insurance Certificate", "P&I Club Certificate", "GMDSS Certificate", "International Tonnage Certificate",
  "Minimum Safe Manning Document", "Crew List", "Ship Sanitation Certificate", "International Oil Pollution Prevention",
  "Anti-Fouling Certificate", "Loadline Certificate", "Commercial Yacht Code (LY3/REG)", "MLC Compliance Certificate",
  "ISM Safety Management Certificate", "ISPS Certificate", "Suez Canal Tonnage Certificate", "Customs Clearance",
  "Flag State Inspection", "Annual Survey Report", "Underwater Inspection", "Other",
];

// One vessel document as an editable card (status chip, inline fields, upload, remove).
// Text fields commit on blur; selects/dates/files commit immediately.
function YachtDocCard({ doc, onCommit, onRemove }) {
  const [d, setD] = useState(doc);
  useEffect(() => { setD(doc); }, [doc.id]);
  const exp = d.expiry || d.expiryDate || "";
  const days = exp ? Math.round((new Date(exp) - new Date()) / 86400000) : null;
  const st = days == null ? { label: "No expiry", bg: S.bg, fg: S.textS, icon: "📄", card: S.surface, border: S.border }
    : days < 0 ? { label: `Expired ${Math.abs(days)}d ago`, bg: "#FDECEC", fg: S.red, icon: "🚨", card: "#FDF3F3", border: S.red }
    : days < 90 ? { label: `Expires in ${days}d`, bg: S.orangeBg, fg: S.orange, icon: "⏳", card: "#FFFBF5", border: S.orange }
    : { label: "Valid", bg: S.greenBg, fg: S.green, icon: "📄", card: S.surface, border: S.border };
  const lbl = { fontSize: 9.5, color: S.textH, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 3 };
  const inp = { width: "100%", border: `1px solid ${S.border}`, borderRadius: 6, padding: "7px 9px", fontSize: 12, background: S.surface, boxSizing: "border-box", outline: "none", color: S.text };
  const commit = (patch) => { const next = { ...d, ...patch }; setD(next); onCommit(next); };
  const local = (patch) => setD(prev => ({ ...prev, ...patch }));
  return <div style={{ background: st.card, border: `1.5px solid ${st.border}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{st.icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 12, background: st.bg, color: st.fg }}>{st.label}</span>
      </div>
      <span onClick={onRemove} style={{ fontSize: 12, color: S.red, cursor: "pointer", opacity: 0.75 }}>Remove</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.6fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
      <div><div style={lbl}>Document name</div><input style={inp} value={d.name || ""} onChange={e => local({ name: e.target.value })} onBlur={() => onCommit(d)} /></div>
      <div><div style={lbl}>Document type</div><select style={{ ...inp, cursor: "pointer" }} value={d.docType || ""} onChange={e => commit({ docType: e.target.value })}><option value="">— Select type —</option>{YACHT_DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
      <div><div style={lbl}>Issue date</div><input type="date" style={inp} value={d.issued || d.issueDate || ""} onChange={e => commit({ issued: e.target.value })} /></div>
      <div><div style={lbl}>Expiry date</div><input type="date" style={inp} value={exp} onChange={e => commit({ expiry: e.target.value, expiryDate: undefined })} /></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.6fr 1.4fr auto", gap: 10, alignItems: "end" }}>
      <div><div style={lbl}>Issued by</div><input style={inp} value={d.issuedBy || ""} onChange={e => local({ issuedBy: e.target.value })} onBlur={() => onCommit(d)} /></div>
      <div><div style={lbl}>Reference / certificate no.</div><input style={{ ...inp, fontFamily: "monospace" }} value={d.number || d.refNumber || ""} onChange={e => local({ number: e.target.value })} onBlur={() => onCommit(d)} /></div>
      <div><div style={lbl}>Notes</div><input style={inp} value={d.notes || ""} onChange={e => local({ notes: e.target.value })} onBlur={() => onCommit(d)} /></div>
      <div><div style={lbl}>File</div>
        {d.fileData
          ? <div style={{ display: "flex", gap: 6, alignItems: "center" }}><span onClick={() => { const w = window.open(); if (w) w.document.write(`<iframe src="${d.fileData}" style="border:0;width:100%;height:100%"></iframe>`); }} style={{ fontSize: 11, fontWeight: 600, color: S.brand, cursor: "pointer", whiteSpace: "nowrap" }}>View file</span><label style={{ fontSize: 11, color: S.textS, cursor: "pointer", textDecoration: "underline" }}>Replace<input type="file" accept="image/*,application/pdf" onChange={e => { const f = e.target.files[0]; if (f) fileToDataUrl(f, url => commit({ fileData: url, fileName: f.name })); e.target.value = ""; }} style={{ display: "none" }} /></label></div>
          : <label style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: S.bg, color: S.textS, whiteSpace: "nowrap" }}><Upload size={12} /> Upload<input type="file" accept="image/*,application/pdf" onChange={e => { const f = e.target.files[0]; if (f) fileToDataUrl(f, url => commit({ fileData: url, fileName: f.name })); e.target.value = ""; }} style={{ display: "none" }} /></label>}
      </div>
    </div>
  </div>;
}

// Unit-basis options for PDA/FDA line items (dropdown on the document).
const UNIT_OPTIONS = ["Per transit", "Per person", "Per each", "Per day", "Per vessel", "Per operation", "Per call", "Per GT", "Per CBM", "Per night"];
// Payment-terms options for the PDA/FDA (dropdown; first entry is the default).
const PAYMENT_TERMS = [
  "100% advance prior to vessel arrival.",
  "50% advance, balance upon FDA issuance.",
  "Due upon FDA issuance.",
  "Due upon receipt of invoice.",
  "Net 7 days from FDA issuance.",
  "Net 15 days from FDA issuance.",
  "Net 30 days from FDA issuance.",
];

// Alerts — Section 19
const ALERTS = [
  { id: "a1", type: "warning", severity: "Warning", title: "ETA approaching", desc: "S/Y Platinum — ETA 20 May (2 days)", module: "operations", opId: "op3" },
  { id: "a2", type: "warning", severity: "Warning", title: "Unbilled revenue", desc: "M/Y Champagne Seas (OP-0041) — $18,500 actuals, no FDA issued", module: "operations", opId: "op1" },
  { id: "a3", type: "critical", severity: "Critical", title: "Visa expiring", desc: "Alexei Petrov (Russian) — restricted nationality, GL required", module: "crewchange" },
  { id: "a4", type: "warning", severity: "Warning", title: "PDA vs actuals variance", desc: "M/Y Ocean One — actuals 12% above accepted PDA", module: "operations", opId: "op2" },
  { id: "a5", type: "notice", severity: "Notice", title: "Overdue FDA", desc: "M/Y Champagne Seas (OP-0040) — FDA issued 6 days ago, unpaid", module: "finance" },
  { id: "a6", type: "gold", severity: "Info", title: "NDA in effect", desc: "M/Y Champagne Seas — Hill Robinson NDA valid until Dec 2026", module: "operations", opId: "op1" },
  { id: "a7", type: "critical", severity: "Critical", title: "Provision delivery overdue", desc: "Beverages restock for Champagne Seas — delivery date passed", module: "logistics" },
];

// MODULES LIST
const MODULES = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { key: "operations", label: "Operations", icon: ClipboardList, group: "main" },
  { key: "movements", label: "Vessel Movements", icon: Activity, group: "main" },
  { key: "yachts", label: "Yacht Directory", icon: Ship, group: "entities" },
  { key: "owners", label: "Owners", icon: UserCircle, group: "entities" },
  { key: "companies", label: "Companies", icon: Building2, group: "entities" },
  { key: "persons", label: "Persons DB", icon: Users, group: "entities" },
  { key: "transit", label: "Suez Canal Transit", icon: Compass, group: "operations" },
  { key: "crewchange", label: "Crew Change", icon: ArrowLeftRight, group: "operations" },
  { key: "visa", label: "Visa Inventory", icon: Stamp, group: "operations" },
  { key: "provisions", label: "Provision Supply", icon: ShoppingCart, group: "supply" },
  { key: "bunker", label: "Bunker Supply", icon: Fuel, group: "supply" },
  { key: "logistics", label: "Logistics", icon: Truck, group: "supply" },
  { key: "finance", label: "Finance", icon: DollarSign, group: "finance" },
  { key: "tariffs", label: "Tariff Management", icon: Receipt, group: "settings" },
  { key: "access", label: "Access Control", icon: Shield, group: "settings" },
];

// REUSABLE SAP FIORI COMPONENTS
const Status = ({ value }) => {
  const m = { Active: S.green, Confirmed: S.green, Completed: S.green, Approved: S.green, Closed: S.textS, Inactive: S.textH, "In Transit": S.blue, "In Progress": S.blue, Underway: S.blue, Pending: S.orange, Processing: S.orange, Planned: S.orange, Upcoming: S.blue, Enquiry: S.gold, Lost: S.red, "Vendor Assigned": S.blue, Customs: S.purple, Ordered: S.textS, Scheduled: S.blue, Draft: S.textH, Drafted: S.textH, Submitted: S.blue, Acknowledged: S.green, "Request Received": S.orange, "Awaiting BDN": S.purple, Cancelled: S.red, Used: S.green, Assigned: S.blue, Available: S.green };
  const c = m[value] || S.textS;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: c }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />{value}</span>;
};

const Tile = ({ title, value, icon: Ic, accent, footer, footerType = "neutral", onClick }) => (
  <div onClick={onClick} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "14px 16px", cursor: onClick ? "pointer" : "default", position: "relative", overflow: "hidden", transition: "box-shadow 0.15s" }}
    onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent || S.brand }} />
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: S.textS }}>{title}</span>
      <Ic size={16} color={accent || S.brand} />
    </div>
    <div style={{ fontSize: 26, fontWeight: 600, color: S.text, lineHeight: 1 }}>{value}</div>
    {footer && <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, color: footerType === "up" ? S.green : footerType === "down" ? S.red : S.textS }}>{footerType === "up" && <TrendingUp size={12} />}{footerType === "down" && <TrendingDown size={12} />}{footer}</div>}
  </div>
);

const FilterBar = ({ filters, active, onToggle, count }) => (
  <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
    <Filter size={14} color={S.textS} />
    <span style={{ fontSize: 11, color: S.textS, fontWeight: 500 }}>Filters:</span>
    {filters.map(f => (
      <button key={f} onClick={() => onToggle(f)} style={{ padding: "3px 9px", borderRadius: 4, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, background: active.includes(f) ? S.brandL : S.surface, border: `1px solid ${active.includes(f) ? S.brand : S.border}`, color: active.includes(f) ? S.brand : S.text }}>
        {active.includes(f) && <Check size={10} />}{f}
      </button>
    ))}
    <div style={{ flex: 1 }} />
    <span style={{ fontSize: 11, color: S.textH }}>{count} items</span>
  </div>
);

const Table = ({ columns, data }) => (
  <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: "0 0 8px 8px", overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead><tr style={{ background: "#F2F2F2" }}>
        {columns.map((c, i) => <th key={i} style={{ textAlign: "left", padding: "9px 12px", color: S.textS, fontWeight: 500, fontSize: 11, borderBottom: `1px solid ${S.border}`, whiteSpace: "nowrap" }}>{c.label}</th>)}
      </tr></thead>
      <tbody>{data.map((row, ri) => (
        <tr key={ri} onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {columns.map((c, ci) => <td key={ci} style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}`, whiteSpace: "nowrap", color: S.text }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
        </tr>
      ))}</tbody>
    </table>
  </div>
);

const Toolbar = ({ title, onCreate }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
    <span style={{ fontSize: 13, fontWeight: 500, color: S.text }}>{title}</span>
    <div style={{ display: "flex", gap: 6 }}>
      {onCreate && <button onClick={onCreate} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.orange}`, background: S.orange, color: "#fff" }}><Plus size={12} /> Create</button>}
      <button onClick={() => alert("Export to Excel — generates .xlsx with all visible rows and applied filters")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><Download size={12} /> Export</button>
      <button onClick={() => alert("Column settings — show/hide columns, reorder, save view")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}><SlidersHorizontal size={12} /></button>
    </div>
  </div>
);

const ObjLink = ({ children }) => <span style={{ color: S.brand, fontWeight: 500, cursor: "pointer" }}>{children}</span>;
const InfoStrip = ({ children, type = "info" }) => {
  const c = { info: { bg: S.blueBg, brd: S.brand, txt: S.brand }, warning: { bg: S.orangeBg, brd: S.orange, txt: "#8A4B06" }, gold: { bg: S.goldBg, brd: S.gold, txt: "#7A6420" }, critical: { bg: S.redBg, brd: S.red, txt: S.red } }[type] || { bg: S.blueBg, brd: S.brand, txt: S.brand };
  return <div style={{ background: c.bg, borderLeft: `3px solid ${c.brd}`, borderRadius: "0 4px 4px 0", padding: "9px 14px", fontSize: 12, color: c.txt, display: "flex", alignItems: "flex-start", gap: 8, marginTop: 12 }}><AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} /><div>{children}</div></div>;
};
const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${S.border}`, marginBottom: 12, background: S.surface, borderRadius: "8px 8px 0 0", padding: "0 6px" }}>
    {tabs.map(t => <button key={t.key} onClick={() => onChange(t.key)} style={{ padding: "9px 14px", fontSize: 12, cursor: "pointer", border: "none", background: "transparent", marginBottom: -1, color: active === t.key ? S.brand : S.textS, fontWeight: active === t.key ? 500 : 400, borderBottom: `2px solid ${active === t.key ? S.brand : "transparent"}` }}>{t.label}{t.count != null && <span style={{ marginLeft: 4, fontSize: 10, color: S.textH }}>({t.count})</span>}</button>)}
  </div>
);


// ════════════════════════════════════════════════════════════════════
// VOYAGE PLANNER — per-operation numbered itinerary + Google route chart
// ════════════════════════════════════════════════════════════════════

// At integration with live tiles: set VOYAGE_GMAPS_KEY (or wire to app config).
// Empty string → numbered schematic fallback. A valid key → live Google tiles
// with numbered AdvancedMarker/Marker pins, no other code change required.
const VOYAGE_GMAPS_KEY = "";

const VOYAGE_SVC = {
  clearance:    { label: "Customs & Immigration", est: 850 },
  transit:      { label: "Canal Dues & Pilotage", est: 9500 },
  berth:        { label: "Berth / Mooring", est: 1200 },
  bunkering:    { label: "Bunkering", est: 600 },
  provisioning: { label: "Provisioning", est: 450 },
  washdown:     { label: "Hull Washdown", est: 300 },
  crew:         { label: "Crew Change / Visa", est: 700 },
  meet:         { label: "Meet & Assist", est: 350 },
  experience:   { label: "Guest Experiences", est: 1500 },
};
const VOYAGE_SVC_KEYS = Object.keys(VOYAGE_SVC);
const portByCode = (c) => PORTS_EG.find(p => p.code === c) || VIRTUAL_PORTS[c];

function loadVoyageGoogleMaps(key) {
  return new Promise((res, rej) => {
    if (window.google && window.google.maps) return res(window.google);
    const existing = document.getElementById("felix-voyage-gmaps");
    if (existing) { existing.addEventListener("load", () => res(window.google)); existing.addEventListener("error", rej); return; }
    const s = document.createElement("script");
    s.id = "felix-voyage-gmaps";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
    s.async = true; s.defer = true;
    s.onload = () => res(window.google); s.onerror = rej;
    document.head.appendChild(s);
  });
}

const VoyageKpi = ({ label, value, accent, bar }) => (
  <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "10px 14px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent ? S.brand : S.borderL }} />
    <div style={{ fontSize: 11, color: S.textS, marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 600, color: accent ? S.brand : S.text }}>{value}</div>
    {bar != null && <div style={{ marginTop: 6, height: 4, borderRadius: 3, background: S.borderL }}><div style={{ width: `${bar}%`, height: "100%", borderRadius: 3, background: S.green }} /></div>}
  </div>
);
const VoyageCostRow = ({ k, v }) => <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 13 }}><span style={{ color: S.textS }}>{k}</span><span>${v.toLocaleString()}</span></div>;

function VoyagePortPicker({ onPick, onCancel, withVirtual }) {
  const cats = ["Mediterranean", "Suez Canal Zone", "Red Sea (Northern)", "Red Sea (Central & Southern)", "Gulf of Aqaba"];
  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14, marginTop: 10, textAlign: "left" }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: S.textS, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Select port from Egyptian port library</div>
      {withVirtual && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: S.textH, marginBottom: 4 }}>Canal transit &amp; cruising areas</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.values(VIRTUAL_PORTS).map(p => (
              <button key={p.code} onClick={() => onPick(p.code)}
                style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: S.cyanBg, color: S.cyan, display: "flex", alignItems: "center", gap: 4 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = S.cyan; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; }}><Waves size={11} /> {p.name}</button>
            ))}
          </div>
        </div>
      )}
      {cats.map(cat => {
        const list = PORTS_EG.filter(p => p.cat === cat);
        if (!list.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: S.textH, marginBottom: 4 }}>{cat}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {list.map(p => (
                <button key={p.code} onClick={() => onPick(p.code)}
                  style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: S.bg, color: S.text }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = S.brand; e.currentTarget.style.color = S.brand; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.text; }}>{p.name}</button>
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 4 }}>
        <button onClick={onCancel} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Cancel</button>
      </div>
    </div>
  );
}

function VoyageDateField({ value, onChange, label, placeholder }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>{label}</div>
      <input value={value || ""} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "5px 7px", fontSize: 12, boxSizing: "border-box" }} />
    </div>
  );
}

function VoyageLegCard({ leg, seq, sel, onSel, onSetField, onToggle, onRemove, onAdd, onRemoveLeg }) {
  const [menu, setMenu] = useState(false);
  const done = leg.services.filter(s => s.arranged).length;
  const avail = VOYAGE_SVC_KEYS.filter(k => !leg.services.some(s => s.key === k));
  return (
    <div style={{ position: "relative", paddingLeft: 40 }}>
      <div style={{ position: "absolute", left: 0, top: 12, width: 26, height: 26, borderRadius: "50%", background: sel ? S.brand : S.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: "2px solid #fff", boxShadow: `0 0 0 1px ${S.border}`, zIndex: 1 }}>{seq}</div>
      <div style={{ background: S.surface, border: `1px solid ${sel ? S.brand : S.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div onClick={onSel} style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 500, color: S.text }}>{leg.name}</span>
              <span style={{ fontSize: 11, color: S.textS, background: S.bg, padding: "1px 7px", borderRadius: 10 }}>{leg.code}</span>
              <Status value={leg.status} />
            </div>
            <div style={{ fontSize: 11, color: S.textS, marginTop: 2 }}>{leg.region}{leg.arrive ? ` · ${leg.arrive}` : ""}{leg.depart ? ` → ${leg.depart}` : ""}</div>
          </div>
          <span style={{ fontSize: 11, color: S.textS }}>{done}/{leg.services.length}</span>
          <ChevronDown size={16} style={{ color: S.textH, transform: sel ? "rotate(180deg)" : "none", transition: ".15s" }} />
        </div>
        {sel && (
          <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${S.borderL}` }}>
            <div style={{ display: "flex", gap: 10, margin: "12px 0" }}>
              <VoyageDateField label="Arrive" value={leg.arrive} placeholder="e.g. 16 Jun · 11:00" onChange={v => onSetField(leg.id, "arrive", v)} />
              <VoyageDateField label="Depart" value={leg.depart} placeholder="e.g. 19 Jun · 08:00" onChange={v => onSetField(leg.id, "depart", v)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: S.textS, textTransform: "uppercase", letterSpacing: ".04em" }}>Services · click to confirm</span>
              <div style={{ position: "relative" }}>
                <button onClick={() => setMenu(!menu)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><Plus size={11} /> Add service</button>
                {menu && (
                  <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, zIndex: 20, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,.12)", minWidth: 190 }}>
                    {avail.length === 0 && <div style={{ padding: "7px 12px", fontSize: 11, color: S.textH }}>All added</div>}
                    {avail.map(k => (
                      <div key={k} onClick={() => { onAdd(leg.id, k); setMenu(false); }} style={{ padding: "7px 12px", fontSize: 12, cursor: "pointer", color: S.text }}
                        onMouseEnter={e => e.currentTarget.style.background = S.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{VOYAGE_SVC[k].label}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
              {leg.services.map((s, k) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderTop: k ? `1px solid ${S.borderL}` : "none" }}>
                  <span style={{ flex: 1, fontSize: 12 }}>{VOYAGE_SVC[s.key].label}</span>
                  <span style={{ fontSize: 11, color: S.textS }}>${s.est}</span>
                  <button onClick={() => onToggle(leg.id, s.key)} style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4, cursor: "pointer", border: "none", background: s.arranged ? S.greenBg : S.bg, color: s.arranged ? S.green : S.textS, display: "flex", alignItems: "center", gap: 3 }}>{s.arranged ? <><Check size={11} /> arranged</> : "pending"}</button>
                  <button onClick={() => onRemove(leg.id, s.key)} style={{ border: "none", background: "none", cursor: "pointer", color: S.textH }}><X size={13} /></button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <button onClick={onRemoveLeg} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.red }}><Trash2 size={12} /> Remove this port</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Journey timeline (client-journey map) ----------------------------------
// The voyage rendered as a horizontal timeline: phase bands on top (grouped by
// region), a numbered node per stop, and each stop's services popping out
// beneath it. Clicking a service opens a detail panel; stops and services can
// be added directly on the timeline. Reuses the same `plan` legs as the
// itinerary, so everything stays linked to the operation & vessel and persists.
function JourneyTimeline({ op, plan, sel, onSelStop, svcSel, onSelSvc, onToggleSvc, onSetSvcField, onRemoveSvc, onAddSvc, onInsertStop, onRemoveLeg }) {
  const [svcMenu, setSvcMenu] = useState(null);   // leg.id with the +service menu open
  const [addingAt, setAddingAt] = useState(null); // index to insert a stop at

  const phases = [];
  plan.forEach(l => {
    const label = l.region || "En route";
    const last = phases[phases.length - 1];
    if (last && last.label === label) last.count++;
    else phases.push({ label, count: 1 });
  });

  const isVirtual = (code) => !!VIRTUAL_PORTS[code];
  const selLeg = svcSel ? plan.find(l => l.id === svcSel.legId) : null;
  const selSvc = selLeg ? selLeg.services.find(s => s.key === svcSel.key) : null;
  const selMeta = selSvc ? (VOYAGE_SVC[selSvc.key] || { label: selSvc.key }) : null;

  const chev = "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)";
  const insertBtn = (idx) => (
    <div style={{ width: 18, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <button title="Insert a stop here" onClick={() => { setAddingAt(idx); setSvcMenu(null); }}
        style={{ width: 18, height: 18, marginTop: 7, borderRadius: "50%", border: `1px dashed ${S.textH}`, background: S.surface, color: S.textS, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, zIndex: 1 }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = S.brand; e.currentTarget.style.color = S.brand; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = S.textH; e.currentTarget.style.color = S.textS; }}><Plus size={11} /></button>
    </div>
  );

  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, marginBottom: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${S.borderL}`, flexWrap: "wrap" }}>
        <Waves size={15} style={{ color: S.brand }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: S.navy }}>Journey timeline</span>
        <span style={{ fontSize: 11, color: S.textS, background: S.bg, padding: "1px 8px", borderRadius: 10 }}>{op.vesselName}</span>
        <span style={{ fontSize: 11, color: S.textS, background: S.bg, padding: "1px 8px", borderRadius: 10 }}>{op.opNumber}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: S.textH }}>click a stop or service for details · use + to add along the route</span>
      </div>

      <div style={{ overflowX: "auto", padding: "14px 16px 16px" }}>
        <div style={{ minWidth: Math.max(plan.length * 150 + 120, 560) }}>
          {/* phase bands */}
          <div style={{ display: "flex", gap: 3, marginBottom: 16, paddingRight: 100 }}>
            {phases.map((ph, i) => (
              <div key={i} style={{ flex: ph.count, minWidth: 0, background: S.navy, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: ".02em", padding: "5px 18px 5px 12px", clipPath: chev, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ph.label}</div>
            ))}
          </div>

          {/* nodes + services */}
          <div style={{ position: "relative", display: "flex", alignItems: "flex-start" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 15, height: 2, background: S.line }} />
            {plan.map((l, i) => {
              const on = sel === l.id;
              const virt = isVirtual(l.code);
              return (
                <Fragment key={l.id}>
                  {i > 0 && insertBtn(i)}
                  <div style={{ flex: 1, minWidth: 132, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 4px" }}>
                    <button onClick={() => onSelStop(on ? null : l.id)} title={virt ? l.name : `${l.name} — open in itinerary`}
                      style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #fff", boxShadow: `0 0 0 ${on ? 2 : 1}px ${on ? S.brand : S.border}`, background: on ? S.brand : virt ? S.cyan : S.navy, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, flexShrink: 0 }}>
                      {virt ? <Waves size={14} /> : i + 1}
                    </button>
                    <div style={{ fontSize: 11, fontWeight: on ? 600 : 500, color: on ? S.brand : S.text, marginTop: 6, textAlign: "center", lineHeight: 1.3, maxWidth: 140 }}>{l.name}</div>
                    <div style={{ fontSize: 9.5, color: S.textS, marginTop: 1, textAlign: "center" }}>{l.arrive || "ETA —"}{l.depart ? ` → ${l.depart}` : ""}</div>
                    {/* connector down to services */}
                    {(l.services.length > 0) && <div style={{ width: 0, height: 8, borderLeft: `1px dashed ${S.textH}`, marginTop: 4 }} />}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4, alignItems: "stretch", width: "100%", maxWidth: 148 }}>
                      {l.services.map(s => {
                        const m = VOYAGE_SVC[s.key] || { label: s.key };
                        const active = svcSel && svcSel.legId === l.id && svcSel.key === s.key;
                        return (
                          <button key={s.key} onClick={() => onSelSvc(active ? null : { legId: l.id, key: s.key })}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 10, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${active ? S.brand : s.arranged ? "#BFE3CC" : S.border}`, background: active ? S.brandL : s.arranged ? S.greenBg : S.surface, color: s.arranged ? S.green : S.textS, textAlign: "left" }}>
                            {s.arranged ? <Check size={10} style={{ flexShrink: 0 }} /> : <CircleDot size={9} style={{ flexShrink: 0 }} />}
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</span>
                          </button>
                        );
                      })}
                      <div style={{ position: "relative" }}>
                        <button onClick={() => { setSvcMenu(svcMenu === l.id ? null : l.id); }}
                          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px dashed ${S.border}`, background: "transparent", color: S.textH }}
                          onMouseEnter={e => { e.currentTarget.style.color = S.brand; e.currentTarget.style.borderColor = S.brand; }}
                          onMouseLeave={e => { e.currentTarget.style.color = S.textH; e.currentTarget.style.borderColor = S.border; }}><Plus size={9} /> service</button>
                        {svcMenu === l.id && (
                          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "100%", marginTop: 4, zIndex: 30, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,.14)", minWidth: 185 }}>
                            {VOYAGE_SVC_KEYS.filter(k => !l.services.some(s => s.key === k)).map(k => (
                              <div key={k} onClick={() => { onAddSvc(l.id, k); setSvcMenu(null); onSelSvc({ legId: l.id, key: k }); }}
                                style={{ padding: "6px 12px", fontSize: 11, cursor: "pointer", color: S.text }}
                                onMouseEnter={e => e.currentTarget.style.background = S.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{VOYAGE_SVC[k].label}</div>
                            ))}
                            {VOYAGE_SVC_KEYS.every(k => l.services.some(s => s.key === k)) && <div style={{ padding: "6px 12px", fontSize: 11, color: S.textH }}>All services added</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
            {/* add stop at the end */}
            {insertBtn(plan.length)}
            <div style={{ width: 96, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <button onClick={() => setAddingAt(plan.length)}
                style={{ width: 32, height: 32, borderRadius: "50%", border: `2px dashed ${S.textH}`, background: S.surface, color: S.textS, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = S.brand; e.currentTarget.style.color = S.brand; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = S.textH; e.currentTarget.style.color = S.textS; }}><Plus size={15} /></button>
              <div style={{ fontSize: 10, color: S.textH, marginTop: 6 }}>Add stop</div>
            </div>
          </div>
        </div>
      </div>

      {/* service detail panel */}
      {selLeg && selSvc && (
        <div style={{ borderTop: `1px solid ${S.borderL}`, background: S.bg, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: S.navy }}>{selMeta.label}</span>
            <span style={{ fontSize: 10.5, fontWeight: 500, padding: "2px 8px", borderRadius: 10, background: selSvc.arranged ? S.greenBg : S.goldBg, color: selSvc.arranged ? S.green : S.gold }}>{selSvc.arranged ? "Arranged" : "Pending"}</span>
            <span style={{ fontSize: 11, color: S.textS, background: S.surface, border: `1px solid ${S.borderL}`, padding: "1px 8px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={10} /> {selLeg.name}</span>
            <span style={{ fontSize: 11, color: S.textS, background: S.surface, border: `1px solid ${S.borderL}`, padding: "1px 8px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4 }}><Ship size={10} /> {op.vesselName}</span>
            <span style={{ fontSize: 11, color: S.textS, background: S.surface, border: `1px solid ${S.borderL}`, padding: "1px 8px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4 }}><ClipboardList size={10} /> {op.opNumber}</span>
            <span style={{ flex: 1 }} />
            <button onClick={() => onSelSvc(null)} style={{ border: "none", background: "none", cursor: "pointer", color: S.textH, padding: 2 }}><X size={15} /></button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Estimate (USD)</div>
              <input type="number" value={selSvc.est ?? ""} onChange={e => onSetSvcField(selLeg.id, selSvc.key, "est", Number(e.target.value) || 0)}
                style={{ width: 110, border: `1px solid ${S.border}`, borderRadius: 3, padding: "5px 7px", fontSize: 12, boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Notes (supplier, reference, timing…)</div>
              <input value={selSvc.note || ""} placeholder="e.g. 2 crew embarking at Suez — visas via batch V-104" onChange={e => onSetSvcField(selLeg.id, selSvc.key, "note", e.target.value)}
                style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "5px 7px", fontSize: 12, boxSizing: "border-box" }} />
            </div>
            <button onClick={() => onToggleSvc(selLeg.id, selSvc.key)}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: "none", background: selSvc.arranged ? S.bg : S.green, color: selSvc.arranged ? S.textS : "#fff" }}>
              {selSvc.arranged ? "Mark pending" : <><Check size={12} /> Mark arranged</>}
            </button>
            <button onClick={() => { onRemoveSvc(selLeg.id, selSvc.key); onSelSvc(null); }}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.red }}><Trash2 size={12} /> Remove</button>
          </div>
        </div>
      )}

      {/* stop picker for timeline insertion */}
      {addingAt != null && (
        <div style={{ borderTop: `1px solid ${S.borderL}`, padding: "0 16px 14px" }}>
          <VoyagePortPicker withVirtual onPick={(code) => { onInsertStop(code, addingAt); setAddingAt(null); }} onCancel={() => setAddingAt(null)} />
        </div>
      )}
    </div>
  );
}

function VoyageRouteChart({ ports, sel, onPick, vessel }) {
  const mapEl = useRef(null), mapObj = useRef(null), markers = useRef([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!VOYAGE_GMAPS_KEY) return;
    let done = false;
    loadVoyageGoogleMaps(VOYAGE_GMAPS_KEY).then(g => {
      if (done || !mapEl.current) return;
      mapObj.current = new g.maps.Map(mapEl.current, { center: { lat: 29.8, lng: 32.6 }, zoom: 6, mapId: "FELIX_VOYAGE", disableDefaultUI: true, zoomControl: true, gestureHandling: "greedy" });
      setLive(true);
    }).catch(() => {});
    return () => { done = true; };
  }, []);

  useEffect(() => {
    if (!live || !mapObj.current || !window.google) return;
    const g = window.google;
    markers.current.forEach(m => m.setMap && m.setMap(null)); markers.current = [];
    const bounds = new g.maps.LatLngBounds();
    ports.forEach((p, i) => {
      bounds.extend({ lat: p.lat, lng: p.lng });
      const on = sel === p.id;
      const m = new g.maps.Marker({
        position: { lat: p.lat, lng: p.lng }, map: mapObj.current, zIndex: on ? 99 : 1,
        label: { text: String(i + 1), color: "#fff", fontSize: "12px", fontWeight: "700" },
        icon: { path: g.maps.SymbolPath.CIRCLE, scale: on ? 15 : 12, fillColor: on ? S.brand : "#1B1B1B", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
      });
      m.addListener("click", () => onPick(p.id));
      markers.current.push(m);
    });
    if (!bounds.isEmpty()) mapObj.current.fitBounds(bounds, 50);
  }, [live, ports, sel]);

  const openRoute = () => {
    const wp = ports.map(p => `${p.lat},${p.lng}`).join("/");
    window.open(`https://www.google.com/maps/dir/${wp}`, "_blank", "noopener");
  };

  // schematic projection
  const lats = ports.map(p => p.lat), lngs = ports.map(p => p.lng);
  const minLat = Math.min(...lats) - 0.8, maxLat = Math.max(...lats) + 0.8;
  const minLng = Math.min(...lngs) - 0.8, maxLng = Math.max(...lngs) + 0.8;
  const W = 380, H = 240, pad = 30;
  const px = l => pad + ((l - minLng) / ((maxLng - minLng) || 1)) * (W - pad * 2);
  const py = l => pad + ((maxLat - l) / ((maxLat - minLat) || 1)) * (H - pad * 2);
  const pts = ports.map(p => [px(p.lng), py(p.lat)]);

  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${S.borderL}` }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: S.text }}>Route chart</span>
        <span style={{ fontSize: 11, color: S.textH, display: "flex", alignItems: "center", gap: 4 }}><Waves size={12} /> order of call</span>
      </div>
      <div style={{ position: "relative", height: 240, background: "#dcebf3" }}>
        {VOYAGE_GMAPS_KEY && <div ref={mapEl} style={{ position: "absolute", inset: 0 }} />}
        {!VOYAGE_GMAPS_KEY && (
          <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <defs><linearGradient id="voyageSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DCEBF3" /><stop offset="1" stopColor="#C9E0EC" /></linearGradient></defs>
            <rect width={W} height={H} fill="url(#voyageSea)" />
            {[...Array(8)].map((_, i) => <line key={"v" + i} x1={i * (W / 7)} y1="0" x2={i * (W / 7)} y2={H} stroke="#fff" strokeWidth=".5" opacity=".35" />)}
            {[...Array(6)].map((_, i) => <line key={"h" + i} x1="0" y1={i * (H / 5)} x2={W} y2={i * (H / 5)} stroke="#fff" strokeWidth=".5" opacity=".35" />)}
            <path d={pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ")} fill="none" stroke={S.brand} strokeWidth="2" strokeDasharray="5 5" opacity=".5" strokeLinecap="round" />
            {ports.map((p, i) => { const on = sel === p.id; const [x, y] = pts[i]; return (
              <g key={p.id} onClick={() => onPick(p.id)} style={{ cursor: "pointer" }}>
                {on && <circle cx={x} cy={y} r="15" fill={S.brand} opacity=".18" />}
                <circle cx={x} cy={y} r={on ? 13 : 11} fill={on ? S.brand : "#1B1B1B"} stroke="#fff" strokeWidth="2.5" />
                <text x={x} y={y + 4} fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle">{i + 1}</text>
              </g>); })}
          </svg>
        )}
        <div style={{ position: "absolute", top: 10, right: 10, width: 170, background: S.surface, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.16)", padding: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: S.text, lineHeight: 1.3 }}>{vessel}</div>
          <div style={{ fontSize: 10, color: S.textS, margin: "4px 0 8px", lineHeight: 1.4 }}>Numbered order of call · legs are sea passages, not roads.</div>
          <button onClick={openRoute} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px", borderRadius: 5, border: "none", background: "#1B1B1B", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}><Navigation size={12} /> Open route</button>
        </div>
        {!VOYAGE_GMAPS_KEY && <div style={{ position: "absolute", left: 8, bottom: 6, fontSize: 9, color: S.textH }}>Schematic — set VOYAGE_GMAPS_KEY for live Google tiles</div>}
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {ports.map((p, i) => { const on = sel === p.id; return (
          <div key={p.id} onClick={() => onPick(p.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", cursor: "pointer", background: on ? S.brandL : "transparent", borderLeft: `3px solid ${on ? S.brand : "transparent"}`, borderTop: i ? `1px solid ${S.borderL}` : "none" }}>
            <span style={{ width: 30, height: 30, borderRadius: 6, background: on ? S.brand : S.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: S.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i + 1} — {p.name}</div>
              <div style={{ fontSize: 10, color: S.textS }}>{p.region}</div>
            </div>
            {on && <Check size={14} style={{ color: S.brand }} />}
          </div>); })}
      </div>
    </div>
  );
}

// Per-operation voyage planner. `plan` is an array of legs stored under op.id.
function VoyageTab({ op, plan, setPlan }) {
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const [svcSel, setSvcSel] = useState(null); // {legId, key} — service open in the journey-timeline detail panel
  // The itinerary auto-builds from the operation's ports of call, so the Voyage tab
  // reflects the op without a manual pre-fill step. Seeds once per op — deliberately
  // cleared plans are not re-seeded within the session.
  const autoSeeded = useRef({});

  const stats = useMemo(() => {
    let sub = 0, done = 0, total = 0;
    plan.forEach(l => l.services.forEach(s => { sub += s.est; total++; if (s.arranged) done++; }));
    return { sub, fee: Math.round(sub * 0.1), grand: Math.round(sub * 1.1), done, total, pct: total ? Math.round(done / total * 100) : 0 };
  }, [plan]);

  const addPort = (code, at = null) => {
    const p = portByCode(code); if (!p) return;
    const id = code + "_" + Date.now();
    const leg = { id, code, name: p.name, region: p.cat, lat: p.lat, lng: p.lng, arrive: "", depart: "", status: "Planned",
      services: [{ key: "clearance", est: VOYAGE_SVC.clearance.est, arranged: false }, { key: "berth", est: VOYAGE_SVC.berth.est, arranged: false }] };
    setPlan(ls => { const n = [...ls]; n.splice(at == null ? n.length : Math.min(at, n.length), 0, leg); return n; });
    setSel(id); setAdding(false);
  };
  const seedFromPorts = () => {
    const legs = (op.ports || []).map((code, i) => {
      const p = portByCode(code);
      return { id: code + "_" + i + "_" + Date.now(), code, name: p?.name || code, region: p?.cat || "", lat: p?.lat || 0, lng: p?.lng || 0, arrive: "", depart: "", status: "Planned",
        services: [{ key: "clearance", est: VOYAGE_SVC.clearance.est, arranged: false }, { key: "berth", est: VOYAGE_SVC.berth.est, arranged: false }] };
    });
    setPlan(legs); setSel(legs[0]?.id || null);
  };
  useEffect(() => {
    if (plan.length === 0 && (op.ports || []).length > 0 && !autoSeeded.current[op.id]) {
      autoSeeded.current[op.id] = true;
      seedFromPorts();
    }
  }, [op.id, plan.length]);
  const removeLeg = (id) => { setPlan(ls => ls.filter(l => l.id !== id)); if (sel === id) setSel(null); if (svcSel?.legId === id) setSvcSel(null); };
  const setField = (lid, field, v) => setPlan(ls => ls.map(l => l.id === lid ? { ...l, [field]: v } : l));
  const setSvcField = (lid, key, field, v) => setPlan(ls => ls.map(l => l.id === lid ? { ...l, services: l.services.map(s => s.key === key ? { ...s, [field]: v } : s) } : l));
  const toggleSvc = (lid, key) => setPlan(ls => ls.map(l => l.id === lid ? { ...l, services: l.services.map(s => s.key === key ? { ...s, arranged: !s.arranged } : s) } : l));
  const removeSvc = (lid, key) => setPlan(ls => ls.map(l => l.id === lid ? { ...l, services: l.services.filter(s => s.key !== key) } : l));
  const addSvc = (lid, key) => setPlan(ls => ls.map(l => l.id === lid ? { ...l, services: [...l.services, { key, est: VOYAGE_SVC[key].est, arranged: false }] } : l));

  const pushToPda = () => {
    const arranged = plan.flatMap(l => l.services.filter(s => s.arranged).map(s => ({ port: l.name, svc: VOYAGE_SVC[s.key].label, est: s.est })));
    if (!arranged.length) { alert("No arranged services yet — confirm services on the itinerary first, then push to PDA."); return; }
    alert(`Drafting PDA for ${op.opNumber} with ${arranged.length} arranged service${arranged.length > 1 ? "s" : ""} ($${arranged.reduce((a, x) => a + x.est, 0).toLocaleString()} subtotal). Opens in the PDA tab for Pricing & Quotations to confirm.`);
  };

  if (plan.length === 0) {
    return (
      <>
        <div style={{ fontSize: 12, color: S.textS, marginBottom: 12 }}>Voyage planner — numbered itinerary &amp; route chart for {op.vesselName}</div>
        <div style={{ background: S.surface, border: `1px dashed ${S.border}`, borderRadius: 8, padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, background: S.brandL, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><MapPin size={22} color={S.brand} /></div>
          <div style={{ fontSize: 14, fontWeight: 500, color: S.text, marginBottom: 4 }}>No voyage plan yet</div>
          <div style={{ fontSize: 12, color: S.textS, maxWidth: 440, margin: "0 auto 16px", lineHeight: 1.5 }}>Build the call sequence for this operation. Each stop is numbered in order of call and plotted on the route chart, with a per-port service checklist that can be pushed to the PDA.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Plus size={13} /> Add first port call</button>
          </div>
          {adding && <VoyagePortPicker onPick={addPort} onCancel={() => setAdding(false)} />}
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: S.textS }}>Voyage planner — {plan.length} stop{plan.length > 1 ? "s" : ""} · numbered in order of call</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={pushToPda} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Receipt size={12} /> Push to PDA</button>
          <button onClick={() => { if (confirm("Clear this voyage plan?")) setPlan([]); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Clear plan</button>
        </div>
      </div>

      <JourneyTimeline op={op} plan={plan} sel={sel} onSelStop={setSel}
        svcSel={svcSel} onSelSvc={setSvcSel} onToggleSvc={toggleSvc} onSetSvcField={setSvcField}
        onRemoveSvc={removeSvc} onAddSvc={addSvc} onInsertStop={addPort} onRemoveLeg={removeLeg} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        <VoyageKpi label="Port calls" value={plan.length} />
        <VoyageKpi label="Services" value={`${stats.done}/${stats.total} arranged`} />
        <span title="Auto-estimate only: default service costs (clearance + berthing) for each planned stop, + 10% agency fee. Not a quote — superseded by the real PDA once issued."><VoyageKpi label="Indicative PDA (auto-est.)" value={`$${stats.grand.toLocaleString()}`} accent /></span>
        <VoyageKpi label="Readiness" value={`${stats.pct}%`} bar={stats.pct} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: 14, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}` }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: S.text }}>Itinerary</span>
            <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><Plus size={11} /> Add port</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plan.map((l, i) => (
              <VoyageLegCard key={l.id} leg={l} seq={i + 1} sel={sel === l.id} onSel={() => setSel(sel === l.id ? null : l.id)}
                onSetField={setField} onToggle={toggleSvc} onRemove={removeSvc} onAdd={addSvc} onRemoveLeg={() => removeLeg(l.id)} />
            ))}
          </div>
          {adding && <VoyagePortPicker onPick={addPort} onCancel={() => setAdding(false)} />}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 8 }}>
          <VoyageRouteChart ports={plan} sel={sel} onPick={setSel} vessel={op.vesselName} />
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: S.text, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}` }}>Indicative PDA <span style={{ fontSize: 10, fontWeight: 400, color: S.textH }}>— auto-estimate from planned stops (default clearance + berth per port, + 10% agency fee). Superseded by the real PDA.</span></div>
            <VoyageCostRow k="Services subtotal" v={stats.sub} />
            <VoyageCostRow k="Agency fee (10%)" v={stats.fee} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, marginTop: 4, borderTop: `2px solid ${S.navy}` }}>
              <span style={{ fontWeight: 500, color: S.navy }}>Total ({op.baseCurrency})</span>
              <span style={{ fontWeight: 600, fontSize: 16, color: S.navy }}>${stats.grand.toLocaleString()}</span>
            </div>
            <InfoStrip type="info">Push arranged services into a draft PDA for Pricing &amp; Quotations to confirm.</InfoStrip>
          </div>
        </div>
      </div>
    </>
  );
}



// ════════════════════════════════════════════════════════════════════
// VESSEL DOCUMENTS — synced store shared by Documents tab & yacht profile
// ════════════════════════════════════════════════════════════════════

const DOC_TYPES = [
  "Certificate of Registry", "Certificate of Class", "Safety Equipment Certificate",
  "Radio Licence", "Insurance Certificate", "P&I Club Certificate", "GMDSS",
  "International Tonnage Certificate", "Minimum Safe Manning", "Ship Sanitation",
  "IOPP", "Anti-Fouling", "Loadline", "Commercial Yacht Code", "MLC", "ISM", "ISPS",
  "Suez Canal Tonnage Certificate", "Flag State Inspection", "Annual Survey Report",
  "Underwater Inspection", "Other",
];

// Module-level store keyed by yachtId. Seeds lazily from a yacht's own documents
// array, then becomes the single source of truth so edits in the operation
// Documents tab and the yacht profile stay in sync.
const yachtDocStore = (() => {
  const data = {};            // { [yachtId]: documents[] }
  const subs = new Set();
  const emit = () => subs.forEach(fn => fn());
  return {
    seed(yachtId, initial) {
      if (yachtId == null) return;
      if (!data[yachtId]) data[yachtId] = (initial || []).map(d => ({ ...d }));
    },
    get(yachtId) { return data[yachtId] || []; },
    set(yachtId, docs) { data[yachtId] = docs; emit(); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
})();

function useYachtDocs(yachtId, initial) {
  yachtDocStore.seed(yachtId, initial);
  const [, force] = useState(0);
  useEffect(() => yachtDocStore.subscribe(() => force(n => n + 1)), [yachtId]);
  const docs = yachtDocStore.get(yachtId);
  const setDocs = (next) => yachtDocStore.set(yachtId, typeof next === "function" ? next(yachtDocStore.get(yachtId)) : next);
  return [docs, setDocs];
}

// Status derived from expiry date.
function docStatus(expiry) {
  if (!expiry) return { label: "No Expiry", color: S.textS, bg: S.bg };
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const exp = new Date(expiry); exp.setHours(0, 0, 0, 0);
  const days = Math.round((exp - now) / 86400000);
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, color: S.red, bg: S.redBg };
  if (days <= 30) return { label: `${days}d remaining`, color: S.orange, bg: S.orangeBg };
  if (days <= 90) return { label: `${days}d remaining`, color: S.gold, bg: S.goldBg };
  return { label: "Valid", color: S.green, bg: S.greenBg };
}

function VesselDocsTab({ op, yacht }) {
  const yachtId = yacht?.id || op.yachtId;
  const [docs, setDocs] = useYachtDocs(yachtId, yacht?.documents);

  if (!yachtId) {
    return <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 30, textAlign: "center", color: S.textH, fontSize: 13 }}>
      <div style={{ fontWeight: 500, color: S.text, marginBottom: 4 }}>No vessel linked</div>
      This operation has no yacht record, so vessel documents can't be synced. Link a vessel first.
    </div>;
  }

  const withStatus = docs.map(d => ({ ...d, _st: docStatus(d.expiryDate) }));
  const expired = withStatus.filter(d => d._st.label.startsWith("Expired"));
  const expiring = withStatus.filter(d => d._st.label.endsWith("remaining") && parseInt(d._st.label) <= 30);
  const filesUploaded = docs.filter(d => d.fileData).length;
  const topBorder = expired.length ? S.red : expiring.length ? S.orange : S.brand;

  const updateDoc = (id, field, val) => setDocs(ls => ls.map(d => d.id === id ? { ...d, [field]: val } : d));
  const removeDoc = (id) => setDocs(ls => ls.filter(d => d.id !== id));
  const addDoc = () => setDocs(ls => [...ls, { id: "doc_" + Date.now(), name: "", docType: "Certificate of Registry", issuedBy: "", refNumber: "", issueDate: "", expiryDate: "", notes: "" }]);

  const onFile = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateDoc(id, "fileData", reader.result);
    reader.readAsDataURL(file);
  };

  const cellInput = { width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 6px", fontSize: 11, background: S.surface, boxSizing: "border-box" };

  return (
    <div>
      <div style={{ fontSize: 12, color: S.textS, marginBottom: 12 }}>
        Vessel documents — synced to the {yacht?.name || op.vesselName} profile. Edits here update the yacht record and vice versa.
      </div>

      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: topBorder }} />

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${S.borderL}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: S.text }}>Vessel Documents ({docs.length})</span>
            {expired.length > 0 && <span style={{ fontSize: 11, fontWeight: 500, color: S.red, background: S.redBg, padding: "2px 8px", borderRadius: 10 }}>{expired.length} expired</span>}
            {expiring.length > 0 && <span style={{ fontSize: 11, fontWeight: 500, color: S.orange, background: S.orangeBg, padding: "2px 8px", borderRadius: 10 }}>{expiring.length} expiring soon</span>}
          </div>
          <button onClick={addDoc} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Plus size={12} /> Add Document</button>
        </div>

        {/* table */}
        {docs.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead><tr style={{ background: "#F2F2F2" }}>
                {["Document Type", "Name", "Issued By", "Ref #", "Issue Date", "Expiry Date", "Status", "File", ""].map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "8px 10px", color: S.textS, fontWeight: 500, fontSize: 10, borderBottom: `1px solid ${S.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {withStatus.map(d => (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${S.borderL}`, verticalAlign: "top" }}>
                    <td style={{ padding: "6px 10px", minWidth: 180 }}>
                      <SearchSelect value={d.docType} options={DOC_TYPES} placeholder="Select type..." width="100%" onChange={v => updateDoc(d.id, "docType", v)} />
                    </td>
                    <td style={{ padding: "6px 10px", minWidth: 160 }}><input value={d.name || ""} onChange={e => updateDoc(d.id, "name", e.target.value)} placeholder="Document name" style={cellInput} /></td>
                    <td style={{ padding: "6px 10px", minWidth: 140 }}><input value={d.issuedBy || ""} onChange={e => updateDoc(d.id, "issuedBy", e.target.value)} placeholder="Issuing authority" style={cellInput} /></td>
                    <td style={{ padding: "6px 10px", minWidth: 100 }}><input value={d.refNumber || ""} onChange={e => updateDoc(d.id, "refNumber", e.target.value)} placeholder="Ref" style={{ ...cellInput, fontFamily: "monospace" }} /></td>
                    <td style={{ padding: "6px 10px" }}><input type="date" value={d.issueDate || ""} onChange={e => updateDoc(d.id, "issueDate", e.target.value)} style={cellInput} /></td>
                    <td style={{ padding: "6px 10px" }}><input type="date" value={d.expiryDate || ""} onChange={e => updateDoc(d.id, "expiryDate", e.target.value)} style={{ ...cellInput, borderColor: d._st.color, color: d._st.color, background: d._st.bg }} /></td>
                    <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-block", fontSize: 10, fontWeight: 500, color: d._st.color, background: d._st.bg, padding: "3px 8px", borderRadius: 10 }}>{d._st.label}</span>
                    </td>
                    <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                      {d.fileData
                        ? <a href={d.fileData} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: S.brand, textDecoration: "none" }}>📎 Open</a>
                        : <label style={{ fontSize: 11, color: S.textS, cursor: "pointer" }}>
                            <span style={{ textDecoration: "underline" }}>Upload</span>
                            <input type="file" accept="image/*,application/pdf" onChange={e => onFile(d.id, e.target.files[0])} style={{ display: "none" }} />
                          </label>}
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <button onClick={() => removeDoc(d.id)} title="Delete" style={{ border: "none", background: "none", cursor: "pointer", color: S.textH, padding: 2 }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: S.textS }}>No documents on file</div>
            <div style={{ fontSize: 11, color: S.textH, marginTop: 2 }}>Add certificates, class documents, insurance, and other vessel papers</div>
          </div>
        )}

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: `1px solid ${S.borderL}`, fontSize: 11, color: S.textS }}>
          <span>{filesUploaded}/{docs.length} files uploaded</span>
          <span style={{ color: S.brand, cursor: "pointer" }} onClick={() => alert(`Open full vessel profile for ${yacht?.name || op.vesselName} → Documents tab. (Yacht Directory · ${yachtId})`)}>View full yacht profile →</span>
        </div>
      </div>
    </div>
  );
}



// ════════════════════════════════════════════════════════════════════
// CREW & GUESTS — rosters per vessel call + IMO FAL form generation
// ════════════════════════════════════════════════════════════════════

const CREW_RANKS = ["Captain", "Chief Officer", "2nd Officer", "3rd Officer", "Chief Engineer", "2nd Engineer", "3rd Engineer", "Bosun", "Deckhand", "Chef", "Steward/ess", "Purser", "Stewardess", "Deck/Steward", "Mate", "Other"];

const PERSON_TAGS = {
  tier: ["VIP", "Regular", "New", "Inactive", "Do Not Contact"],
  role: ["Decision Maker", "Influencer", "End User"],
  interest: ["Provisions", "Bunkering", "Crew Change", "Shore Excursions", "Diving", "Technical", "Transport"],
  channel: ["WhatsApp", "Email", "Phone", "SMS"],
  language: ["English", "Arabic", "French", "Italian", "Greek", "Russian", "Spanish", "German", "Japanese", "Mandarin"],
  dietary: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher", "Dairy-Free", "Nut Allergy", "Shellfish Allergy", "Other"],
  consent: ["Opted In", "Opted Out"],
};
const PERSON_CRM = [
  { key: "tier", label: "Tier", multi: false, opts: PERSON_TAGS.tier },
  { key: "role", label: "Marketing role", multi: false, opts: PERSON_TAGS.role },
  { key: "interest", label: "Interests", multi: true, opts: PERSON_TAGS.interest },
  { key: "channel", label: "Preferred channel", multi: false, opts: PERSON_TAGS.channel },
  { key: "language", label: "Language", multi: true, opts: PERSON_TAGS.language },
  { key: "dietary", label: "Dietary", multi: true, opts: PERSON_TAGS.dietary },
  { key: "consent", label: "Marketing consent", multi: false, opts: PERSON_TAGS.consent },
];
const RESTRICTED_NATS = {
  "Lebanese": "Ages 16–50",
  "Libyan": "Men, ages 18–45",
  "Turkish": "Ages 18–45",
  "Palestinian": "Men, ages 18–40",
  "Moldovan": "Women, ages 15–35",
  "Russian": "Guarantee Letter required",
};
const PERSON_DOC_TYPES = ["Passport Copy", "National ID", "Seaman Book", "STCW Certificate", "Medical Fitness (ENG1)", "Flag State Endorsement", "Watchkeeping Certificate", "GMDSS Radio Operator", "Yellow Fever Card", "COVID Vaccination", "Drug & Alcohol Test", "Certificate of Competency", "Letter of Recommendation", "Employment Contract", "Visa Copy", "Photo", "Other"];


const CRW_RESTRICTED_NATIONALITIES = ["Russian", "Russia", "Syrian", "Syria", "Iranian", "Iran", "North Korean", "Sudanese", "Sudan", "Libyan", "Libya", "Yemeni", "Yemen", "Somali", "Somalia"];
const CRW_RESTRICTED_NOTES = {
  Russian: "Restricted nationality — Egyptian security pre-approval (GL) required before arrival.",
  Syrian: "Restricted nationality — consulate pre-approval and security clearance required.",
  Iranian: "Restricted nationality — security pre-approval required; allow extra lead time.",
  default: "Restricted nationality — consulate / security pre-approval required before port call.",
};
const isRestricted = (nat) => !!nat && CRW_RESTRICTED_NATIONALITIES.some(r => nat.toLowerCase().includes(r.toLowerCase()));
const restrictedNote = (nat) => {
  if (!nat) return "";
  const key = Object.keys(CRW_RESTRICTED_NOTES).find(k => k !== "default" && nat.toLowerCase().includes(k.toLowerCase()));
  return CRW_RESTRICTED_NOTES[key] || CRW_RESTRICTED_NOTES.default;
};

const ID_DOC_TYPES = ["Passport", "Seaman Book", "National ID", "Travel Document", "Other"];
const COUNTRIES = ["United Kingdom", "Italy", "Netherlands", "Portugal", "China", "Russia", "France", "Spain", "Greece", "Germany", "United States", "Australia", "South Africa", "Philippines", "India", "Ukraine", "Poland", "Croatia", "Turkey", "Egypt", "Other"];
// (crew-module port list now uses the module-level WORLD_PORTS + Egyptian ports)
const CREW_PORT_OPTIONS = [...PORTS_EG.map(p => p.name), ...WORLD_PORTS];

const titleCase = (s) => (s || "").replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
const onBoard = (p) => !p.disembarkDate;

// shared persons store (syncs roster edits back to the central PERSONS DB)
const personsStore = (() => {
  let data = null;
  const subs = new Set();
  const emit = () => subs.forEach(fn => fn());
  return {
    init(seed) { if (!data) data = seed.map(p => ({ ...p })); },
    all() { return data || []; },
    upsert(person) {
      if (!data) data = [];
      const i = data.findIndex(p => p.id === person.id);
      if (i >= 0) data[i] = { ...data[i], ...person }; else data.push({ ...person });
      emit();
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
})();
function usePersonsDB() {
  personsStore.init(PERSONS);
  const [, force] = useState(0);
  useEffect(() => personsStore.subscribe(() => force(n => n + 1)), []);
  return [personsStore.all(), (p) => personsStore.upsert(p)];
}

// per-operation roster store (crew + guests for one vessel call)
const rosterStore = (() => {
  const data = {};
  const subs = new Set();
  const emit = () => subs.forEach(fn => fn());
  return {
    get(opId) { return data[opId] || { crew: [], guests: [], fal: [] }; },
    set(opId, next) { data[opId] = next; emit(); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
})();
function useRoster(opId) {
  const [, force] = useState(0);
  useEffect(() => rosterStore.subscribe(() => force(n => n + 1)), [opId]);
  const roster = rosterStore.get(opId);
  const set = (next) => rosterStore.set(opId, typeof next === "function" ? next(rosterStore.get(opId)) : next);
  return [roster, set];
}

const fileToDataUrl = (file, cb) => { if (!file) return; const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(file); };

// ── primitives ──
const RankBadge = ({ rank }) => rank ? <span style={{ fontSize: 10, fontWeight: 500, color: S.brandD, background: S.brandL, padding: "2px 7px", borderRadius: 10, whiteSpace: "nowrap" }}>{rank}</span> : <span style={{ color: S.textH }}>—</span>;
const OnBoardBadge = ({ on }) => <span style={{ fontSize: 10, fontWeight: 500, color: on ? S.green : S.textS, background: on ? S.greenBg : S.bg, padding: "2px 8px", borderRadius: 10 }}>{on ? "On Board" : "Off"}</span>;
const NatCell = ({ nat }) => {
  const r = isRestricted(nat);
  return <span style={{ color: r ? S.red : S.text, fontWeight: r ? 600 : 400 }}>{r ? "⚠ " : ""}{nat || "—"}</span>;
};
const crwInp = { width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "5px 7px", fontSize: 11, background: S.surface, boxSizing: "border-box" };
const CrwField = ({ label, children }) => <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>{label}</div>{children}</div>;
const PortAutocomplete = ({ value, onChange, placeholder }) => (
  <>
    <input list="crw-world-ports" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={crwInp} />
    <datalist id="crw-world-ports">{CREW_PORT_OPTIONS.map(p => <option key={p} value={p} />)}</datalist>
  </>
);

// ── expanded editable person detail ──
function PersonRow({ person, isCrew, onChange, onSaveToDB }) {
  const r = isRestricted(person.nationality);
  const set = (k, v) => onChange({ ...person, [k]: v });
  return (
    <div style={{ background: S.bg, borderTop: `1px solid ${S.borderL}`, padding: "12px 14px" }}>
      {r && (
        <div style={{ background: S.redBg, borderLeft: `3px solid ${S.red}`, borderRadius: "0 4px 4px 0", padding: "8px 12px", marginBottom: 10, fontSize: 11, color: S.red, display: "flex", alignItems: "flex-start", gap: 6 }}>
          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          <div><strong>Pre-Approval Required</strong> — {restrictedNote(person.nationality)}</div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <CrwField label="Full Name"><input value={person.fullName || ""} onBlur={e => set("fullName", titleCase(e.target.value))} onChange={e => set("fullName", e.target.value)} style={crwInp} /></CrwField>
        {isCrew && <CrwField label="Rank"><SearchSelect value={person.rank || ""} options={CREW_RANKS} placeholder="—" width="100%" onChange={v => set("rank", v)} /></CrwField>}
        <CrwField label="Nationality"><input value={person.nationality || ""} onChange={e => set("nationality", e.target.value)} style={{ ...crwInp, ...(r ? { borderColor: S.red, color: S.red } : {}) }} /></CrwField>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <CrwField label="Passport No."><input value={person.passportNumber || ""} onChange={e => set("passportNumber", e.target.value)} style={{ ...crwInp, fontFamily: "monospace" }} /></CrwField>
        <CrwField label="Date of Birth"><input type="date" value={person.dob || ""} onChange={e => set("dob", e.target.value)} style={crwInp} /></CrwField>
        <CrwField label="Gender"><select value={person.gender || ""} onChange={e => set("gender", e.target.value)} style={crwInp}><option value="">—</option><option>Male</option><option>Female</option><option>Other</option></select></CrwField>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <CrwField label="Embark Date"><input type="date" value={person.embarkDate || ""} onChange={e => set("embarkDate", e.target.value)} style={crwInp} /></CrwField>
        <CrwField label="Disembark Date"><input type="date" value={person.disembarkDate || ""} onChange={e => set("disembarkDate", e.target.value)} style={crwInp} /></CrwField>
        <CrwField label="Place of Birth"><SearchSelect value={person.placeOfBirth || ""} options={COUNTRIES} placeholder="—" width="100%" onChange={v => set("placeOfBirth", v)} /></CrwField>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <CrwField label="Visa Number"><input value={person.visaNumber || ""} onChange={e => set("visaNumber", e.target.value)} style={{ ...crwInp, fontFamily: "monospace" }} /></CrwField>
        <CrwField label="Nature of ID Document"><select value={person.idNature || "Passport"} onChange={e => set("idNature", e.target.value)} style={crwInp}>{ID_DOC_TYPES.map(d => <option key={d}>{d}</option>)}</select></CrwField>
        <CrwField label="ID Issuing State"><SearchSelect value={person.idIssuingState || ""} options={COUNTRIES} placeholder="—" width="100%" onChange={v => set("idIssuingState", v)} /></CrwField>
        <CrwField label="ID Expiry Date"><input type="date" value={person.idExpiry || person.passportExpiry || ""} onChange={e => set("idExpiry", e.target.value)} style={crwInp} /></CrwField>
      </div>
      {/* uploads */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
        {["passportFile", "visaFile"].map(key => (
          <div key={key}>
            <div style={{ fontSize: 10, color: S.textS, marginBottom: 3 }}>{key === "passportFile" ? "Passport Scan" : "Visa Scan"}</div>
            {person[key] ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {String(person[key]).startsWith("data:image") ? <img src={person[key]} alt="" style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 4, border: `1px solid ${S.border}` }} /> : <a href={person[key]} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: S.brand }}>📎 Open PDF</a>}
                <button onClick={() => set(key, null)} style={{ border: "none", background: "none", cursor: "pointer", color: S.textH }}><X size={13} /></button>
              </div>
            ) : (
              <label style={{ fontSize: 11, color: S.brand, cursor: "pointer", textDecoration: "underline" }}>Upload<input type="file" accept="image/*,application/pdf" onChange={e => fileToDataUrl(e.target.files[0], d => set(key, d))} style={{ display: "none" }} /></label>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => onSaveToDB(person)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Check size={12} /> Save and Close</button>
    </div>
  );
}

// ── roster table (crew or guests) ──
function RosterTable({ title, list, isCrew, expandedId, onExpand, onChange, onRemove, onAdd, onSaveToDB, onFal, onImport, count, ob }) {
  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${S.borderL}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{title} ({count})</span>
          <span style={{ fontSize: 11, color: S.green, background: S.greenBg, padding: "2px 8px", borderRadius: 10 }}>{ob} on board</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onFal} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}>📋 {isCrew ? "FAL 5" : "FAL 6"}</button>
          <label style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📥 Import Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={e => onImport(e.target.files[0])} style={{ display: "none" }} /></label>
          <button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Plus size={12} /> Add</button>
        </div>
      </div>
      {list.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr style={{ background: "#F2F2F2" }}>
              {["#", "Name", ...(isCrew ? ["Rank"] : []), "Nationality", "Passport", "DOB", "Place of Birth", "Embark", "Status", "Docs", ""].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "7px 9px", color: S.textS, fontWeight: 500, fontSize: 10, borderBottom: `1px solid ${S.border}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {list.map((p, i) => {
                const expanded = expandedId === p.id;
                const hasDoc = p.passportFile || p.visaFile;
                return (
                  <Fragment key={p.id}>
                    <tr onClick={() => onExpand(expanded ? null : p.id)} style={{ borderBottom: `1px solid ${S.borderL}`, cursor: "pointer", background: expanded ? S.brandL : "transparent" }}>
                      <td style={{ padding: "7px 9px", color: S.textS }}>{i + 1}</td>
                      <td style={{ padding: "7px 9px", fontWeight: 500 }}>{p.fullName || <span style={{ color: S.textH }}>(unnamed)</span>}</td>
                      {isCrew && <td style={{ padding: "7px 9px" }}><RankBadge rank={p.rank} /></td>}
                      <td style={{ padding: "7px 9px" }}><NatCell nat={p.nationality} /></td>
                      <td style={{ padding: "7px 9px", fontFamily: "monospace" }}>{p.passportNumber || "—"}</td>
                      <td style={{ padding: "7px 9px", whiteSpace: "nowrap" }}>{p.dob || "—"}</td>
                      <td style={{ padding: "7px 9px" }}>{p.placeOfBirth || "—"}</td>
                      <td style={{ padding: "7px 9px", whiteSpace: "nowrap" }}>{p.embarkDate || "—"}</td>
                      <td style={{ padding: "7px 9px" }}><OnBoardBadge on={onBoard(p)} /></td>
                      <td style={{ padding: "7px 9px" }}>{hasDoc ? "📎" : "—"}</td>
                      <td style={{ padding: "7px 9px" }}><button onClick={e => { e.stopPropagation(); onRemove(p.id); }} style={{ border: "none", background: "none", cursor: "pointer", color: S.textH }}><Trash2 size={13} /></button></td>
                    </tr>
                    {expanded && <tr><td colSpan={isCrew ? 11 : 10} style={{ padding: 0 }}><PersonRow person={p} isCrew={isCrew} onChange={onChange} onSaveToDB={(pp) => { onSaveToDB(pp); onExpand(null); }} /></td></tr>}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: "28px", textAlign: "center", color: S.textH, fontSize: 12 }}>No {isCrew ? "crew" : "guests"} added yet — search the database above, import a list, or use “Add”.</div>
      )}
    </div>
  );
}

// ── FAL issue modal ──
function FalIssueModal({ op, crew, guests, presetCategory, presetList, onClose, onIssue }) {
  const [category, setCategory] = useState(presetCategory || "Crew List");
  const [direction, setDirection] = useState("Arrival");
  const [portArr, setPortArr] = useState("");
  const [portDep, setPortDep] = useState("");
  const [lastPort, setLastPort] = useState(op.lastPort || "");
  const pool = category === "Crew List" ? crew : category === "Guest List" ? guests : [...crew, ...guests];
  const [picked, setPicked] = useState(() => new Set((presetList || pool.filter(onBoard)).map(p => p.id)));
  const toggle = (id) => setPicked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  useEffect(() => { setPicked(new Set(pool.filter(onBoard).map(p => p.id))); }, [category]);

  const chips = [
    ["All on board", () => setPicked(new Set(pool.filter(onBoard).map(p => p.id)))],
    ["Clear", () => setPicked(new Set())],
    ["Crew", () => setPicked(new Set(crew.filter(onBoard).map(p => p.id)))],
    ["Guests", () => setPicked(new Set(guests.filter(onBoard).map(p => p.id)))],
  ];

  const confirm = () => {
    const persons = pool.filter(p => picked.has(p.id));
    if (!persons.length) { alert("Select at least one person."); return; }
    onIssue({ category, direction, portArr, portDep, lastPort, persons });
  };

  return (
    <Modal onClose={onClose} title="Generate IMO FAL form" width={620}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {["Crew List", "Guest List", "Consolidated"].map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ flex: 1, padding: "7px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${category === c ? S.brand : S.border}`, background: category === c ? S.brandL : "transparent", color: category === c ? S.brand : S.text }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <CrwField label="Direction"><select value={direction} onChange={e => setDirection(e.target.value)} style={crwInp}><option>Arrival</option><option>Departure</option></select></CrwField>
        <CrwField label="Port of Arrival"><PortAutocomplete value={portArr} onChange={setPortArr} placeholder="Port…" /></CrwField>
        <CrwField label="Port of Departure"><PortAutocomplete value={portDep} onChange={setPortDep} placeholder="Port…" /></CrwField>
        <CrwField label="Last Port of Call"><PortAutocomplete value={lastPort} onChange={setLastPort} placeholder="Last port…" /></CrwField>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {chips.map(([label, fn]) => <button key={label} onClick={fn} style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: S.bg, color: S.text }}>{label}</button>)}
        <span style={{ marginLeft: "auto", fontSize: 11, color: S.textS, alignSelf: "center" }}>{picked.size} selected</span>
      </div>
      <div style={{ maxHeight: 240, overflowY: "auto", border: `1px solid ${S.border}`, borderRadius: 6 }}>
        {pool.map((p, i) => {
          const off = !onBoard(p);
          return (
            <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderTop: i ? `1px solid ${S.borderL}` : "none", opacity: off ? 0.45 : 1, cursor: off ? "not-allowed" : "pointer" }}>
              <input type="checkbox" disabled={off} checked={picked.has(p.id)} onChange={() => toggle(p.id)} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>{p.fullName || "(unnamed)"}</span>
              {p.rank && <RankBadge rank={p.rank} />}
              <NatCell nat={p.nationality} />
              {off && <span style={{ fontSize: 10, color: S.textH, marginLeft: "auto" }}>disembarked</span>}
            </label>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
        <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 4, fontSize: 12, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>Cancel</button>
        <button onClick={confirm} style={{ padding: "6px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", background: S.brand, color: "#fff" }}>Generate &amp; preview</button>
      </div>
    </Modal>
  );
}

// generic modal shell
function Modal({ title, children, onClose, width = 560 }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: S.surface, borderRadius: 8, width: "100%", maxWidth: width, boxShadow: "0 12px 48px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${S.borderL}` }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: S.textH }}><X size={16} /></button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

// ── FAL preview (official-style form + HTML export) ──
function buildFalHtml(form, op, yacht) {
  const isCrew = form.category === "Crew List";
  const formNo = isCrew ? "5" : "6";
  const formTitle = isCrew ? "CREW LIST" : "PASSENGER LIST";
  const rows = form.persons.map((p, i) => {
    const parts = (p.fullName || "").trim().split(" ");
    const family = parts.length > 1 ? parts[parts.length - 1] : (p.fullName || "");
    const givenN = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
    return `<tr>
      <td>${i + 1}</td><td>${family}</td><td>${givenN}</td>
      ${isCrew ? `<td>${p.rank || ""}</td>` : ""}
      <td>${p.nationality || ""}</td><td>${p.dob || ""}</td><td>${p.placeOfBirth || ""}</td>
      <td>${p.passportNumber || ""}</td><td>${p.embarkDate ? "Emb " + p.embarkDate : ""}${p.disembarkDate ? " / Dis " + p.disembarkDate : ""}</td>
    </tr>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>IMO FAL Form ${formNo} — ${op.vesselName}</title>
<style>
@page{size:A4 landscape;margin:12mm}
body{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:11px;margin:18px}
.hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:10px}
.hd h1{font-size:16px;margin:0}.hd .sub{font-size:11px;color:#444}
.chk{display:flex;gap:18px;margin:8px 0;font-size:12px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 18px;margin-bottom:12px;font-size:11px}
.grid div span{display:block;color:#666;font-size:9px;text-transform:uppercase}
.grid div b{font-size:12px}
table{width:100%;border-collapse:collapse;font-size:10px}
th,td{border:1px solid #888;padding:4px 6px;text-align:left}
th{background:#eee;font-size:9px;text-transform:uppercase}
.ft{margin-top:14px;display:flex;justify-content:space-between;font-size:10px;color:#444}
</style></head><body>
<div class="hd"><div><h1>IMO FAL FORM ${formNo}</h1><div class="sub">${formTitle} — International Maritime Organization</div></div>
<div style="text-align:right;font-size:11px"><b>Felix Maritime Agency</b><br>${op.opNumber}</div></div>
<div class="chk"><label>${form.direction === "Arrival" ? "☑" : "☐"} Arrival</label><label>${form.direction === "Departure" ? "☑" : "☐"} Departure</label></div>
<div class="grid">
<div><span>Name of ship</span><b>${op.vesselName}</b></div>
<div><span>IMO number</span><b>${yacht?.imo || "—"}</b></div>
<div><span>Call sign</span><b>${yacht?.callSign || "—"}</b></div>
<div><span>Voyage number</span><b>${op.opNumber}</b></div>
<div><span>Port of arrival</span><b>${form.portArr || "—"}</b></div>
<div><span>Port of departure</span><b>${form.portDep || "—"}</b></div>
<div><span>Date</span><b>${new Date().toLocaleDateString("en-GB")}</b></div>
<div><span>Flag State</span><b>${yacht?.flag || op.vesselFlag || "—"}</b></div>
<div><span>Last port of call</span><b>${form.lastPort || "—"}</b></div>
<div><span>Persons</span><b>${form.persons.length}</b></div>
</div>
<table><thead><tr>
<th>No.</th><th>Family name</th><th>Given names</th>${isCrew ? "<th>Rank/Rating</th>" : ""}
<th>Nationality</th><th>Date of birth</th><th>Place of birth</th><th>Travel document no.</th><th>Embark / Disembark</th>
</tr></thead><tbody>${rows}</tbody></table>
<div class="ft"><span>Issued by Felix Maritime Agency · Generated ${new Date().toLocaleString("en-GB")}</span><span>Master’s signature: __________________</span></div>
</body></html>`;
}

function FalPreviewModal({ form, op, yacht, onClose }) {
  const isCrew = form.category === "Crew List";
  const html = buildFalHtml(form, op, yacht);
  const download = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `FAL${isCrew ? "5" : "6"}_${op.vesselName.replace(/\s+/g, "_")}.html`;
    a.click(); URL.revokeObjectURL(url);
  };
  return (
    <Modal title={`IMO FAL Form ${isCrew ? "5 — Crew List" : "6 — Passenger List"}`} onClose={onClose} width={920}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button onClick={download} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", background: S.brand, color: "#fff" }}><Download size={13} /> Download</button>
      </div>
      <div style={{ border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
        <iframe title="fal" srcDoc={html} style={{ width: "100%", height: 460, border: "none", background: "#fff" }} />
      </div>
    </Modal>
  );
}

// ── upload external vessel list modal ──
function UploadListModal({ op, onClose, onStage }) {
  const [category, setCategory] = useState("Crew List");
  const [direction, setDirection] = useState("Arrival");
  const [port, setPort] = useState("");
  const [file, setFile] = useState(null);
  const stage = () => {
    if (!file) { alert("Choose a file to upload."); return; }
    fileToDataUrl(file, d => onStage({ category, direction, port, fileData: d, fileName: file.name }));
  };
  return (
    <Modal title="Upload vessel list" onClose={onClose} width={480}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <CrwField label="Category"><select value={category} onChange={e => setCategory(e.target.value)} style={crwInp}><option>Crew List</option><option>Guest List</option><option>Consolidated</option></select></CrwField>
        <CrwField label="Direction"><select value={direction} onChange={e => setDirection(e.target.value)} style={crwInp}><option>Arrival</option><option>Departure</option></select></CrwField>
        <CrwField label="Port"><PortAutocomplete value={port} onChange={setPort} placeholder="Port…" /></CrwField>
      </div>
      <label style={{ display: "block", border: `2px dashed ${S.border}`, borderRadius: 6, padding: 18, textAlign: "center", fontSize: 12, color: S.textS, cursor: "pointer", marginBottom: 12 }}>
        {file ? `📎 ${file.name}` : "Click to choose an image or PDF of the vessel list"}
        <input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
      </label>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 4, fontSize: 12, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>Cancel</button>
        <button onClick={stage} style={{ padding: "6px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", background: S.brand, color: "#fff" }}>Stage upload</button>
      </div>
    </Modal>
  );
}

// parse imported spreadsheet/CSV (CSV via FileReader; xlsx best-effort)
function parseRosterFile(file, cb) {
  const name = (file.name || "").toLowerCase();
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result;
    const lines = String(text).split(/\r?\n/).filter(Boolean);
    if (!lines.length) { cb([]); return; }
    const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase());
    const idx = (names) => headers.findIndex(h => names.some(n => h.includes(n)));
    const iName = idx(["name"]), iRank = idx(["rank", "rating", "role"]), iNat = idx(["nation"]), iPass = idx(["passport", "document"]), iDob = idx(["birth", "dob"]);
    const rows = lines.slice(1).map((ln, k) => {
      const c = ln.split(/[,;\t]/);
      return { id: "imp_" + Date.now() + "_" + k, fullName: titleCase((c[iName] || "").trim()), rank: iRank >= 0 ? (c[iRank] || "").trim() : "", nationality: iNat >= 0 ? (c[iNat] || "").trim() : "", passportNumber: iPass >= 0 ? (c[iPass] || "").trim() : "", dob: iDob >= 0 ? (c[iDob] || "").trim() : "", embarkDate: op_today() };
    }).filter(r => r.fullName);
    cb(rows);
  };
  if (name.endsWith(".csv")) reader.readAsText(file);
  else { // xlsx/xls — can't parse binary without a lib; prompt graceful fallback
    cb(null);
  }
}
const op_today = () => new Date().toISOString().slice(0, 10);

// ════════════════ main tab ════════════════
function CrewGuestsTab({ op, yacht }) {
  const [db, upsertDb] = usePersonsDB();
  const [roster, setRoster] = useRoster(op.id);
  const crew = roster.crew, guests = roster.guests, falForms = roster.fal;

  const [search, setSearch] = useState("");
  const [addTo, setAddTo] = useState("crew");
  const [expCrew, setExpCrew] = useState(null);
  const [expGuest, setExpGuest] = useState(null);
  const [falModal, setFalModal] = useState(null);   // { presetCategory, presetList }
  const [preview, setPreview] = useState(null);      // built form
  const [uploadModal, setUploadModal] = useState(false);

  const obCrew = crew.filter(onBoard).length;
  const obGuests = guests.filter(onBoard).length;

  const setList = (which, fn) => setRoster(r => ({ ...r, [which]: typeof fn === "function" ? fn(r[which]) : fn }));

  const searchResults = useMemo(() => {
    if (search.trim().length < 2) return [];
    const q = search.toLowerCase();
    return db.filter(p => (p.fullName || "").toLowerCase().includes(q) || (p.passportNumber || "").toLowerCase().includes(q)).slice(0, 8);
  }, [search, db]);

  const addFromDb = (p) => {
    const person = { id: "r_" + Date.now(), dbId: p.id, fullName: p.fullName, rank: p.rank, nationality: p.nationality, passportNumber: p.passportNumber, dob: p.dob || "", placeOfBirth: p.placeOfBirth || "", embarkDate: op_today(), disembarkDate: "", passportExpiry: p.passportExpiry || "" };
    setList(addTo, list => [...list, person]);
    setSearch("");
  };
  const addBlank = (which) => { const person = { id: "r_" + Date.now(), fullName: "", rank: which === "crew" ? "Deckhand" : "", nationality: "", passportNumber: "", dob: "", placeOfBirth: "", embarkDate: op_today(), disembarkDate: "" }; setList(which, l => [...l, person]); (which === "crew" ? setExpCrew : setExpGuest)(person.id); };
  const changePerson = (which) => (p) => setList(which, l => l.map(x => x.id === p.id ? p : x));
  const removePerson = (which) => (id) => setList(which, l => l.filter(x => x.id !== id));

  const saveToDb = (p) => {
    const dbId = p.dbId || ("p_" + Date.now());
    upsertDb({ id: dbId, fullName: p.fullName, nationality: p.nationality, rank: p.rank, passportNumber: p.passportNumber, passportExpiry: p.idExpiry || p.passportExpiry || "", dob: p.dob, placeOfBirth: p.placeOfBirth });
    // link roster entry to db id
    setRoster(r => ({ ...r, crew: r.crew.map(x => x.id === p.id ? { ...x, dbId } : x), guests: r.guests.map(x => x.id === p.id ? { ...x, dbId } : x) }));
  };
  const saveAllToDb = () => {
    [...crew, ...guests].forEach(saveToDb);
    alert(`${crew.length + guests.length} person record(s) written to the central database.`);
  };

  const importInto = (which) => (file) => {
    if (!file) return;
    parseRosterFile(file, rows => {
      if (rows === null) { alert("Excel (.xlsx/.xls) parsing needs the spreadsheet engine at integration. Export the list as CSV to import now, or upload it as a vessel list."); return; }
      if (!rows.length) { alert("No rows found in the file."); return; }
      setList(which, l => [...l, ...rows]);
    });
  };

  const issueFal = ({ category, direction, portArr, portDep, lastPort, persons }) => {
    const form = { id: "fal_" + Date.now(), category, direction, portArr, portDep, lastPort, persons, date: op_today(), source: "Generated", issuedBy: "Felix Maritime", format: category === "Crew List" ? "FAL 5" : category === "Guest List" ? "FAL 6" : "FAL 5+6" };
    setRoster(r => ({ ...r, fal: [...r.fal, form] }));
    setFalModal(null);
    setPreview(form);
  };
  const stageUpload = ({ category, direction, port, fileData, fileName }) => {
    const form = { id: "upl_" + Date.now(), category, direction, portArr: direction === "Arrival" ? port : "", portDep: direction === "Departure" ? port : "", lastPort: "", persons: [], date: op_today(), source: "Uploaded", issuedBy: "External", format: "Vessel list", fileData, fileName };
    setRoster(r => ({ ...r, fal: [...r.fal, form] }));
    setUploadModal(false);
  };

  const catBadge = (c) => { const m = { "Crew List": [S.brand, S.brandL], "Guest List": [S.purple, S.purpleBg], "Consolidated": [S.navy, "#E6F1FB"] }; const [col, bg] = m[c] || [S.textS, S.bg]; return <span style={{ fontSize: 10, fontWeight: 500, color: col, background: bg, padding: "2px 8px", borderRadius: 10 }}>{c}</span>; };

  return (
    <div>
      <div style={{ fontSize: 12, color: S.textS, marginBottom: 12 }}>Crew &amp; guests for {op.vesselName} — rosters for this vessel call and IMO FAL form generation.</div>

      {/* summary banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        <VoyageKpi label="Crew" value={crew.length} accent />
        <VoyageKpi label="On Board (Crew)" value={obCrew} />
        <VoyageKpi label="Guests" value={guests.length} accent />
        <VoyageKpi label="On Board (Guests)" value={obGuests} />
      </div>

      {/* central DB search */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: S.bg, border: `1px solid ${S.border}`, borderRadius: 4, padding: "6px 10px", flex: 1 }}>
            <Search size={14} color={S.textH} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search central database by name or passport (min 2 chars)…" style={{ border: "none", outline: "none", fontSize: 12, background: "transparent", width: "100%" }} />
          </div>
          <div style={{ display: "flex", border: `1px solid ${S.border}`, borderRadius: 4, overflow: "hidden" }}>
            {["crew", "guests"].map(k => <button key={k} onClick={() => setAddTo(k)} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 500, cursor: "pointer", border: "none", background: addTo === k ? S.brand : "transparent", color: addTo === k ? "#fff" : S.text }}>{k === "crew" ? "→ Crew" : "→ Guests"}</button>)}
          </div>
        </div>
        {search.trim().length >= 2 && (
          <div style={{ border: `1px solid ${S.border}`, borderRadius: 6, overflow: "hidden" }}>
            {searchResults.length ? searchResults.map((p, i) => (
              <div key={p.id} onClick={() => addFromDb(p)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", cursor: "pointer", borderTop: i ? `1px solid ${S.borderL}` : "none" }} onMouseEnter={e => e.currentTarget.style.background = S.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Plus size={13} color={S.brand} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{p.fullName}</span>
                {p.rank && <RankBadge rank={p.rank} />}
                <NatCell nat={p.nationality} />
                <span style={{ fontFamily: "monospace", fontSize: 11, color: S.textS, marginLeft: "auto" }}>{p.passportNumber}</span>
              </div>
            )) : <div style={{ padding: "10px", fontSize: 12, color: S.textH }}>No matches — add manually with the “+ Add” button below.</div>}
          </div>
        )}
      </div>

      <RosterTable title="Crew List" list={crew} isCrew count={crew.length} ob={obCrew} expandedId={expCrew} onExpand={setExpCrew} onChange={changePerson("crew")} onRemove={removePerson("crew")} onAdd={() => addBlank("crew")} onSaveToDB={saveToDb} onFal={() => setFalModal({ presetCategory: "Crew List", presetList: crew.filter(onBoard) })} onImport={importInto("crew")} />
      <RosterTable title="Guest / Passenger List" list={guests} isCrew={false} count={guests.length} ob={obGuests} expandedId={expGuest} onExpand={setExpGuest} onChange={changePerson("guests")} onRemove={removePerson("guests")} onAdd={() => addBlank("guests")} onSaveToDB={saveToDb} onFal={() => setFalModal({ presetCategory: "Guest List", presetList: guests.filter(onBoard) })} onImport={importInto("guests")} />

      {(crew.length > 0 || guests.length > 0) && (
        <div style={{ marginBottom: 14 }}>
          <button onClick={saveAllToDb} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Database size={13} /> Save all to central database</button>
        </div>
      )}

      {/* FAL registry */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${S.borderL}` }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Crew / Guest List Registry ({falForms.length})</span>
          <button onClick={() => setUploadModal(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📤 Upload Vessel List</button>
        </div>
        {falForms.length ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead><tr style={{ background: "#F2F2F2" }}>{["Category", "Format", "Direction", "Source", "Date", "Port", "Persons", "Issued By", "File", ""].map((h, i) => <th key={i} style={{ textAlign: "left", padding: "7px 9px", color: S.textS, fontWeight: 500, fontSize: 10, borderBottom: `1px solid ${S.border}`, whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
              <tbody>
                {falForms.map(f => (
                  <tr key={f.id} style={{ borderBottom: `1px solid ${S.borderL}` }}>
                    <td style={{ padding: "7px 9px" }}>{catBadge(f.category)}</td>
                    <td style={{ padding: "7px 9px" }}>{f.format}</td>
                    <td style={{ padding: "7px 9px" }}>{f.direction}</td>
                    <td style={{ padding: "7px 9px" }}>{f.source}</td>
                    <td style={{ padding: "7px 9px", whiteSpace: "nowrap" }}>{f.date}</td>
                    <td style={{ padding: "7px 9px" }}>{f.portArr || f.portDep || f.port || "—"}</td>
                    <td style={{ padding: "7px 9px" }}>{f.persons.length || "—"}</td>
                    <td style={{ padding: "7px 9px" }}>{f.issuedBy}</td>
                    <td style={{ padding: "7px 9px" }}>{f.fileData ? <a href={f.fileData} target="_blank" rel="noopener noreferrer" style={{ color: S.brand }}>📎 {f.fileName || "Open"}</a> : "—"}</td>
                    <td style={{ padding: "7px 9px" }}>{f.source === "Generated" ? <button onClick={() => setPreview(f)} style={{ border: "none", background: "none", cursor: "pointer", color: S.brand, fontSize: 11 }}>Preview</button> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div style={{ padding: "24px", textAlign: "center", color: S.textH, fontSize: 12 }}>No FAL forms generated yet. Use “📋 FAL 5/6” above or upload an external vessel list.</div>}
      </div>

      {falModal && <FalIssueModal op={op} crew={crew} guests={guests} presetCategory={falModal.presetCategory} presetList={falModal.presetList} onClose={() => setFalModal(null)} onIssue={issueFal} />}
      {preview && <FalPreviewModal form={preview} op={op} yacht={yacht} onClose={() => setPreview(null)} />}
      {uploadModal && <UploadListModal op={op} onClose={() => setUploadModal(false)} onStage={stageUpload} />}
    </div>
  );
}



// ════════════════════════════════════════════════════════════════════
// YACHT DIRECTORY — Excel import / export (SheetJS loaded on demand)
// ════════════════════════════════════════════════════════════════════

let _sheetjsPromise = null;
function loadSheetJS() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (_sheetjsPromise) return _sheetjsPromise;
  _sheetjsPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.async = true;
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error("sheetjs-load-failed"));
    document.head.appendChild(s);
  });
  return _sheetjsPromise;
}

// Column order/labels for the spreadsheet. Header label ↔ yacht field.
const YACHT_XLSX_COLUMNS = [
  ["Vessel ID", "serial"],
  ["Vessel Name", "name"], ["Type", "type"], ["Category", "category"],
  ["Flag", "flag"], ["IMO", "imo"], ["MMSI", "mmsi"], ["Call Sign", "callSign"], ["Official Number", "officialNumber"],
  ["SCA File Number", "scaFileNumber"], ["Previous Agency", "scaPrevAgency"],
  ["LOA (m)", "loa"], ["Beam (m)", "beam"], ["Draught (m)", "draught"], ["GT", "gt"], ["NT", "nt"], ["SCGT", "scgt"], ["SCNT", "scnt"],
  ["Year Built", "yearBuilt"], ["Model", "model"],
  ["Hull Material", "hullMaterial"], ["Superstructure Material", "superstructureMaterial"],
  ["Classification Society", "classificationSociety"],
  ["Engines", "engines"], ["Max Speed (kn)", "maxSpeed"], ["Cruising Speed (kn)", "cruisingSpeed"],
  ["Range (NM)", "range"], ["Fuel Capacity (L)", "fuelCapacity"],
  ["Guest Capacity", "guestCapacity"], ["Crew Capacity", "crewCapacity"],
  ["Status", "status"], ["Previous Names", "prevNames"],
  ["For Sale", "forSale"], ["Asking Price", "askingPrice"],
  ["Charterable", "charterable"], ["Charter Price", "charterPrice"],
  ["Notes", "notes"],
];
const YACHT_NUMERIC_FIELDS = new Set(["loa", "beam", "draught", "gt", "nt", "scgt", "scnt", "yearBuilt", "maxSpeed", "cruisingSpeed", "range", "fuelCapacity", "guestCapacity", "crewCapacity"]);
const YACHT_BOOL_FIELDS = new Set(["forSale", "charterable"]);
// Relationship columns — exported/imported as NAMES; import resolves them back to ids (kept name as fallback label).
const YACHT_REL_COLUMNS = [
  ["Owner", "ownerId", "owner"],
  ["Builder", "builderId", "company"],
  ["Management", "managementId", "company"],
  ["Exterior Designer", "exteriorDesignerId", "company"],
  ["Interior Designer", "interiorDesignerId", "company"],
  ["Naval Architect", "navalArchitectId", "company"],
  ["Broker", "brokerId", "company"],
  ["Central Agent", "centralAgentId", "company"],
  ["Marina", "marinaId", "company"],
];
// Structured multi-owner column. Encodes the full ownership array as
// "Name (Type, Role, Share%)" segments joined by "; ". On import it's parsed back
// into yacht.ownership; the legacy single "Owner" column stays for at-a-glance/back-compat.
const OWNERSHIP_COL = "Ownership";
function ownershipToString(list) {
  if (!Array.isArray(list) || !list.length) return "";
  return list.map(o => `${o.name || ""} (${o.type === "Company" ? "Company" : "Person"}, ${o.role === "Sole" ? "Sole" : "Co-owner"}, ${Number(o.share) || 0}%)`).join("; ");
}
function parseOwnershipString(str, resolvers) {
  const out = [];
  String(str || "").split(/;+/).map(s => s.trim()).filter(Boolean).forEach(seg => {
    const m = seg.match(/^(.*?)\s*\(\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*([\d.]+)\s*%?\s*\)\s*$/);
    let name, type, role, share;
    if (m) {
      name = m[1].trim();
      type = /compan/i.test(m[2]) ? "Company" : "Person";
      role = /sole/i.test(m[3]) ? "Sole" : "Co-owner";
      share = parseFloat(m[4]) || 0;
    } else {
      name = seg.replace(/\(.*$/, "").trim();   // tolerate a bare name with no (Type, Role, Share)
      type = "Person"; role = "Co-owner"; share = 0;
    }
    if (!name) return;
    const id = resolvers ? (type === "Company" ? (resolvers.companyByName || {})[name.toLowerCase()] : (resolvers.ownerByName || {})[name.toLowerCase()]) : null;
    out.push({ type, id: id || "", name, role, share });
  });
  // A lone owner with no share given is treated as the Sole 100% owner.
  if (out.length === 1 && (Number(out[0].share) || 0) === 0) { out[0].share = 100; out[0].role = "Sole"; }
  return out;
}

// build a plain row object (resolving owner/builder names) for export
function yachtToRow(y, getOwner, getCompany, getStatus) {
  const row = {};
  YACHT_XLSX_COLUMNS.forEach(([label, field]) => {
    if (field === "status") { row[label] = getStatus ? getStatus(y) : (y.status || ""); return; }   // status is system-derived
    let v = y[field];
    if (field === "prevNames") v = Array.isArray(v) ? v.join("; ") : (v || "");
    else if (YACHT_BOOL_FIELDS.has(field)) v = v ? "Yes" : "No";
    else if (v == null) v = "";
    row[label] = v;
  });
  YACHT_REL_COLUMNS.forEach(([label, idField, kind]) => {
    const nm = kind === "owner" ? (getOwner ? getOwner(y[idField]) : "") : (getCompany ? (getCompany(y[idField]) || "") : "");
    row[label] = nm || y[idField.replace("Id", "Name")] || "";
  });
  row[OWNERSHIP_COL] = ownershipToString(normalizeOwnership(y, getOwner));   // full multi-owner structure
  return row;
}

// parse a spreadsheet row back into a yacht object
function rowToYacht(row, resolvers) {
  const y = {};
  const norm = {};
  Object.keys(row).forEach(k => { norm[String(k).trim().toLowerCase()] = row[k]; });
  YACHT_XLSX_COLUMNS.forEach(([label, field]) => {
    let v = norm[label.toLowerCase()];
    if (v == null || v === "") return;
    if (field === "status") return;   // status is system-derived from active operations — never imported
    if (field === "prevNames") y[field] = String(v).split(/[;,]/).map(s => s.trim()).filter(Boolean);
    else if (field === "imo") y[field] = formatIMO(v);
    else if (field === "callSign") y[field] = cleanCallSign(v);
    else if (field === "mmsi") y[field] = String(v).replace(/\D/g, "").slice(0, 9);
    else if (YACHT_NUMERIC_FIELDS.has(field)) y[field] = parseFloat(String(v).replace(/[^0-9.\-]/g, "")) || 0;
    else if (YACHT_BOOL_FIELDS.has(field)) y[field] = /^(y|yes|true|1)$/i.test(String(v).trim());
    else y[field] = String(v).trim();
  });
  // Backward compatibility: legacy spreadsheets used the "Serial No." header
  if ((y.serial == null || y.serial === "") && norm["serial no."] != null && norm["serial no."] !== "") y.serial = String(norm["serial no."]).trim();
  // Relationship name columns → ids (keep the typed name as a fallback label)
  YACHT_REL_COLUMNS.forEach(([label, idField, kind]) => {
    const v = norm[label.toLowerCase()];
    if (v == null || String(v).trim() === "") return;
    const nm = String(v).trim();
    const id = resolvers ? (kind === "owner" ? (resolvers.ownerByName || {})[nm.toLowerCase()] : (resolvers.companyByName || {})[nm.toLowerCase()]) : null;
    if (id) y[idField] = id;
    y[idField.replace("Id", "Name")] = nm;
  });
  // Structured multi-owner column → yacht.ownership (overrides the single "Owner" column when present)
  const ownStr = norm[OWNERSHIP_COL.toLowerCase()];
  if (ownStr != null && String(ownStr).trim() !== "") {
    const list = parseOwnershipString(ownStr, resolvers);
    if (list.length) {
      y.ownership = list;
      const p = primaryOwner(list);
      if (p) { y.ownerId = (p.type === "Person" && p.id) ? p.id : ""; y.ownerName = p.name; }
    }
  }
  // Rule: vessel name is always stored uppercase
  if (y.name) y.name = String(y.name).toUpperCase();
  return y;
}

async function exportYachtsToExcel(yachts, getOwner, getCompany, getStatus, onError) {
  try {
    const XLSX = await loadSheetJS();
    const rows = yachts.map(y => yachtToRow(y, getOwner, getCompany, getStatus));
    const ws = XLSX.utils.json_to_sheet(rows, { header: [...YACHT_XLSX_COLUMNS.map(c => c[0]), ...YACHT_REL_COLUMNS.map(c => c[0]), OWNERSHIP_COL] });
    ws["!cols"] = [...[...YACHT_XLSX_COLUMNS, ...YACHT_REL_COLUMNS].map(c => ({ wch: Math.max(12, c[0].length + 2) })), { wch: 46 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Yachts");
    XLSX.writeFile(wb, `Felix_Yacht_Directory_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (e) {
    // CSV fallback if the spreadsheet engine can't load
    if (onError) onError(e);
    const cols = [...YACHT_XLSX_COLUMNS.map(c => c[0]), ...YACHT_REL_COLUMNS.map(c => c[0]), OWNERSHIP_COL];
    const rows = yachts.map(y => yachtToRow(y, getOwner, getCompany, getStatus));
    const esc = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Felix_Yacht_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }
}

function importYachtsFromExcel(file, onRows, onError, resolvers) {
  const name = (file.name || "").toLowerCase();
  const finish = (rows) => {
    const yachts = rows.map(r => rowToYacht(r, resolvers)).filter(y => y.name);
    onRows(yachts);
  };
  if (name.endsWith(".csv")) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.split(/\r?\n/).filter(l => l.trim().length);
      if (!lines.length) { onRows([]); return; }
      const parseLine = (ln) => { const out = []; let cur = "", q = false; for (let i = 0; i < ln.length; i++) { const ch = ln[i]; if (ch === '"') { if (q && ln[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; };
      const headers = parseLine(lines[0]).map(h => h.trim());
      const rows = lines.slice(1).map(ln => { const cells = parseLine(ln); const o = {}; headers.forEach((h, i) => o[h] = (cells[i] || "").trim()); return o; });
      finish(rows);
    };
    reader.readAsText(file);
    return;
  }
  // xlsx / xls → SheetJS
  loadSheetJS().then(XLSX => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wb = XLSX.read(new Uint8Array(reader.result), { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        finish(rows);
      } catch (e) { onError && onError(e); }
    };
    reader.readAsArrayBuffer(file);
  }).catch(e => onError && onError(e));
}

// ════════════════════════════════════════════════════════════════════
// GENERIC REGISTRY EXCEL — Owners / Persons / Companies full-field I/O
// A column spec is an array of [Header, fieldPath, kind].
//   kind: "text" | "number" | "bool" | "list" (array↔"; ") | "addresses" | "serial" (export-only id)
//   fieldPath may be nested, e.g. "crm.tier".
// ════════════════════════════════════════════════════════════════════
const PERSON_XLSX_SPEC = [
  ["Person ID", "serial", "serial"],
  ["Full Name", "fullName", "text"], ["Nationality", "nationality", "text"], ["Rank", "rank", "text"],
  ["Profession", "profession", "text"], ["Date of Birth", "dob", "text"],
  ["Passport Number", "passportNumber", "text"], ["Passport Expiry", "passportExpiry", "text"], ["Seaman Book", "seamanBook", "text"],
  ["Email", "email", "text"], ["Phone", "phone", "text"], ["Net Worth", "netWorth", "text"],
  ["Social / IG", "socialMedia", "text"], ["Emergency Contact", "emergencyContact", "text"], ["Referred By", "referredBy", "text"],
  ["CRM Tier", "crm.tier", "text"], ["CRM Role", "crm.role", "text"], ["CRM Channel", "crm.channel", "text"],
  ["Language", "crm.language", "text"], ["Dietary", "crm.dietary", "text"], ["Consent", "crm.consent", "text"],
  ["Notes", "notes", "text"], ["Addresses", "addresses", "addresses"], ["Tags", "tags", "list"],
];
const COMPANY_XLSX_SPEC = [
  ["Company ID", "serial", "serial"],
  ["Name", "name", "text"], ["Name (Arabic)", "nameAr", "text"], ["Type", "type", "text"],
  ["Country", "country", "text"], ["Nationality", "nationality", "text"],
  ["Founded", "founded", "number"], ["Employees", "employees", "number"],
  ["Email", "email", "text"], ["Phone", "phone", "text"], ["Website", "website", "text"], ["Category", "cat", "text"],
  ["CRM Tier", "crm.tier", "text"], ["Notes", "notes", "text"],
  ["Addresses", "addresses", "addresses"], ["Tags", "tags", "list"],
];
const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
const setPath = (obj, path, val) => { const ks = path.split("."); let o = obj; for (let i = 0; i < ks.length - 1; i++) { o[ks[i]] = o[ks[i]] || {}; o = o[ks[i]]; } o[ks[ks.length - 1]] = val; };
function addressesToStr(list) {
  if (!Array.isArray(list) || !list.length) return "";
  return list.map(a => `${a.label ? a.label + ": " : ""}${a.lines || a.text || ""}`.trim()).filter(Boolean).join(" | ");
}
function strToAddresses(str) {
  return String(str || "").split("|").map(s => s.trim()).filter(Boolean).map((seg, i) => {
    const m = seg.match(/^([^:]{1,40}):\s*(.*)$/);
    return m ? { id: "a" + (i + 1), label: m[1].trim(), lines: m[2].trim() } : { id: "a" + (i + 1), label: "", lines: seg };
  });
}
function regToRow(obj, spec, getSerial) {
  const row = {};
  spec.forEach(([label, path, kind]) => {
    if (kind === "serial") { row[label] = getSerial ? getSerial(obj) : (obj.serial || ""); return; }
    let v = getPath(obj, path);
    if (path === "fullName" && !v) v = obj.name;   // company-owners carry `name`, not `fullName`
    if (kind === "addresses") v = addressesToStr(v);
    else if (kind === "list") v = Array.isArray(v) ? v.join("; ") : (v || "");
    else if (kind === "bool") v = v ? "Yes" : "No";
    else if (v == null) v = "";
    row[label] = v;
  });
  return row;
}
function rowToReg(row, spec) {
  const obj = {}; const norm = {};
  Object.keys(row).forEach(k => { norm[String(k).trim().toLowerCase()] = row[k]; });
  spec.forEach(([label, path, kind]) => {
    if (kind === "serial") return;   // ids/serials are system-assigned — never imported
    let v = norm[label.toLowerCase()];
    if (v == null || String(v).trim() === "") return;
    if (kind === "number") v = parseFloat(String(v).replace(/[^0-9.\-]/g, "")) || 0;
    else if (kind === "bool") v = /^(y|yes|true|1)$/i.test(String(v).trim());
    else if (kind === "list") v = String(v).split(/[;,]/).map(s => s.trim()).filter(Boolean);
    else if (kind === "addresses") v = strToAddresses(v);
    else v = String(v).trim();
    setPath(obj, path, v);
  });
  return obj;
}
async function exportRegistryToExcel(items, spec, sheetName, fileBase, getSerial, onError) {
  const stamp = new Date().toISOString().slice(0, 10);
  try {
    const XLSX = await loadSheetJS();
    const rows = items.map(o => regToRow(o, spec, getSerial));
    const ws = XLSX.utils.json_to_sheet(rows, { header: spec.map(c => c[0]) });
    ws["!cols"] = spec.map(c => ({ wch: c[2] === "addresses" ? 40 : Math.max(12, c[0].length + 2) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileBase}_${stamp}.xlsx`);
  } catch (e) {
    if (onError) onError(e);
    const cols = spec.map(c => c[0]);
    const rows = items.map(o => regToRow(o, spec, getSerial));
    const esc = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${fileBase}_${stamp}.csv`; a.click(); URL.revokeObjectURL(url);
  }
}
function importRegistryFromExcel(file, spec, onRows, onError) {
  const finish = (rows) => onRows(rows.map(r => rowToReg(r, spec)).filter(o => o.fullName || o.name));
  const nm = (file.name || "").toLowerCase();
  if (nm.endsWith(".csv")) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.split(/\r?\n/).filter(l => l.trim().length);
      if (!lines.length) { onRows([]); return; }
      const parseLine = (ln) => { const out = []; let cur = "", q = false; for (let i = 0; i < ln.length; i++) { const ch = ln[i]; if (ch === '"') { if (q && ln[i + 1] === '"') { cur += '"'; i++; } else q = !q; } else if (ch === "," && !q) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; };
      const headers = parseLine(lines[0]).map(h => h.trim());
      finish(lines.slice(1).map(ln => { const cells = parseLine(ln); const o = {}; headers.forEach((h, i) => o[h] = (cells[i] || "").trim()); return o; }));
    };
    reader.readAsText(file);
    return;
  }
  loadSheetJS().then(XLSX => {
    const reader = new FileReader();
    reader.onload = () => {
      try { const wb = XLSX.read(new Uint8Array(reader.result), { type: "array" }); finish(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" })); }
      catch (e) { onError && onError(e); }
    };
    reader.readAsArrayBuffer(file);
  }).catch(e => onError && onError(e));
}


// ════════════════════════════════════════════════════════════════════
// SUEZ CANAL TRANSIT HISTORY — shared selector + profile card
// ════════════════════════════════════════════════════════════════════

// SC ports matched by name OR ERP port code (ops store codes like PSD/ISM/SUZ).
const SC_PORTS = ["Port Said", "Ismailia", "Suez", "PSD", "ISM", "SUZ"];
const SC_COUNTED_STATUSES = ["Active", "Completed", "Closed"];

// Pure selector reused by Yacht Profile, Operation header, PDA Sea-Trial, Finance.
function getSCTransit(yachtId, ops, allYachts) {
  const touchesSC = (o) => (o.ports || []).some(p => {
    const s = String(p).toLowerCase();
    return SC_PORTS.some(k => s.includes(k.toLowerCase()));
  });
  const scOps = (ops || []).filter(o => o.yachtId === yachtId && SC_COUNTED_STATUSES.includes(o.status) && touchesSC(o));
  const sorted = [...scOps].sort((a, b) => String(b.eta || b.created || "").localeCompare(String(a.eta || a.created || "")));
  const yacht = (allYachts || []).find(x => x.id === yachtId) || {};
  const hasSCAFile = Boolean(yacht.scaFileNumber);
  return {
    count: scOps.length,
    firstTime: scOps.length === 0 && !hasSCAFile,
    lastTransit: sorted[0] || null,
    lastDate: sorted[0] ? (sorted[0].eta || sorted[0].created) : "",
    ops: sorted,
    hasSCAFile,
  };
}

// Inline text-button used for op links.
const SCLinkBtn = ({ children, onClick }) => (
  <span onClick={onClick} style={{ color: S.brand, cursor: "pointer", fontWeight: 500, textDecoration: "none" }}
    onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>{children}</span>
);

function SCTransitCard({ yacht, ops, allYachts, updYacht, nav }) {
  const sc = getSCTransit(yacht.id, ops, allYachts);
  const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 13 };
  const label = (t) => <span style={{ color: S.textS }}>{t}</span>;

  const fileVal = yacht.scaFileNumber || "";
  // Previous agencies as a list; migrate any legacy single value into it.
  const prevAgencies = Array.isArray(yacht.scaPrevAgencies)
    ? yacht.scaPrevAgencies
    : (yacht.scaPrevAgency || yacht.previousAgency ? [yacht.scaPrevAgency || yacht.previousAgency] : []);
  const setPrevAgencies = (list) => updYacht(yacht.id, { scaPrevAgencies: list, scaPrevAgency: list[0] || "" });
  const updPrevAgency = (i, v) => setPrevAgencies(prevAgencies.map((a, k) => k === i ? v : a));
  const addPrevAgency = () => setPrevAgencies([...prevAgencies, ""]);
  const removePrevAgency = (i) => setPrevAgencies(prevAgencies.filter((_, k) => k !== i));

  return (
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, marginTop: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, color: S.navy }}>Suez Canal Transit History</div>

      {/* Row 1 — SCA File Number (editable) */}
      <div style={rowStyle}>
        {label("SCA File Number")}
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input value={fileVal} onChange={e => updYacht(yacht.id, { scaFileNumber: e.target.value })}
            placeholder={sc.firstTime ? "N/A — First-time transit" : "Enter SCA file #"}
            style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700, width: 180, fontSize: 12, padding: "3px 7px", borderRadius: 3,
              border: `1px solid ${fileVal ? S.green : S.border}`, background: fileVal ? "#f0fff4" : S.surface }} />
          {!fileVal && (sc.firstTime
            ? <span style={{ fontSize: 11, fontStyle: "italic", color: S.orange }}>1st transit</span>
            : <span style={{ fontSize: 11, fontStyle: "italic", color: S.red }}>⚠ Missing</span>)}
        </span>
      </div>

      {/* Row 2 — Previous Agencies (editable list) */}
      <div style={{ padding: "8px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {label("Previous Agency")}
          {prevAgencies.length === 0 && (
            <input value="" onChange={e => setPrevAgencies([e.target.value])}
              placeholder={sc.firstTime ? "N/A — First transit" : "Enter previous agent name"}
              style={{ textAlign: "right", width: 220, fontSize: 12, padding: "3px 7px", borderRadius: 3, border: `1px solid ${S.border}`, background: S.surface }} />
          )}
        </div>
        {prevAgencies.map((a, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: i === 0 ? 0 : 6 }}>
            {prevAgencies.length > 1 && <span style={{ fontSize: 10, color: S.textH, marginRight: "auto" }}>{i + 1}.</span>}
            <input value={a} onChange={e => updPrevAgency(i, e.target.value)} placeholder="Previous agent name"
              style={{ textAlign: "right", width: 220, fontSize: 12, padding: "3px 7px", borderRadius: 3, border: `1px solid ${a ? S.blue : S.border}`, background: a ? "#ebf5fb" : S.surface }} />
            <button onClick={() => removePrevAgency(i)} title="Remove" style={{ border: "none", background: "none", cursor: "pointer", color: S.textH, padding: 2 }}><X size={13} /></button>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
          <button onClick={addPrevAgency} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: S.brand, background: "none", border: "none", cursor: "pointer", padding: 0 }}><Plus size={12} /> Add previous agency</button>
        </div>
      </div>

      {/* Row 3 — Transit Status (derived badge) */}
      <div style={rowStyle}>
        {label("Transit Status")}
        {sc.firstTime
          ? <span style={{ fontSize: 11, fontWeight: 500, color: S.red, background: S.redBg, padding: "2px 10px", borderRadius: 10 }}>🔴 First-Time Transit</span>
          : (sc.count === 0 && sc.hasSCAFile)
            ? <span style={{ fontSize: 11, fontWeight: 500, color: S.green, background: S.greenBg, padding: "2px 10px", borderRadius: 10 }}>🟢 Returning (SCA file on record)</span>
            : <span style={{ fontSize: 11, fontWeight: 500, color: S.green, background: S.greenBg, padding: "2px 10px", borderRadius: 10 }}>🟢 Returning Vessel</span>}
      </div>

      {/* Row 4 — Total SC Transits */}
      <div style={rowStyle}>
        {label("Total SC Transits")}
        <span style={{ fontWeight: 700 }}>{sc.count}</span>
      </div>

      {/* Row 5 — Last Transit (conditional) */}
      {sc.lastTransit && (
        <div style={rowStyle}>
          {label("Last Transit")}
          <span style={{ fontWeight: 500 }}>{sc.lastDate} · <SCLinkBtn onClick={() => nav && nav("op-detail", sc.lastTransit.id)}>{sc.lastTransit.opNumber}</SCLinkBtn></span>
        </div>
      )}

      {/* Conditional Sea Trial banners — use resolved tonnage (SCNT→SCGT→GT) */}
      {(() => {
        const ton = resolveTonnage(yacht);
        return <>
          {sc.firstTime && ton.value >= 300 && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: S.orangeBg, border: `1px solid ${S.orange}`, borderRadius: 4, fontSize: 12, fontWeight: 700, color: S.orange }}>
              ⚠ First-time transit · {ton.basis} {ton.value.toLocaleString()} ≥ 300 — Sea Trial (SCA Art. 103) applies
            </div>
          )}
          {sc.firstTime && ton.value > 0 && ton.value < 300 && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: S.greenBg, border: `1px solid ${S.green}`, borderRadius: 4, fontSize: 12, fontWeight: 700, color: S.green }}>
              ✓ First-time transit · {ton.basis} {ton.value.toLocaleString()} &lt; 300 — Sea Trial exempt
            </div>
          )}
          {ton.missingSC && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: S.redBg, border: `1px solid ${S.red}`, borderRadius: 4, fontSize: 11, fontWeight: 500, color: S.red }}>
              ⚠ Suez Canal tonnage (SCNT / SCGT) missing — calculations fall back to GT {(Number(yacht.gt) || 0).toLocaleString()}. Enter SC tonnage for accurate canal dues.
            </div>
          )}
        </>;
      })()}

      {/* Transit Log (conditional) */}
      {sc.ops.length > 1 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: S.textS, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Transit Log</div>
          {sc.ops.slice(0, 5).map(o => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <SCLinkBtn onClick={() => nav && nav("op-detail", o.id)}>{o.opNumber}</SCLinkBtn>
              <span style={{ color: S.textS }}>{(o.eta || o.created)} · {(o.ports || []).join(", ")}</span>
            </div>
          ))}
          {sc.ops.length > 5 && <div style={{ fontSize: 11, color: S.textS, marginTop: 4 }}>+ {sc.ops.length - 5} more</div>}
        </div>
      )}
    </div>
  );
}

// MODULE VIEWS

// DASHBOARD (Section 19)
const FField = ({ label, val, set, w, type = "text", ph }) => <div style={{ flex: w || 1, minWidth: 0 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>{label}</div><input type={type} value={val} placeholder={ph || ""} onChange={e => set(e.target.value)} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 6px", fontSize: 11, background: S.surface, boxSizing: "border-box" }} /></div>;
const FSelect = ({ label, val, set, opts, w }) => <div style={{ flex: w || 1, minWidth: 0 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>{label}</div><select value={val} onChange={e => set(e.target.value)} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 6px", fontSize: 11, background: S.surface, boxSizing: "border-box" }}>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select></div>;
const SaveBtn = ({ ok, onClick, label }) => <button onClick={onClick} disabled={!ok} style={{ padding: "5px 16px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: ok ? "pointer" : "default", border: "none", background: ok ? S.brand : S.border, color: ok ? "#fff" : S.textH }}>{label}</button>;
function SmallVesselCanalCalc({ sdr }) {
  const [d, setD] = useState({ length: "", width: "", depth: "" });
  const L = parseFloat(d.length) || 0, W = parseFloat(d.width) || 0, D = parseFloat(d.depth) || 0;
  const tons = L && W && D ? (L * W * D) / 2.82 : 0;
  const dues = tons * 5 * sdr;
  const inpS = { width: "100%", border: `1px solid ${S.border}`, borderRadius: 4, padding: "6px 8px", fontSize: 12, background: S.surface, boxSizing: "border-box" };
  return <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
    <div style={{ fontSize: 14, fontWeight: 500, color: S.navy }}>Small-vessel canal dues calculator <span style={{ fontSize: 11, fontWeight: 400, color: S.textS }}>— for vessels under 300 GT</span></div>
    <div style={{ fontSize: 11, color: S.textS, margin: "4px 0 12px", lineHeight: 1.5 }}>Tonnage = (Length × Width × Depth) ÷ 2.82. Canal dues = tonnage × 5 × SDR rate (1 SDR = ${sdr.toFixed(4)} USD).</div>
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 90 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 3 }}>Length (m)</div><input type="number" value={d.length} onChange={e => setD({ ...d, length: e.target.value })} style={inpS} /></div>
      <div style={{ flex: 1, minWidth: 90 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 3 }}>Width (m)</div><input type="number" value={d.width} onChange={e => setD({ ...d, width: e.target.value })} style={inpS} /></div>
      <div style={{ flex: 1, minWidth: 90 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 3 }}>Depth (m)</div><input type="number" value={d.depth} onChange={e => setD({ ...d, depth: e.target.value })} style={inpS} /></div>
      <div style={{ flex: 1, minWidth: 110, background: S.blueBg, borderRadius: 6, padding: "8px 12px" }}><div style={{ fontSize: 10, color: S.textS }}>Tonnage</div><div style={{ fontSize: 16, fontWeight: 500, color: S.navy }}>{tons ? tons.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—"}</div></div>
      <div style={{ flex: 1, minWidth: 140, background: S.greenBg, borderRadius: 6, padding: "8px 12px" }}><div style={{ fontSize: 10, color: S.textS }}>Canal dues (USD)</div><div style={{ fontSize: 16, fontWeight: 500, color: S.green }}>{dues ? "$" + dues.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</div></div>
    </div>
  </div>;
}
const DashboardView = ({ setMod, onCreateOp, allOps, user, openMyOps }) => {
  const ops = allOps || OPERATIONS;
  const active = ops.filter(o => o.status === "Active" || o.status === "Upcoming");
  const critAlerts = ALERTS.filter(a => a.type === "critical");
  const entData = {
    ...(() => {
      // invoice figures = pre-ERP history + live FDAs computed from the operations list
      const liveFin = computeFinance(ops);
      const ent = (code, entityName, style) => ({ ...style,
        invoices: FIN_HISTORY[code].invoices + liveFin.per[code].inv,
        usd: FIN_HISTORY[code].usd + liveFin.per[code].usd,
        paid: FIN_HISTORY[code].paid + liveFin.per[code].paid,
        unpaid: FIN_HISTORY[code].unpaid + liveFin.per[code].unpaid,
        ar: FIN_HISTORY[code].ar + liveFin.per[code].ar + liveFin.per[code].unbilled,
        ops: ops.filter(o => o.entity === entityName).length,
      });
      return {
        FMA: ent("FMA", "Felix Maritime Agency", { label: "Felix Maritime", color: S.blue, bg: S.blueBg }),
        GRA: ent("GRA", "German Agency", { label: "German Agency", color: S.navy, bg: "#E6F1FB" }),
        CRA: ent("CRA", "Cruising Agency", { label: "Cruising Agency", color: "#1D9E75", bg: "#E1F5EE" }),
      };
    })(),
  };
  const totalUsd = Object.values(entData).reduce((a, e) => a + e.usd, 0);
  const totalInv = Object.values(entData).reduce((a, e) => a + e.invoices, 0);
  const totalPaid = Object.values(entData).reduce((a, e) => a + e.paid, 0);
  const totalUnpaid = Object.values(entData).reduce((a, e) => a + e.unpaid, 0);
  const totalAr = Object.values(entData).reduce((a, e) => a + e.ar, 0);
  const entColorMap = { "Felix Maritime Agency": { code: "FMA", color: S.blue, bg: S.blueBg }, "German Agency": { code: "GRA", color: S.navy, bg: "#E6F1FB" }, "Cruising Agency": { code: "CRA", color: "#1D9E75", bg: "#E1F5EE" } };

  return <>
    {/* Greeting + date */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 500 }}>{new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}, {(user?.name || "there").split(" ")[0]}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => onCreateOp && onCreateOp()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.orange}`, background: S.orange, color: "#fff" }}><Plus size={14} /> Create New Operation</button>
        <div style={{ fontSize: 11, color: S.textS }}><Calendar size={11} style={{ marginRight: 3 }} />{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · Port Said</div>
      </div>
    </div>

    {/* Urgent banner */}
    {critAlerts.length > 0 && <div style={{ background: S.redBg, border: `1px solid ${S.red}33`, borderRadius: 8, padding: "8px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <AlertCircle size={16} color={S.red} />
      <span style={{ fontSize: 12, fontWeight: 500, color: S.red }}>{critAlerts.length} urgent:</span>
      <span style={{ fontSize: 12, color: "#991B1B" }}>{critAlerts.map(a => a.title).join(" · ")}</span>
    </div>}

    {/* Entity health cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
      {Object.entries(entData).map(([code, e]) => (
        <div key={code} style={{ background: S.surface, borderRadius: 0, padding: "10px 14px", cursor: "pointer", borderLeft: `3px solid ${e.color}`, border: `1px solid ${S.borderL}`, borderLeftWidth: 3, borderLeftColor: e.color }} onClick={() => setMod("finance")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: e.color }}>{code}</span>
            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: e.bg, color: e.color }}>{e.ops} ops · {e.invoices} inv</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, color: e.color }}>${(e.usd / 1000000).toFixed(2)}M</div>
          <div style={{ display: "flex", gap: 1, height: 6, borderRadius: 3, overflow: "hidden", margin: "6px 0" }}>
            <div style={{ width: `${e.paid / (e.paid + e.unpaid) * 100}%`, background: S.green, borderRadius: "3px 0 0 3px" }}></div>
            <div style={{ width: `${e.unpaid / (e.paid + e.unpaid) * 100}%`, background: S.orange, borderRadius: "0 3px 3px 0" }}></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: S.textS }}>
            <span>{e.paid} paid</span><span>{e.unpaid} unpaid</span><span>AR ${Math.round(e.ar / 1000)}K</span>
          </div>
        </div>
      ))}
    </div>

    {/* Monthly revenue chart + Active operations */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
      {/* Revenue chart placeholder */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}><BarChart3 size={13} style={{ marginRight: 4 }} />Monthly revenue</span>
          <div style={{ display: "flex", gap: 8, fontSize: 10, color: S.textH }}>
            <span><span style={{ display: "inline-block", width: 7, height: 3, background: S.navy, borderRadius: 1, marginRight: 3, verticalAlign: "middle" }}></span>GRA</span>
            <span><span style={{ display: "inline-block", width: 7, height: 3, background: S.blue, borderRadius: 1, marginRight: 3, verticalAlign: "middle" }}></span>FMA</span>
            <span><span style={{ display: "inline-block", width: 7, height: 3, background: "#1D9E75", borderRadius: 1, marginRight: 3, verticalAlign: "middle" }}></span>CRA</span>
          </div>
        </div>
        <div style={{ padding: 10 }}>
          {/* Stacked bars inline */}
          {[["J", 320, 150, 40], ["F", 290, 85, 35], ["M", 410, 270, 50], ["A", 380, 160, 55], ["M", 350, 100, 45]].map(([m, g, f, c], mi) => {
            const total = g + f + c; const max = 730;
            return <div key={mi} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ width: 14, fontSize: 10, color: S.textH, textAlign: "right" }}>{m}</span>
              <div style={{ flex: 1, display: "flex", height: 14, borderRadius: 3, overflow: "hidden", gap: 1 }}>
                <div style={{ width: `${g / max * 100}%`, background: S.navy }}></div>
                <div style={{ width: `${f / max * 100}%`, background: S.blue }}></div>
                <div style={{ width: `${c / max * 100}%`, background: "#1D9E75" }}></div>
              </div>
              <span style={{ fontSize: 10, color: S.textS, minWidth: 35, textAlign: "right" }}>${total}K</span>
            </div>;
          })}
        </div>
      </div>

      {/* Active operations */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}><Ship size={13} style={{ marginRight: 4 }} />Active operations</span>
          <button onClick={() => setMod("operations")} style={{ fontSize: 11, color: S.brand, background: "none", border: "none", cursor: "pointer" }}>View All</button>
        </div>
        {ops.filter(o => o.status === "Active" || o.status === "Upcoming" || o.status === "Enquiry").slice(0, 5).map(op => {
          const ec = entColorMap[op.entity] || { code: "FMA", color: S.blue, bg: S.blueBg };
          const dotColor = op.status === "Active" ? S.green : op.status === "Upcoming" ? S.orange : S.blue;
          return <div key={op.id} style={{ padding: "6px 14px", borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }}></span>
            <span style={{ fontWeight: 500, flex: 1 }}>{op.vesselName}</span>
            <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, background: ec.bg, color: ec.color }}>{ec.code}</span>
            <span style={{ fontSize: 10, color: S.textS }}>{op.eta || "TBC"}</span>
          </div>;
        })}
      </div>
    </div>

    {/* My operations — the ops where the signed-in user is on the team */}
    {(() => {
      const mine = ops.filter(o => onTeam(o, user?.id) && ["Enquiry", "Upcoming", "Active"].includes(o.status));
      return <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}><UserCircle size={13} style={{ marginRight: 4 }} />My operations <span style={{ fontSize: 11, color: S.textS, fontWeight: 400 }}>— you're on the team of {mine.length} live op{mine.length === 1 ? "" : "s"}</span></span>
          <button onClick={openMyOps} style={{ fontSize: 11, color: S.brand, background: "none", border: "none", cursor: "pointer" }}>Open my list</button>
        </div>
        {mine.length === 0 && <div style={{ padding: "14px", fontSize: 12, color: S.textS }}>Nothing assigned to you right now. When a colleague adds you to an operation's team (or you create one), it appears here.</div>}
        {mine.slice(0, 6).map(op => {
          const me = opTeam(op).find(m => m.staffId === user?.id);
          const lead = teamMembers(op).find(m => m.role === "Lead");
          const ec = entColorMap[op.entity] || { code: "FMA", color: S.blue, bg: S.blueBg };
          return <div key={op.id} style={{ padding: "7px 14px", borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <Status value={op.status} />
            <span style={{ fontWeight: 500 }}>{op.vesselName}</span>
            <span style={{ fontSize: 11, color: S.textS }}>{op.opNumber}</span>
            <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, background: ec.bg, color: ec.color }}>{ec.code}</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 10.5, padding: "1px 8px", borderRadius: 10, background: me?.role === "Lead" ? S.brandL : S.bg, color: me?.role === "Lead" ? S.brand : S.textS, fontWeight: 500 }}>Your role: {me?.role || "—"}</span>
            {me?.role !== "Lead" && lead && <span style={{ fontSize: 10.5, color: S.textS }}>Lead: {lead.name.split(" ")[0]}</span>}
            <span style={{ fontSize: 10, color: S.textS }}>ETA {op.eta || "TBC"}</span>
          </div>;
        })}
      </div>;
    })()}

    {/* Action feed + Quick actions sidebar */}
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${S.borderL}` }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}><Bell size={13} style={{ marginRight: 4 }} />Action feed</span>
        </div>
        {ALERTS.map(a => {
          const colorMap = { critical: S.red, warning: S.orange, notice: S.blue, gold: S.gold };
          const iconMap = { "ETA approaching": Clock, "Unbilled revenue": DollarSign, "Visa expiring": Stamp, "PDA vs actuals variance": TrendingUp, "Overdue FDA": Receipt, "NDA in effect": Shield, "Provision delivery overdue": Truck };
          const clr = colorMap[a.type] || S.blue;
          const Ic = iconMap[a.title] || AlertTriangle;
          return <div key={a.id} style={{ display: "flex", gap: 8, padding: "7px 14px", borderBottom: `1px solid ${S.borderL}`, borderLeft: `3px solid ${clr}`, borderRadius: 0 }}>
            <Ic size={13} color={clr} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: S.textS, marginTop: 1 }}>{a.desc}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 10, background: colorMap[a.type] ? `${clr}18` : S.blueBg, color: clr, flexShrink: 0, alignSelf: "flex-start" }}>{a.severity}</span>
          </div>;
        })}
      </div>

      <div>
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, marginBottom: 10, overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", borderBottom: `1px solid ${S.borderL}` }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}><Activity size={13} style={{ marginRight: 4 }} />Quick actions</span>
          </div>
          <div style={{ padding: 6 }}>
            {[["New operation", "operations"], ["Create PDA", "operations"], ["New transit", "transit"], ["Crew change", "crewchange"]].map(([label, mod]) => (
              <div key={label} onClick={() => (label === "New operation" && onCreateOp) ? onCreateOp() : setMod(mod)} style={{ padding: "6px 10px", marginBottom: 2, borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={11} color={S.brand} />{label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: S.bg, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Today's numbers</div>
          {[["Active ops", active.length, ""], ["Transits today", 1, ""], ["Pending PDAs", 3, S.orange], ["Overdue FDAs", 1, S.red], ["Collection rate", "74%", S.green]].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 11 }}>
              <span style={{ color: S.textS }}>{l}</span><span style={{ fontWeight: 500, color: c || S.text }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>;
};

// OPERATIONS (Section 3)
const F = ({ label, val, set, w, disabled }) => <div style={{ flex: w || 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>{label}</div><input value={val || ""} onChange={e => set(e.target.value)} disabled={disabled} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 6px", fontSize: 11, background: disabled ? S.bg : S.surface, color: disabled ? S.textH : S.text }} /></div>;
const FW = ({ label, req, hint, children }) => <div style={{ display: "flex", flexDirection: "column", gap: 3 }}><label style={{ fontSize: 11, color: S.textS }}>{label}{req && <span style={{ color: S.red, marginLeft: 2 }}>*</span>}</label>{children}{hint && <div style={{ fontSize: 10, color: S.textH }}>{hint}</div>}</div>;
const Section = ({ title, children }) => <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, color: S.navy }}>{title}</div>{children}</div>;
const StatCard = ({ val, label, color }) => <div style={{ flex: 1, background: `${color || S.green}10`, borderLeft: `3px solid ${color || S.green}`, borderRadius: 6, padding: "12px 16px", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 500, color: color || S.green }}>{val}</div><div style={{ fontSize: 10, color: S.textS, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{label}</div></div>;
const TAG_PALETTE = [["#E1F5EE","#085041"],["#E6F1FB","#0C447C"],["#EAF3DE","#27500A"],["#EEEDFE","#3C3489"],["#FAEEDA","#633806"],["#FAECE7","#712B13"],["#FBEAF0","#72243E"],["#FCEBEB","#791F1F"],["#E1F0F0","#0F5C5C"],["#F1EFE8","#444441"]];
const tagColor = (name) => { const s = (name || "").toLowerCase().trim(); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; const p = TAG_PALETTE[h % TAG_PALETTE.length]; return { bg: p[0], fg: p[1] }; };
function TagChips({ tags, onClick, active }) {
  const list = (tags || []).filter(Boolean);
  if (!list.length) return null;
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
    {list.map(t => { const c = tagColor(t); const on = active === t; return <span key={t} onClick={onClick ? (e) => { e.stopPropagation(); onClick(t); } : undefined} style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: on ? c.fg : c.bg, color: on ? "#fff" : c.fg, cursor: onClick ? "pointer" : "default", border: on ? `1px solid ${c.fg}` : "1px solid transparent" }}>{t}</span>; })}
  </div>;
}
function TagBox({ tags, allTags, onChange }) {
  const [q, setQ] = useState("");
  const list = (tags || []).filter(Boolean);
  const add = (t) => { const v = (t || "").trim(); if (!v) return; if (!list.some(x => x.toLowerCase() === v.toLowerCase())) onChange([...list, v]); setQ(""); };
  const rm = (t) => onChange(list.filter(x => x !== t));
  const ql = q.trim().toLowerCase();
  const sugg = ql ? (allTags || []).filter(t => t.toLowerCase().includes(ql) && !list.some(x => x.toLowerCase() === t.toLowerCase())).slice(0, 6) : [];
  const exact = ql && (allTags || []).some(t => t.toLowerCase() === ql);
  return <div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {list.map(t => { const c = tagColor(t); return <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 4px 3px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 500, background: c.bg, color: c.fg }}>{t}<span onClick={() => rm(t)} style={{ cursor: "pointer", fontWeight: 700, fontSize: 14, lineHeight: 1, opacity: 0.55, padding: "0 3px" }}>×</span></span>; })}
      <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(q); } else if (e.key === "Backspace" && !q && list.length) { rm(list[list.length - 1]); } }} placeholder="+ Add tag" style={{ border: `1px dashed ${S.border}`, borderRadius: 999, padding: "4px 10px", fontSize: 11.5, outline: "none", background: "transparent", color: S.text, width: 92 }} />
    </div>
    {(sugg.length > 0 || (ql && !exact)) && <div style={{ border: `1px solid ${S.border}`, borderRadius: 6, marginTop: 6, overflow: "hidden", maxWidth: 300, background: S.surface, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {sugg.map(t => { const c = tagColor(t); return <div key={t} onClick={() => add(t)} style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => e.currentTarget.style.background = S.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><span style={{ padding: "1px 8px", borderRadius: 999, fontSize: 10.5, fontWeight: 500, background: c.bg, color: c.fg }}>{t}</span><span style={{ marginLeft: "auto", fontSize: 10, color: S.textH }}>reuse</span></div>; })}
      {ql && !exact && <div onClick={() => add(q.trim())} style={{ padding: "6px 10px", fontSize: 12, color: S.brand, cursor: "pointer", borderTop: sugg.length ? `1px solid ${S.borderL}` : "none", fontWeight: 500 }} onMouseEnter={e => e.currentTarget.style.background = S.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>+ Create "{q.trim()}"</div>}
    </div>}
  </div>;
}
const timeAgo = (ts) => {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60); if (min < 60) return min <= 1 ? "1 min ago" : min + " min ago";
  const hr = Math.floor(min / 60); if (hr < 24) return hr === 1 ? "1 hour ago" : hr + " hours ago";
  const day = Math.floor(hr / 24); if (day < 7) return day === 1 ? "yesterday" : day + " days ago";
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
function ActivityBell({ items, unread, onOpen }) {
  const [open, setOpen] = useState(false);
  const [newIds, setNewIds] = useState([]);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", esc); };
  }, [open]);
  const toggle = () => { setOpen(o => { const nx = !o; if (nx) { setNewIds(items.filter(i => !i.read).map(i => i.id)); onOpen(); } return nx; }); };
  const kindMeta = { add: { c: S.green }, edit: { c: S.blue }, tag: { c: S.purple }, delete: { c: S.red }, move: { c: S.orange }, link: { c: S.cyan } };
  const entityIcon = { yacht: Ship, company: Building2, person: UserCircle, owner: UserCircle, operation: FileText };
  return <div ref={ref} style={{ position: "relative", display: "flex" }}>
    <button onClick={toggle} title="Activity" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", position: "relative" }}>
      <Bell size={16} color="rgba(255,255,255,0.7)" />
      {unread > 0 && <span style={{ position: "absolute", top: -6, right: -7, minWidth: 14, height: 14, padding: "0 3px", borderRadius: 7, background: S.red, border: "1.5px solid #354A5F", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && <div style={{ position: "absolute", top: 30, right: -6, width: 384, maxHeight: 470, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, boxShadow: "0 10px 32px rgba(0,0,0,0.20)", zIndex: 1000, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Bell size={14} color={S.navy} /><span style={{ fontSize: 13, fontWeight: 600, color: S.text }}>Activity</span></div>
        <span style={{ fontSize: 10.5, color: S.textS }}>{items.length} event{items.length === 1 ? "" : "s"} · all entities</span>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {items.length === 0 ? <div style={{ padding: "38px 22px", textAlign: "center" }}><Bell size={22} color={S.border} /><div style={{ fontSize: 12.5, fontWeight: 500, color: S.textS, marginTop: 10 }}>No activity yet</div><div style={{ fontSize: 11, color: S.textH, marginTop: 5, lineHeight: 1.5 }}>Actions taken in the system (adding or editing yachts, companies, people and tags) will appear here as they happen.</div></div> :
          items.slice(0, 80).map(it => {
            const km = kindMeta[it.kind] || kindMeta.edit;
            const isNew = newIds.includes(it.id);
            const ac = tagColor(it.who);
            const initials = (it.who || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
            const EIc = entityIcon[it.entityType];
            return <div key={it.id} style={{ display: "flex", gap: 10, padding: "10px 16px", borderBottom: `1px solid ${S.borderL}`, background: isNew ? `${S.brand}0A` : "transparent", alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: ac.bg, color: ac.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, flexShrink: 0, position: "relative" }}>{initials}<span style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: km.c, border: `2px solid ${S.surface}` }} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: S.text, lineHeight: 1.5 }}><span style={{ fontWeight: 600 }}>{it.who}</span> {it.action} {it.entity && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 7px", borderRadius: 4, background: S.bg, border: `1px solid ${S.borderL}`, fontWeight: 500, color: S.text }}>{EIc && <EIc size={10} color={S.textS} />}{it.entity}</span>}{it.suffix ? " " + it.suffix : ""}</div>
                <div style={{ fontSize: 10.5, color: S.textH, marginTop: 3 }}>{timeAgo(it.ts)}{isNew && <span style={{ marginLeft: 8, color: S.brand, fontWeight: 700, letterSpacing: 0.3 }}>NEW</span>}</div>
              </div>
            </div>;
          })}
      </div>
      <div style={{ padding: "8px 16px", borderTop: `1px solid ${S.borderL}`, textAlign: "center", fontSize: 10.5, color: S.textH, background: S.bg }}>Showing recent activity across yachts, companies &amp; people</div>
    </div>}
  </div>;
}
// Hierarchical PDA builder for the sub-300T SC transit packages. Groups expand/collapse;
// group totals = subtotal of included sub-items; qty/VAT left blank stay off the document;
// every value is editable with a math-mismatch warning; custom items/sub-items can be added.
// Internal notes are employee-only and never leave this screen or the saved document's
// internalNote field (the client document never renders them).
function Sub300Builder({ pkg, op, yacht, onSave, onCancel, externalAddRef }) {
  const r2 = (n) => Math.round(n * 100) / 100;
  const [groups, setGroups] = useState(() => pkg.groups.map((g, gi) => ({
    ...g, id: "g" + gi, expanded: true,
    subs: g.subs.map((s, si) => ({ ...s, id: `g${gi}s${si}`, include: !!s.include, qty: s.qty ?? "", price: s.price ?? "", vat: s.vat ?? "", amount: "", note: s.note ?? "", custom: false })),
  })));
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_TERMS[0]);
  const [dims, setDims] = useState({ L: yacht?.loa || op?.vesselLoa || "", W: yacht?.beam || "", D: yacht?.draught || "" });
  const [sdr, setSdr] = useState(DEFAULT_SDR);
  const [scntOverride, setScntOverride] = useState(yacht?.scnt ? String(yacht.scnt) : "");
  const scntCalc = r2(((parseFloat(dims.L) || 0) * (parseFloat(dims.W) || 0) * (parseFloat(dims.D) || 0)) / 2.82);
  const scnt = scntOverride !== "" ? (parseFloat(scntOverride) || 0) : scntCalc;
  const sdrBad = Number(sdr) < 1 || Number(sdr) > 2;
  const duesAmt = r2(scnt * 5 * (parseFloat(sdr) || 0));

  // Every row is Qty × Rate. The canal-dues row's rate IS the calculated dues figure
  // (SCNT × 5 × SDR) from the calc bar; qty stays manual. A typed Amount overrides the
  // auto product but must reconcile — the math check flags any that don't.
  const effQty = (s) => (s.qty === "" || s.qty == null) ? 1 : (parseFloat(s.qty) || 0);
  const rateOf = (s) => s.autoCalc ? (s.price !== "" ? (parseFloat(s.price) || 0) : duesAmt) : (parseFloat(s.price) || 0);
  const effAmount = (s) => s.amount !== "" ? (parseFloat(s.amount) || 0) : r2(effQty(s) * rateOf(s));
  const vatOf = (s) => r2(effAmount(s) * ((parseFloat(s.vat) || 0) / 100));
  const mismatch = (s) => s.amount !== "" && Math.abs((parseFloat(s.amount) || 0) - r2(effQty(s) * rateOf(s))) > 0.01;
  const groupTotal = (g) => r2(g.subs.filter(s => s.include).reduce((a, s) => a + effAmount(s) + vatOf(s), 0));   // gross (incl. VAT)
  const subNet = r2(groups.reduce((a, g) => a + g.subs.filter(s => s.include).reduce((x, s) => x + effAmount(s), 0), 0));
  const subVat = r2(groups.reduce((a, g) => a + g.subs.filter(s => s.include).reduce((x, s) => x + vatOf(s), 0), 0));
  const grand = r2(subNet + subVat);
  const mismatches = groups.flatMap(g => g.subs.filter(s => s.include && mismatch(s)).map(s => s.name));

  const setSub = (gid, sid, patch) => setGroups(gs => gs.map(g => g.id !== gid ? g : { ...g, subs: g.subs.map(s => s.id === sid ? { ...s, ...patch } : s) }));
  const setGrp = (gid, patch) => setGroups(gs => gs.map(g => g.id === gid ? { ...g, ...patch } : g));
  const removeSub = (gid, sid) => setGroups(gs => gs.map(g => g.id !== gid ? g : { ...g, subs: g.subs.filter(s => s.id !== sid) }));
  const removeGrp = (gid) => setGroups(gs => gs.filter(g => g.id !== gid));
  const addSub = (gid) => setGroups(gs => gs.map(g => g.id !== gid ? g : { ...g, expanded: true, subs: [...g.subs, { id: gid + "s" + Date.now(), name: "", qty: "", price: "", vat: "", amount: "", include: true, custom: true, internalNote: "" }] }));
  const addGrp = () => setGroups(gs => [...gs, { id: "g" + Date.now(), name: "NEW ITEM", unit: "Per each", expanded: true, custom: true, subs: [{ id: "s" + Date.now(), name: "", qty: "", price: "", vat: "", amount: "", include: true, custom: true, internalNote: "" }] }]);
  // Items added from the service catalog (below the builder) land under ADDITIONAL SERVICES.
  useEffect(() => {
    if (!externalAddRef) return;
    externalAddRef.current = (item) => setGroups(gs => {
      const sub = { id: "x" + Date.now() + Math.floor(Math.random() * 1e4), name: item.name || "", qty: item.qty ?? "", price: item.price ?? "", vat: item.vat === 0 || item.vat === "" || item.vat == null ? "" : item.vat, amount: "", note: "", include: true, custom: true, internalNote: item.internalNote || item.note || "" };
      const idx = gs.findIndex(g => g.name === "ADDITIONAL SERVICES");
      if (idx >= 0) return gs.map((g, i) => i === idx ? { ...g, expanded: true, subs: [...g.subs, sub] } : g);
      return [...gs, { id: "gx" + Date.now(), name: "ADDITIONAL SERVICES", unit: item.unit || "Per each", expanded: true, custom: true, subs: [sub] }];
    });
    return () => { externalAddRef.current = null; };
  }, []);

  const handleSave = () => {
    if (mismatches.length) { alert("Math check failed — the overridden amount doesn't equal Qty × Rate on:\n• " + mismatches.join("\n• ") + "\n\nFix the numbers or clear the manual amount to auto-calculate."); return; }
    if (sdrBad) { alert("SDR rate " + sdr + " is outside the plausible 1.0–2.0 band — check for a typo before saving."); return; }
    const lines = [];
    groups.forEach(g => g.subs.filter(s => s.include && (s.name || "").trim()).forEach(s => {
      lines.push({
        n: (lines.length + 1) * 10, svc: "", group: g.name, name: s.name.trim(), unit: g.unit || "",
        qty: s.qty === "" ? null : parseFloat(s.qty) || 0,
        price: rateOf(s),
        vat: s.vat === "" || s.vat == null ? null : parseFloat(s.vat) || 0,
        amount: effAmount(s),
        note: s.note || "", internalNote: s.autoCalc ? `${s.internalNote || ""} [SCNT ${scnt} × 5 SDR @ ${sdr} = $${duesAmt}]`.trim() : (s.internalNote || ""),
        feeType: lineFeeType({ name: s.name, group: g.name }), // pass-through vs agency fee (audit B01) — explicit on the line, overridable
      });
    }));
    if (!lines.length) { alert("Nothing to save — include at least one item."); return; }
    // Rates travel with the document (audit B05): the SDR used for canal dues and the EGP
    // rate used for EGP-derived prices, so the PDA is auditable after rates move.
    onSave(lines, paymentTerms, { sdrRate: parseFloat(sdr) || DEFAULT_SDR, egpRate: FX_RATE_EGP, scnt });
  };

  const num = { width: 68, border: `1px solid ${S.border}`, borderRadius: 3, padding: "3px 5px", fontSize: 11, background: S.surface, boxSizing: "border-box", textAlign: "right" };
  const money = (v) => "$" + (Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
    <div style={{ padding: "10px 14px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{pkg.label}</div>
        <div style={{ fontSize: 11, color: S.textS }}>{op?.vesselName} · {op?.vesselLoa || "—"}m · tick items to include — group totals roll up automatically</div>
      </div>
      <button onClick={addGrp} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><Plus size={11} /> Add item</button>
    </div>
    <div style={{ padding: "6px 14px", background: S.blueBg, borderBottom: `1px solid ${S.borderL}`, fontSize: 11, color: "#0C447C", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontWeight: 600 }}>Canal dues auto-calc:</span>
      <span>L <input value={dims.L} onChange={e => setDims(d => ({ ...d, L: e.target.value }))} style={{ ...num, width: 52 }} /> ×</span>
      <span>W <input value={dims.W} onChange={e => setDims(d => ({ ...d, W: e.target.value }))} style={{ ...num, width: 52 }} /> ×</span>
      <span>D <input value={dims.D} onChange={e => setDims(d => ({ ...d, D: e.target.value }))} style={{ ...num, width: 52 }} /> ÷ 2.82</span>
      <span>SCNT <input value={scntOverride} placeholder={String(scntCalc)} onChange={e => setScntOverride(e.target.value)} style={{ ...num, width: 66, fontWeight: 600 }} /></span>
      <span>SDR <input value={sdr} onChange={e => setSdr(e.target.value)} style={{ ...num, width: 62, borderColor: sdrBad ? S.red : S.border }} /></span>
      <span style={{ fontWeight: 700 }}>= {money(duesAmt)}</span>
      {sdrBad && <span style={{ color: S.red, fontWeight: 600 }}>⚠ SDR outside 1.0–2.0</span>}
    </div>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead><tr style={{ background: "#F2F2F2" }}>
        {["", "SN", "Item", "Qty", "Rate (USD)", "VAT %", "Amount", ""].map((h, i) => <th key={i} style={{ textAlign: i >= 3 && i <= 6 ? "right" : "left", padding: "5px 8px", color: S.textS, fontWeight: 500, fontSize: 10, borderBottom: `1px solid ${S.border}`, whiteSpace: "nowrap" }}>{h}</th>)}
      </tr></thead>
      <tbody>
        {groups.map((g, gi) => <Fragment key={g.id}>
          <tr style={{ background: S.bg, cursor: "pointer" }} onClick={() => setGrp(g.id, { expanded: !g.expanded })}>
            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, width: 24 }}>{g.expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</td>
            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, fontFamily: "monospace", fontSize: 10, color: S.textS }}>{String(gi + 1).padStart(2, "0")}</td>
            <td colSpan={4} style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}` }} onClick={e => g.custom && e.stopPropagation()}>
              {g.custom ? <input value={g.name} onChange={e => setGrp(g.id, { name: e.target.value.toUpperCase() })} style={{ ...num, width: 220, textAlign: "left", fontWeight: 700 }} /> : <span style={{ fontWeight: 700 }}>{g.name}</span>}
              <span style={{ marginLeft: 8, fontSize: 9, padding: "1px 5px", borderRadius: 3, background: S.brandL, color: S.brand, fontWeight: 600 }}>{g.unit}</span>
              <span style={{ marginLeft: 8, fontSize: 10, color: S.textH }}>{g.subs.filter(s => s.include).length}/{g.subs.length} included</span>
              {g.groupNote && <div style={{ fontSize: 10, color: S.textH, fontStyle: "italic", marginTop: 1 }}>{g.groupNote}</div>}
            </td>
            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{money(groupTotal(g))}</td>
            <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
              <button onClick={() => addSub(g.id)} title="Add sub-item" style={{ border: "none", background: "transparent", color: S.brand, cursor: "pointer", padding: 2 }}><Plus size={13} /></button>
              <button onClick={() => removeGrp(g.id)} title="Remove item + sub-items" style={{ border: "none", background: "transparent", color: S.red, cursor: "pointer", padding: 2 }}><Trash2 size={12} /></button>
            </td>
          </tr>
          {g.expanded && g.subs.map(s => {
            const bad = s.include && mismatch(s);
            return <tr key={s.id} style={{ opacity: s.include ? 1 : 0.45, background: bad ? "#FDECEC" : "transparent", verticalAlign: "top" }}>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "center" }}><input type="checkbox" checked={s.include} onChange={() => setSub(g.id, s.id, { include: !s.include })} style={{ cursor: "pointer" }} /></td>
              <td style={{ borderBottom: `1px solid ${S.borderL}` }}></td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, minWidth: 220 }}>
                {s.custom ? <input value={s.name} placeholder="Sub-item name..." onChange={e => setSub(g.id, s.id, { name: e.target.value })} style={{ ...num, width: 200, textAlign: "left" }} /> : <span style={{ paddingLeft: 10, fontWeight: 500 }}>{s.name}</span>}
                {s.autoCalc && <span style={{ marginLeft: 6, fontSize: 9, padding: "1px 5px", borderRadius: 3, background: S.greenBg, color: S.green, fontWeight: 600 }}>Rate auto-calculated</span>}
                <div style={{ margin: "3px 0 0 10px", background: S.greenBg, border: `1px dashed ${S.green}50`, borderRadius: 4, padding: "3px 6px", display: "flex", alignItems: "flex-start", gap: 4 }}>
                  <Lock size={9} style={{ color: S.green, flexShrink: 0, marginTop: 2 }} />
                  <textarea value={s.internalNote || ""} rows={1} placeholder="INTERNAL — employees only, never printed..." onChange={e => setSub(g.id, s.id, { internalNote: e.target.value })} style={{ width: "100%", border: "none", fontSize: 10, fontStyle: "italic", color: S.green, background: "transparent", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.4, minHeight: 15 }} />
                </div>
                <input value={s.note || ""} placeholder="Add note... (shows on the PDA/FDA)" onChange={e => setSub(g.id, s.id, { note: e.target.value })} style={{ width: "100%", margin: "3px 0 0 10px", border: `1px solid ${S.borderL}`, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontStyle: "italic", color: S.textS, background: S.surface, boxSizing: "border-box", outline: "none" }} />
              </td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}><input value={s.qty} placeholder="—" onChange={e => setSub(g.id, s.id, { qty: e.target.value })} style={{ ...num, width: 52 }} title="Manual quantity. Blank = flat charge — qty not shown on the PDA/FDA" /></td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}><input value={s.price} placeholder={s.autoCalc ? duesAmt.toFixed(2) : "0"} onChange={e => setSub(g.id, s.id, { price: e.target.value })} style={{ ...num, fontWeight: s.autoCalc ? 600 : 400 }} title={s.autoCalc ? "Auto-calculated: SCNT × 5 × SDR. Type to override; clear to return to the calculated rate." : "Rate (USD)"} /></td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}><input value={s.vat} placeholder="—" onChange={e => setSub(g.id, s.id, { vat: e.target.value })} style={{ ...num, width: 46 }} title="Blank = VAT not shown" /></td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}>
                <input value={s.amount} placeholder={String(r2(effQty(s) * rateOf(s)).toFixed(2))} onChange={e => setSub(g.id, s.id, { amount: e.target.value })} style={{ ...num, fontWeight: 600, borderColor: bad ? S.red : S.border }} title="Auto = Qty × Rate. Type to override — the math check flags mismatches." />
                {bad && <div style={{ fontSize: 9, color: S.red, fontWeight: 600 }}>≠ Qty × Rate</div>}
              </td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}` }}><button onClick={() => removeSub(g.id, s.id)} title="Remove sub-item" style={{ border: "none", background: "transparent", color: S.red, cursor: "pointer", padding: 2 }}><X size={12} /></button></td>
            </tr>;
          })}
        </Fragment>)}
      </tbody>
    </table>
    <div style={{ padding: "10px 14px", borderTop: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: S.textS }}>
        {mismatches.length > 0 ? <span style={{ color: S.red, fontWeight: 600 }}>⚠ {mismatches.length} math mismatch{mismatches.length > 1 ? "es" : ""} — fix before saving</span> : <span>All amounts reconcile.</span>}
        <span style={{ color: S.textH }}>|</span>
        <span>Payment terms</span>
        <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} style={{ border: `1px solid ${S.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11, background: S.surface, color: S.text, maxWidth: 250 }}>
          {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, color: S.textS }}>Subtotal {money(subNet)}</span>
        <span style={{ fontSize: 12, color: S.textS }}>VAT {money(subVat)}</span>
        <span style={{ fontSize: 13 }}>Total <strong>{money(grand)}</strong></span>
        <button onClick={onCancel} style={{ padding: "5px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>Cancel</button>
        <button onClick={handleSave} title="Saves as a Draft — nothing goes to the client until you press Send on the document" style={{ padding: "5px 14px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff", display: "flex", alignItems: "center", gap: 4 }}><Check size={11} /> Save as draft</button>
      </div>
    </div>
  </div>;
}

const OperationsView = ({ activeEntity, intent, clearIntent, user, owners, allOps, addOp, updOp, allYachts, addYacht, updYacht }) => {
  const yachts = allYachts || YACHTS;
  const [filter, setFilter] = useState(["All"]);
  const [selectedOp, setSelectedOp] = useState(null);
  const [activeTab, setActiveTab] = useState("timeline");
  const [selectedPda, setSelectedPda] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [emailImport, setEmailImport] = useState(false);   // "Create from email" paste panel
  const [emailRaw, setEmailRaw] = useState("");
  const [pendingEmail, setPendingEmail] = useState(null);  // parsed enquiry email, attached to the op on create
  const ops = allOps || OPERATIONS;
  const [voyagePlans, setVoyagePlans] = useState({});
  const [showAddVessel, setShowAddVessel] = useState(false);
  const [newVessel, setNewVessel] = useState({ name: "", type: "Motor", flag: "", imo: "" });
  const [createdPdas, setCreatedPdas] = useState({});
  const [showPdaBuilder, setShowPdaBuilder] = useState(false);
  const [sub300Pkg, setSub300Pkg] = useState(null);   // "nb" | "sb" → hierarchical sub-300 builder
  const sub300AddRef = useRef(null);   // registered by Sub300Builder — routes catalog "Add" clicks into the open builder
  const [editPdaItems, setEditPdaItems] = useState(null);
  const [pdaDiscount, setPdaDiscount] = useState({ desc: "", amount: 0, mode: "fixed", pct: 0 });
  const emptyForm = { vesselName: "", yachtId: "", clientName: "", clientEmail: "", vesselLoa: "", vesselGt: "", vesselFlag: "", vesselImo: "", ports: [], eta: "", etd: "", lastPort: "", nextPort: "", baseCurrency: "USD", opType: "enquiry", staffId: "s1", notes: "", newVesselName: "", charterStatus: "Auto (from vessel)", leadName: "", supportNames: "" };
  const [form, setForm] = useState(emptyForm);
  useEffect(() => { if (intent === "create" || (intent && intent.create)) { setSelectedOp(null); setShowCreate(true); const yk = intent && intent.yacht; if (yk) { const ow = owners.find(o => o.id === yk.ownerId); setForm(f => ({ ...f, yachtId: yk.id, vesselName: yk.name, vesselLoa: yk.loa, vesselGt: yk.gt, vesselFlag: yk.flag, vesselImo: yk.imo || "", clientName: ow?.name || f.clientName, clientEmail: ow?.email || f.clientEmail })); } clearIntent && clearIntent(); } else if (intent && intent.openOp) { const target = (allOps || OPERATIONS).find(o => o.id === intent.openOp); if (target) { setSelectedOp(target); setActiveTab(intent.tab || "timeline"); } clearIntent && clearIntent(); } else if (intent && intent.mineOnly) { setMineOnly(true); clearIntent && clearIntent(); } }, []);
  const updateForm = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEnquiry = form.opType === "enquiry";

  // PDAs/FDAs live in `createdPdas` (keyed by document number) but are persisted onto
  // their parent operation, grouped by opId. updateCreatedPdas() applies a change and
  // writes the affected op's pdas/fdas arrays through updOp (which saves to Supabase).
  const pdasRef = useRef(createdPdas);
  useEffect(() => { pdasRef.current = createdPdas; }, [createdPdas]);
  const updateCreatedPdas = (updater) => {
    const prev = pdasRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    pdasRef.current = next;
    setCreatedPdas(next);
    const affected = new Set();
    new Set([...Object.keys(prev), ...Object.keys(next)]).forEach(k => { if (prev[k] !== next[k]) { const oid = (next[k] || prev[k])?.opId; if (oid) affected.add(oid); } });
    affected.forEach(opId => {
      const docs = Object.values(next).filter(d => d && d.opId === opId);
      const pdas = docs.filter(d => !d.isFda), fdas = docs.filter(d => d.isFda);
      updOp && updOp(opId, { pdas, fdas, pdaCount: pdas.length, fdaCount: fdas.length });
      // keep the open op detail (a local copy) in sync so tab counts refresh immediately
      setSelectedOp(cur => cur && cur.id === opId ? { ...cur, pdas, fdas, pdaCount: pdas.length, fdaCount: fdas.length } : cur);
    });
  };
  // Hydrate PDAs/FDAs + voyage plans from persisted operations once they load from the DB.
  useEffect(() => {
    if (!allOps) return;
    setCreatedPdas(prev => {
      let changed = false; const m = { ...prev };
      allOps.forEach(o => [...(o.pdas || []), ...(o.fdas || [])].forEach(d => { const key = d && (d.isFda ? d.fdaNumber : d.number); if (key && !m[key]) { m[key] = d; changed = true; } }));
      return changed ? m : prev;
    });
    setVoyagePlans(prev => {
      let changed = false; const m = { ...prev };
      allOps.forEach(o => { if (Array.isArray(o.voyage) && o.voyage.length && !m[o.id]) { m[o.id] = o.voyage; changed = true; } });
      return changed ? m : prev;
    });
  }, [allOps]);

  const handleAddVessel = () => {
    const nm = (newVessel.name || "").trim();
    if (!nm) { alert("Enter a vessel name."); return; }
    const created = addYacht && addYacht({ name: nm.toUpperCase(), type: newVessel.type || "Motor", flag: newVessel.flag || "", imo: newVessel.imo ? formatIMO(newVessel.imo) : "", category: "Pleasure", status: "Inactive", forSale: false, prevNames: [] });
    if (created) {
      const owner = (owners || []).find(o => o.id === created.ownerId);
      setForm(f => ({ ...f, yachtId: created.id, vesselName: created.name, vesselLoa: created.loa || "", vesselGt: created.gt || "", vesselFlag: created.flag || "", vesselImo: created.imo || "", clientName: owner?.name || f.clientName, clientEmail: owner?.email || f.clientEmail }));
    }
    setNewVessel({ name: "", type: "Motor", flag: "", imo: "" });
    setShowAddVessel(false);
  };
  const handleYachtSelect = (yId) => {
    const y = yachts.find(x => x.id === yId);
    if (y) {
      const owner = (owners || []).find(o => o.id === y.ownerId);
      setForm(f => ({ ...f, yachtId: yId, vesselName: y.name, vesselLoa: y.loa, vesselGt: y.gt, vesselFlag: y.flag, vesselImo: y.imo || "", clientName: owner?.name || f.clientName, clientEmail: owner?.email || f.clientEmail }));
    } else {
      setForm(f => ({ ...f, yachtId: "", vesselName: "", vesselLoa: "", vesselGt: "", vesselFlag: "", vesselImo: "" }));
    }
  };

  const handlePortToggle = (code) => {
    setForm(f => ({ ...f, ports: f.ports.includes(code) ? f.ports.filter(p => p !== code) : [...f.ports, code] }));
  };
  // Patch the open operation — persists via updOp AND keeps the selectedOp snapshot in sync.
  const patchOp = (changes) => { if (!selectedOp) return; updOp && updOp(selectedOp.id, changes); setSelectedOp(o => o ? { ...o, ...changes } : o); };
  // Vessel facts edited on the operation reciprocate to the Yacht Directory record.
  const patchVessel = (opChanges, yachtChanges) => { patchOp(opChanges); if (selectedOp?.yachtId && updYacht) updYacht(selectedOp.yachtId, yachtChanges); };

  const entCode = activeEntity === "German Agency" ? "GRA" : activeEntity === "Cruising Agency" ? "CRA" : "FMA";
  // The op number follows the agency CHOSEN IN THE FORM (defaulting to the top-bar
  // selection), so the stored entity and the FMA/GRA/CRA prefix can never disagree.
  const formEntity = form.entity || activeEntity || "Felix Maritime Agency";
  const formEntCode = formEntity === "German Agency" ? "GRA" : formEntity === "Cruising Agency" ? "CRA" : "FMA";
  const nextOpNum = `${formEntCode}-OPS-2026-${String(ops.length + 39).padStart(4, "0")}`;
  const canCreate = isEnquiry ? (form.ports.length > 0 && (form.vesselLoa || form.vesselGt)) : (form.vesselName && form.clientName && form.ports.length > 0);

  const handleCreate = () => {
    if (!canCreate) return;
    const status = isEnquiry ? "Enquiry" : "Upcoming";
    const newOp = {
      id: `op${Date.now()}`, opNumber: nextOpNum, status, entity: formEntity, vesselName: form.vesselName || "Vessel TBC", yachtId: form.yachtId || null,
      clientName: form.clientName || "Client TBC", clientEmail: form.clientEmail, vesselLoa: Number(form.vesselLoa) || null, vesselGt: Number(form.vesselGt) || null,
      vesselFlag: form.vesselFlag || "TBC", ports: form.ports, eta: form.eta || null, etd: form.etd || null, lastPort: form.lastPort || null, nextPort: form.nextPort || null,
      // Private vs commercial-charter (audit B04): per-op override, else derived from the vessel's charterable flag. VAT rules read this, not flag alone (B13).
      charterStatus: form.charterStatus !== "Auto (from vessel)" ? form.charterStatus : (yachts.find(x => x.id === form.yachtId)?.charterable ? "Commercial charter" : "Private"),
      baseCurrency: form.baseCurrency, staffId: (STAFF.find(s => s.name === form.leadName)?.id) || user?.id || form.staffId, created: "2026-05-18", notes: form.notes,
      // Team (Lead + supports): several people usually share one yacht — everyone
      // on the team sees this op under "My operations".
      team: (() => {
        const leadId = (STAFF.find(s => s.name === form.leadName)?.id) || user?.id || form.staffId;
        const supports = (form.supportNames || "").split(",").map(t => t.trim()).filter(Boolean)
          .map(n => STAFF.find(s => s.name === n)?.id).filter(id => id && id !== leadId);
        return [{ staffId: leadId, role: "Lead" }, ...supports.map(id => ({ staffId: id, role: "Support" }))];
      })(),
      timestamps: { enquiryReceived: new Date().toISOString(), ...(status === "Upcoming" ? { confirmed: new Date().toISOString() } : {}) },
      serviceCount: 0, pdaCount: 0, fdaCount: 0, totalRevenue: 0, totalCost: 0,
      emails: pendingEmail ? [pendingEmail] : [],   // the enquiry email that started this op, if created from one
    };
    addOp(newOp);
    // Keep the vessel profile in sync: if a linked vessel's facts (flag/LOA/GT/IMO) were
    // refined in the manual-entry fields, write them back to the Yacht Directory so the
    // op and the profile never disagree.
    if (form.yachtId && updYacht) {
      const y = yachts.find(x => x.id === form.yachtId);
      if (y) {
        const sync = {};
        if (form.vesselFlag && form.vesselFlag !== "TBC" && form.vesselFlag !== y.flag) sync.flag = form.vesselFlag;
        if (Number(form.vesselLoa) && Number(form.vesselLoa) !== Number(y.loa)) sync.loa = Number(form.vesselLoa);
        if (Number(form.vesselGt) && Number(form.vesselGt) !== Number(y.gt)) sync.gt = Number(form.vesselGt);
        if (form.vesselImo && formatIMO(form.vesselImo) !== (y.imo || "")) sync.imo = formatIMO(form.vesselImo);
        if (Object.keys(sync).length) updYacht(form.yachtId, sync);
      }
    }
    setForm(emptyForm);
    setShowCreate(false);
    setPendingEmail(null);
    setSelectedOp(newOp);
    setActiveTab("timeline");
  };

  // "Create from email": parse the pasted enquiry, prefill the create form, and
  // keep the original message to attach to the operation on save.
  const startFromEmail = () => {
    if (!emailRaw.trim()) return;
    const p = parseEmailEnquiry(emailRaw);
    setPendingEmail({ id: `em${Date.now()}`, dir: "in", stage: "Enquiry", from: p.from || "—", subject: p.subject || emailRaw.trim().split("\n")[0].slice(0, 90), body: emailRaw.trim(), date: new Date().toISOString().slice(0, 16).replace("T", " ") });
    setForm(f => ({ ...f, opType: "enquiry",
      vesselName: p.vessel || f.vesselName, clientName: p.clientName || f.clientName, clientEmail: p.from || f.clientEmail,
      vesselLoa: p.loa || f.vesselLoa, vesselGt: p.gt || f.vesselGt, ports: p.ports.length ? p.ports : f.ports, eta: p.eta || f.eta,
      notes: [p.services.length ? `Requested services (from email): ${p.services.join(", ")}` : "", f.notes].filter(Boolean).join("\n") }));
    setEmailImport(false); setEmailRaw(""); setShowCreate(true);
  };

  const goToPdaBuilder = () => { setActiveTab("pda"); setSelectedPda(null); setEditPdaItems(null); setShowPdaBuilder(true); setPdaCart([]); };

  const FX_RATE = 50.85;
  const SVC_MASTER = [
    { code: "SVC-01", name: "Transit", field: "transit" }, { code: "SVC-02", name: "Embarking", field: "embarking" },
    { code: "SVC-03", name: "Disembarking", field: "disembarking" }, { code: "SVC-04", name: "Bunkering Supply", field: "bunkering_supply" },
    { code: "SVC-05", name: "Provision Supply", field: "provision_supply" }, { code: "SVC-06", name: "Land Trips", field: "land_trips" },
    { code: "SVC-07", name: "Spare Parts", field: "spare_parts" }, { code: "SVC-08", name: "Dry Dock", field: "dry_dock" },
    { code: "SVC-09", name: "Sludge Discharge", field: "sludge_discharge" }, { code: "SVC-10", name: "Fresh Water", field: "fresh_water" },
    { code: "SVC-11", name: "Oil", field: "oil" }, { code: "SVC-12", name: "Garbage Discharge", field: "garbage_discharge" },
    { code: "SVC-13", name: "Shipment Clearance", field: "shipment_clearance" }, { code: "SVC-14", name: "Cash To Master", field: "cash_to_master" },
    { code: "SVC-15", name: "Cruising Permits", field: "cruising_permits" }, { code: "SVC-16", name: "Yacht Chartering", field: "yacht_chartering" },
    { code: "SVC-17", name: "Customs Clearance", field: "customs_clearance" }, { code: "SVC-18", name: "Port Call", field: "port_call" },
    { code: "SVC-19", name: "Certificate Issuing", field: "certificate_issuing" }, { code: "SVC-20", name: "Meet & Assist", field: "meet_assist" },
    { code: "SVC-21", name: "Berthing", field: "berthing" }, { code: "SVC-22", name: "Diving Activities", field: "diving_activities" },
    { code: "SVC-23", name: "Visa", field: "visa" }, { code: "SVC-24", name: "Agency Fee", field: "agency_fee" },
  ];

  const SERVICE_CATALOG = {
    // UNDER 300 GT
    "nb_under300_base": { label: "N.B. under 300 GT — base transit", color: "#0070F2", gtClass: "under300", items: [
      { svc: "SVC-01", name: "Port clearance — same day transit", unit: "Per transit", qty: 1, price: 60, vat: 0, note: "Weekday $60 / Weekend $180" },
      { svc: "SVC-01", name: "Marine inspection", unit: "Per vessel", qty: 1, price: 10, vat: 0 },
      { svc: "SVC-01", name: "Canal transit dues", unit: "Per GT", qty: 0, price: 6.50, vat: 0, note: "Qty = vessel GT, rate = ~$6.50 (SDR)" },
    ]},
    "nb_under300_visa": { label: "N.B. under 300 GT — visa block", color: "#E24B4A", gtClass: "under300", cond: "People leaving vessel", items: [
      { svc: "SVC-23", name: "Sea visa stamp / barcode", unit: "Per person", qty: 0, price: 30, vat: 0, note: "Qty = persons leaving vessel" },
      { svc: "SVC-23", name: "Immigration check-in", unit: "Per operation", qty: 1, price: Math.round(2000 / FX_RATE * 100) / 100, vat: 0, note: "EGP 2,000" },
      { svc: "SVC-23", name: "Immigration check-out", unit: "Per operation", qty: 1, price: Math.round(2000 / FX_RATE * 100) / 100, vat: 0, note: "EGP 2,000" },
      { svc: "SVC-23", name: "NS clearance — check-in", unit: "Per operation", qty: 1, price: Math.round(1220 / FX_RATE * 100) / 100, vat: 0, note: "EGP 1,220" },
      { svc: "SVC-23", name: "NS clearance — check-out", unit: "Per operation", qty: 1, price: Math.round(1220 / FX_RATE * 100) / 100, vat: 0, note: "EGP 1,220" },
      { svc: "SVC-23", name: "Quarantine", unit: "Per vessel", qty: 1, price: 10, vat: 0 },
    ]},
    "nb_under300_embark": { label: "N.B. under 300 GT — embarking", color: "#E9730C", gtClass: "under300", cond: "Crew embarking", items: [
      { svc: "SVC-02", name: "Immigration — embarking", unit: "Per operation", qty: 1, price: Math.round(2000 / FX_RATE * 100) / 100, vat: 0, note: "EGP 2,000" },
      { svc: "SVC-02", name: "NS clearance — embarking", unit: "Per operation", qty: 1, price: Math.round(1220 / FX_RATE * 100) / 100, vat: 0, note: "EGP 1,220" },
    ]},
    "nb_under300_disembark": { label: "N.B. under 300 GT — disembarking", color: "#E9730C", gtClass: "under300", cond: "Crew disembarking", items: [
      { svc: "SVC-03", name: "Immigration — disembarking", unit: "Per operation", qty: 1, price: Math.round(2000 / FX_RATE * 100) / 100, vat: 0, note: "EGP 2,000" },
      { svc: "SVC-03", name: "NS clearance — disembarking", unit: "Per operation", qty: 1, price: Math.round(1220 / FX_RATE * 100) / 100, vat: 0, note: "EGP 1,220" },
    ]},
    "sb_under300_base": { label: "S.B. under 300 GT — base transit", color: "#0070F2", gtClass: "under300", items: [
      { svc: "SVC-01", name: "Marine inspection", unit: "Per vessel", qty: 1, price: 10, vat: 0 },
      { svc: "SVC-01", name: "Canal transit dues", unit: "Per GT", qty: 0, price: 6.50, vat: 0, note: "Qty = vessel GT" },
    ]},
    "sb_under300_visa": { label: "S.B. under 300 GT — visa block", color: "#E24B4A", gtClass: "under300", cond: "People leaving vessel", items: [
      { svc: "SVC-23", name: "Sea visa stamp / barcode", unit: "Per person", qty: 0, price: 30, vat: 0, note: "Qty = persons leaving vessel" },
      { svc: "SVC-23", name: "Immigration check-in", unit: "Per operation", qty: 1, price: Math.round(2000 / FX_RATE * 100) / 100, vat: 0, note: "EGP 2,000" },
      { svc: "SVC-23", name: "Immigration check-out", unit: "Per operation", qty: 1, price: Math.round(2000 / FX_RATE * 100) / 100, vat: 0, note: "EGP 2,000" },
      { svc: "SVC-23", name: "NS clearance — check-in", unit: "Per operation", qty: 1, price: Math.round(1220 / FX_RATE * 100) / 100, vat: 0, note: "EGP 1,220" },
      { svc: "SVC-23", name: "NS clearance — check-out", unit: "Per operation", qty: 1, price: Math.round(1220 / FX_RATE * 100) / 100, vat: 0, note: "EGP 1,220" },
      { svc: "SVC-23", name: "Quarantine", unit: "Per vessel", qty: 1, price: 10, vat: 0 },
    ]},
    "sb_under300_embark": { label: "S.B. under 300 GT — embarking", color: "#E9730C", gtClass: "under300", cond: "Crew embarking", items: [
      { svc: "SVC-02", name: "Immigration — embarking", unit: "Per operation", qty: 1, price: Math.round(2000 / FX_RATE * 100) / 100, vat: 0, note: "EGP 2,000" },
      { svc: "SVC-02", name: "NS clearance — embarking", unit: "Per operation", qty: 1, price: Math.round(1220 / FX_RATE * 100) / 100, vat: 0, note: "EGP 1,220" },
    ]},
    "sb_under300_disembark": { label: "S.B. under 300 GT — disembarking", color: "#E9730C", gtClass: "under300", cond: "Crew disembarking", items: [
      { svc: "SVC-03", name: "Immigration — disembarking", unit: "Per operation", qty: 1, price: Math.round(2000 / FX_RATE * 100) / 100, vat: 0, note: "EGP 2,000" },
      { svc: "SVC-03", name: "NS clearance — disembarking", unit: "Per operation", qty: 1, price: Math.round(1220 / FX_RATE * 100) / 100, vat: 0, note: "EGP 1,220" },
    ]},
    // ABOVE 300 GT
    "sb_above300_transit": { label: "S.B. above 300 GT — full transit", color: "#1B4F72", gtClass: "above300", items: [
      { svc: "SVC-01", name: "Suez Canal transit dues", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
      { svc: "SVC-01", name: "Canal Mooring & Lights Company", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
      { svc: "SVC-01", name: "Sea trial", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
      { svc: "SVC-01", name: "Port disbursement", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC — S.B. only" },
      { svc: "SVC-01", name: "SCT pilotage", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
      { svc: "SVC-01", name: "Environmental fees", unit: "Per CBM", qty: 0, price: 0, vat: 0, note: "Rate TBC — Qty = vessel CBM" },
      { svc: "SVC-01", name: "Electronic Transit Request (ETR)", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
    ]},
    "nb_above300_transit": { label: "N.B. above 300 GT — full transit", color: "#1B4F72", gtClass: "above300", items: [
      { svc: "SVC-01", name: "Suez Canal transit dues", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
      { svc: "SVC-01", name: "Canal Mooring & Lights Company", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
      { svc: "SVC-01", name: "Sea trial", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
      { svc: "SVC-01", name: "Port clearance", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC — N.B. only" },
      { svc: "SVC-01", name: "SCT pilotage", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
      { svc: "SVC-01", name: "Environmental fees", unit: "Per CBM", qty: 0, price: 0, vat: 0, note: "Rate TBC — Qty = vessel CBM" },
      { svc: "SVC-01", name: "Electronic Transit Request (ETR)", unit: "Per transit", qty: 1, price: 0, vat: 0, note: "Rate TBC" },
    ]},
  };
  const INDIVIDUAL_SERVICES = [
    { cat: "Agency", items: [
      { svc: "SVC-24", name: "Agency fee", unit: "Per operation", qty: 1, price: 0, vat: 0, note: "Enter amount manually per operation" },
    ]},
    { cat: "Port & harbour", items: [
      { svc: "SVC-18", name: "Port call", unit: "Per call", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-17", name: "Customs clearance", unit: "Per call", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-21", name: "Berthing", unit: "Per day", qty: 1, price: 0, vat: 0 },
    ]},
    { cat: "Crew services", items: [
      { svc: "SVC-02", name: "Crew change — embark", unit: "Per person", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-03", name: "Crew change — disembark", unit: "Per person", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-20", name: "Meet & assist", unit: "Per person", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-19", name: "Certificate issuing", unit: "Per cert", qty: 1, price: 0, vat: 0 },
    ]},
    { cat: "Supplies & logistics", items: [
      { svc: "SVC-05", name: "Provisions — fresh produce", unit: "Lump sum", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-05", name: "Provisions — beverages", unit: "Lump sum", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-04", name: "Bunker — MGO delivery", unit: "Per litre", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-10", name: "Fresh water", unit: "Per ton", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-07", name: "Spare parts", unit: "Lump sum", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-11", name: "Oil / lubricants", unit: "Lump sum", qty: 1, price: 0, vat: 0 },
    ]},
    { cat: "Waste & discharge", items: [
      { svc: "SVC-09", name: "Sludge discharge", unit: "Per operation", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-12", name: "Garbage discharge", unit: "Per operation", qty: 1, price: 0, vat: 0 },
    ]},
    { cat: "Transport & general", items: [
      { svc: "SVC-06", name: "Land trip / airport transfer", unit: "Per trip", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-13", name: "Shipment clearance", unit: "Per shipment", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-14", name: "Cash to master", unit: "Lump sum", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-15", name: "Cruising permits", unit: "Per permit", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-22", name: "Diving activities", unit: "Per event", qty: 1, price: 0, vat: 0 },
      { svc: "SVC-16", name: "Yacht chartering", unit: "Per charter", qty: 1, price: 0, vat: 0 },
    ]},
  ];

  const [pdaCart, setPdaCart] = useState([]);
  const [catalogDir, setCatalogDir] = useState("nb");
  const [catalogSearch, setCatalogSearch] = useState("");

  const addPackageToCart = (pkgKey) => {
    const pkg = SERVICE_CATALOG[pkgKey];
    if (!pkg) return;
    const _ty = yachts.find(yy => yy.id === selectedOp?.yachtId);
    const gt = (_ty && tonnageOf(_ty)) || Number(selectedOp?.vesselGt) || 0;
    const newItems = pkg.items.map(i => ({ ...i, qty: i.name.includes("Canal transit dues") ? (gt || 1) : (i.qty || 1), _pkg: pkgKey }));
    if (sub300Pkg && sub300AddRef.current) { newItems.forEach(i => sub300AddRef.current(i)); return; }   // builder open → items join it
    setPdaCart(prev => [...prev, ...newItems]);
  };
  const addItemToCart = (item) => {
    if (sub300Pkg && sub300AddRef.current) { sub300AddRef.current(item); return; }   // builder open → item joins it
    setPdaCart(prev => [...prev, { ...item }]);
  };
  const removeFromCart = (idx) => setPdaCart(prev => prev.filter((_, i) => i !== idx));
  const updateCartItem = (idx, key, val) => setPdaCart(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));

  // PDA/FDA numbers inherit the agency from the OPERATION NUMBER prefix (CRA-... → CRA),
  // falling back to the stored entity name — the document can never carry another agency's letterhead.
  const opAgencyCode = (o) => { const pfx = (o?.opNumber || "").split("-")[0]; return ["FMA", "GRA", "CRA"].includes(pfx) ? pfx : (o?.entity === "German Agency" ? "GRA" : o?.entity === "Cruising Agency" ? "CRA" : "FMA"); };
  const savePdaFromCart = () => {
    if (!selectedOp || pdaCart.length === 0) return;
    const entity = opAgencyCode(selectedOp);
    const month = "05";
    const existing = Object.keys(createdPdas).filter(k => k.startsWith(`${entity}-Q-2026-${month}`)).length + 1;
    const pdaNum = `${entity}-Q-2026-${month}-${String(existing).padStart(4, "0")}`;
    const staff = STAFF.find(s => s.id === selectedOp.staffId);
    const newPda = {
      number: pdaNum, opId: selectedOp.id, type: existing === 1 ? "PDA" : "Revised", status: "Draft", date: "2026-05-19", validDays: 14, validUntil: "2026-06-02",
      currency: selectedOp.baseCurrency || "USD", revision: existing - 1, entity,
      client: selectedOp.clientName || "Client TBC", clientEmail: selectedOp.clientEmail || "", billingAddress: "",
      staff: staff?.name || "—", staffTitle: "Operations Manager",
      items: pdaCart.map((it, i) => ({ n: (i + 1) * 10, svc: it.svc || "", ...it })),
    };
    updateCreatedPdas(prev => ({ ...prev, [pdaNum]: newPda }));
    setShowPdaBuilder(false);
    setSelectedPda(pdaNum);
    setEditPdaItems(null);
    setPdaCart([]);
  };

  // Save from the hierarchical sub-300 builder: same numbering/persistence pipeline as
  // the cart, plus sub300 flag (drives the T&C block on the document).
  const saveSub300Pda = (lines, payTerms, rates = {}) => {
    if (!selectedOp || !lines.length) return;
    const entity = opAgencyCode(selectedOp);
    const month = "05";
    const existing = Object.keys(createdPdas).filter(k => k.startsWith(`${entity}-Q-2026-${month}`)).length + 1;
    const pdaNum = `${entity}-Q-2026-${month}-${String(existing).padStart(4, "0")}`;
    const staff = STAFF.find(s => s.id === selectedOp.staffId);
    const newPda = {
      number: pdaNum, opId: selectedOp.id, type: existing === 1 ? "PDA" : "Revised", status: "Draft", date: "2026-05-19", validDays: 14, validUntil: "2026-06-02",
      currency: selectedOp.baseCurrency || "USD", revision: existing - 1, entity, sub300: true,
      paymentTerms: payTerms || PAYMENT_TERMS[0],
      pkgLabel: SC_SUB300_PACKAGES[sub300Pkg]?.label || "SC transit — under 300 Tons",
      client: selectedOp.clientName || "Client TBC", clientEmail: selectedOp.clientEmail || "", billingAddress: "",
      staff: staff?.name || "—", staffTitle: "Operations Manager",
      items: lines,
      // Audit B05: rate context + computed total stored on the document itself.
      sdrRate: rates.sdrRate ?? null, egpRate: rates.egpRate ?? null, scnt: rates.scnt ?? null,
      total: Math.round(lines.reduce((a, l) => a + (Number(l.amount) || 0) * (1 + (Number(l.vat) || 0) / 100), 0) * 100) / 100,
    };
    updateCreatedPdas(prev => ({ ...prev, [pdaNum]: newPda }));
    setShowPdaBuilder(false); setSub300Pkg(null);
    setSelectedPda(pdaNum); setEditPdaItems(null); setPdaCart([]);
  };

  const changePdaStatus = (pdaKey, newStatus, extra = {}) => {
    const updatePda = (prev) => {
      const pda = prev[pdaKey];
      if (!pda) return prev;
      return { ...prev, [pdaKey]: { ...pda, status: newStatus, ...extra, [`${newStatus.toLowerCase()}At`]: "2026-05-18 14:30" } };
    };
    updateCreatedPdas(updatePda);
  };

  const handleSendPda = (pdaKey) => changePdaStatus(pdaKey, "Sent", { sentAt: "2026-05-18 14:30" });
  const handleAcceptPda = (pdaKey) => changePdaStatus(pdaKey, "Accepted", { acceptedAt: "2026-05-18 14:30" });
  const handleDeclinePda = (pdaKey, reason) => changePdaStatus(pdaKey, "Declined", { declinedAt: "2026-05-18 14:30", declineReason: reason || "Not specified" });

  const handleRevisePda = (pdaKey) => {
    const src = createdPdas[pdaKey] || PDA_ITEMS[pdaKey];
    if (!src || !selectedOp) return;
    const rev = (src.revision || 0) + 1;
    const newNum = `${src.number.split("-R")[0]}-R${rev}`;
    const newPda = { ...src, number: newNum, opId: src.opId || selectedOp.id, status: "Draft", revision: rev, date: "2026-05-18", items: src.items.map(i => ({ ...i })) };
    updateCreatedPdas(prev => ({ ...prev, [newNum]: newPda }));
    setSelectedPda(newNum);
    setEditPdaItems(null);
  };

  const handleSupplementaryPda = (pdaKey) => {
    const src = createdPdas[pdaKey] || PDA_ITEMS[pdaKey];
    if (!src || !selectedOp) return;
    const base = src.number.split("-S")[0].split("-R")[0];
    const sCount = Object.keys(createdPdas).filter(k => k.startsWith(base + "-S")).length + 1;
    const newNum = `${base}-S${sCount}`;
    const newPda = { ...src, number: newNum, opId: src.opId || selectedOp.id, type: "Supplementary", status: "Draft", date: "2026-05-18", items: [] };
    updateCreatedPdas(prev => ({ ...prev, [newNum]: newPda }));
    setSelectedPda(newNum);
    setEditPdaItems(null);
    setShowPdaBuilder(true);
    setPdaCart([]);
  };

  const handleDeletePda = (pdaKey) => {
    updateCreatedPdas(prev => { const n = { ...prev }; delete n[pdaKey]; return n; });
    setSelectedPda(null);
    setEditPdaItems(null);
  };

  const PDA_ITEMS = {
    "FMA-PDA-2026-0041": {
      number: "FMA-PDA-2026-0041", opId: "op1", type: "PDA", status: "Accepted", date: "2026-05-01", validDays: 14, validUntil: "2026-05-15", currency: "USD", revision: 0,
      client: "Hill Robinson Yacht Management", clientEmail: "ops@hillrobinson.com", billingAddress: "Hill Robinson, 1 London Wall, London EC2Y 5EA, UK",
      staff: "Sarah Ahmed Salaheldin", staffTitle: "Product Manager", staffEmail: "sera@felixmaritime.com", staffPhone: "+20 66 322 4455",
      items: [
        { cat: "Suez Canal transit — southbound" },
        { n: 1, code: "SCS-001", name: "SC transit dues", note: "Slab-based toll: 1,180 GT × SDR rate 1.38 — SCA Circular 2024-03", unit: "per GT", qty: 1, price: 1628.40, vat: 0 },
        { n: 2, code: "SCS-002", name: "Mooring — Port Said", note: "GT tier: 900–1,500 GT bracket — $420 per SCA tariff", unit: "per call", qty: 1, price: 420, vat: 0 },
        { n: 3, code: "SCS-003", name: "Pilotage", note: "GT bracket: 900–1,500 GT — $680 per SCA tariff", unit: "per call", qty: 1, price: 680, vat: 0 },
        { n: 4, code: "SCS-004", name: "ETR (transit readiness)", note: "GT > 300 — flat $200 per SCA Circular 2024-03", unit: "per call", qty: 1, price: 200, vat: 0 },
        { n: 5, code: "SCS-005", name: "Environmental fee", note: "GT > 300 — flat $85/CBM per SCA Circular 2024-03", unit: "per call", qty: 1, price: 85, vat: 0 },
        { n: 6, code: "SCS-006", name: "National security", unit: "per call", qty: 1, price: 150, vat: 0 },
        { n: 7, code: "SCS-007", name: "Port clearance", note: "LOA tier: 50–75m bracket — $280", unit: "per call", qty: 1, price: 280, vat: 0 },
        { n: 8, code: "SCS-008", name: "Immigration", note: "Per person × 18 crew = 18 persons", unit: "per person", qty: 18, price: 50, vat: 0 },
        { cat: "Port & harbour" },
        { n: 9, code: "PRT-001", name: "Port dues — Hurghada", unit: "per call", qty: 1, price: 850, vat: 0 },
        { n: 10, code: "PRT-003", name: "Berth hire — Soma Bay Marina", unit: "per day", qty: 10, price: 120, vat: 0 },
        { cat: "Clearance & formalities" },
        { n: 11, code: "CLR-001", name: "Customs clearance — Hurghada", unit: "per call", qty: 1, price: 200, vat: 0 },
        { cat: "Crew services" },
        { n: 12, code: "CRW-001", name: "Crew change — embark Chief Officer", unit: "per person", qty: 1, price: 380, vat: 0 },
        { n: 13, code: "CRW-002", name: "Crew change — disembark 2nd Engineer", unit: "per person", qty: 1, price: 320, vat: 0 },
        { cat: "Supplies & logistics" },
        { n: 14, code: "SUP-003", name: "Provisions — fresh produce & dry stores", note: "Lump sum estimate — final per delivered quantities", unit: "lump sum", qty: 1, price: 4200, vat: 0 },
        { n: 15, code: "SUP-010", name: "Provisions — beverages & wine restock", unit: "lump sum", qty: 1, price: 3500, vat: 0 },
        { cat: "Agency & transport" },
        { n: 16, code: "AGT-001", name: "Agency fee — full handling (Red Sea program)", unit: "per call", qty: 1, price: 1500, vat: 0 },
        { n: 17, code: "TRN-001", name: "Airport transfer — HRG VIP arrival (6 pax)", unit: "per trip", qty: 1, price: 350, vat: 0 },
      ],
    },
    "FMA-PDA-2026-0041-R1": {
      number: "FMA-PDA-2026-0041-R1", type: "Revised", status: "Accepted", date: "2026-05-14", validDays: 14, validUntil: "2026-05-28", currency: "USD", revision: 1,
      client: "Hill Robinson Yacht Management", clientEmail: "ops@hillrobinson.com", billingAddress: "Hill Robinson, 1 London Wall, London EC2Y 5EA, UK",
      staff: "Sarah Ahmed Salaheldin", staffTitle: "Product Manager",
      items: [
        { cat: "Additional crew services" },
        { n: 1, code: "CRW-003", name: "Crew change — embark Chef", unit: "per person", qty: 1, price: 350, vat: 0 },
        { cat: "Additional supplies" },
        { n: 2, code: "SUP-010", name: "Provisions — beverages (revised upward)", note: "Client requested expanded wine list — revised from $3,500", unit: "lump sum", qty: 1, price: 6700, vat: 0 },
        { cat: "Agency" },
        { n: 3, code: "AGT-005", name: "Out-of-hours attendance", unit: "per call", qty: 1, price: 250, vat: 0 },
      ],
    },
  };
  const all = ["All", ...OP_STATUSES];
  const isMgmt = ["Product Manager", "Admin", "Management"].includes(user?.role);
  const officeOf = (op) => STAFF.find(s => s.id === op.staffId)?.office || "HQ";
  const visibleOps = isMgmt ? ops : ops.filter(o => onTeam(o, user?.id) || officeOf(o) === user?.office);
  const [mineOnly, setMineOnly] = useState(false);
  const myOpsCount = visibleOps.filter(o => onTeam(o, user?.id)).length;
  const filtered = visibleOps.filter(o => (filter.includes("All") || filter.includes(o.status)) && (!mineOnly || onTeam(o, user?.id)));
  const toggle = f => { if (f === "All") return setFilter(["All"]); const n = filter.filter(s => s !== "All"); setFilter(n.includes(f) ? (n.length === 1 ? ["All"] : n.filter(s => s !== f)) : [...n, f]); };

  const SERVICE_LOG = {
    op1: [
      { code: "SCS-GRP", name: "SC transit — southbound (group)", status: "Completed", amount: 4200, source: "PDA", effort: 120 },
      { code: "PRT-001", name: "Port dues — Hurghada", status: "Completed", amount: 850, source: "PDA", effort: 30 },
      { code: "PRT-003", name: "Berth hire — Soma Bay Marina", status: "In Progress", amount: 1200, source: "PDA", effort: 15 },
      { code: "CRW-001", name: "Crew change — embark J. Santos (Chief Officer)", status: "In Progress", amount: 380, source: "PDA", effort: 90 },
      { code: "CRW-002", name: "Crew change — disembark R. Chen (2nd Engineer)", status: "In Progress", amount: 320, source: "PDA", effort: 90 },
      { code: "CRW-003", name: "Crew change — embark M. Dubois (Chef)", status: "Pending", amount: 350, source: "PDA", effort: 0 },
      { code: "SUP-003", name: "Provision — fresh produce & dry stores", status: "In Progress", amount: 4200, source: "PDA", effort: 60 },
      { code: "SUP-010", name: "Provision — beverages & wine restock", status: "Pending", amount: 6700, source: "PDA", effort: 0 },
      { code: "AGT-001", name: "Agency fee — full handling", status: "Pending", amount: 1500, source: "PDA", effort: 0 },
      { code: "AGT-005", name: "Out-of-hours attendance", status: "Completed", amount: 250, source: "Unplanned", effort: 45 },
      { code: "TRN-001", name: "Airport transfer — guest VIP arrival (6 pax)", status: "Pending", amount: 350, source: "PDA", effort: 0 },
      { code: "CLR-001", name: "Customs clearance — Hurghada", status: "Completed", amount: 200, source: "PDA", effort: 60 },
    ],
    op2: [
      { code: "SCS-GRP", name: "SC transit — southbound (group)", status: "In Progress", amount: 3800, source: "PDA", effort: 90 },
      { code: "SUP-001", name: "Bunker — MGO 15,000L (Ismailia)", status: "In Progress", amount: 12500, source: "PDA", effort: 30 },
      { code: "AGT-001", name: "Agency fee — transit handling", status: "Pending", amount: 800, source: "PDA", effort: 0 },
    ],
  };

  const LIFECYCLE = ["Enquiry", "Upcoming", "Active", "Completed", "Closed"];
  const tsKeys = { Enquiry: "enquiryReceived", Upcoming: "confirmed", Active: "activated", Completed: "completed", Closed: "closed" };

  // Object Page Detail View
  if (selectedOp) {
    const op = selectedOp;
    const yacht = yachts.find(y => y.id === op.yachtId);
    const staff = STAFF.find(s => s.id === op.staffId);
    const services = SERVICE_LOG[op.id] || [];
    const crewChanges = CREW_CHANGES.filter(c => c.opId === op.id);
    const opTransits = TRANSITS.filter(t => t.opId === op.id);
    const opLogistics = LOGISTICS.filter(l => l.opId === op.id);
    const activeIdx = LIFECYCLE.indexOf(op.status);
    const isLost = op.status === "Lost";
    const pdaTotal = op.status !== "Enquiry" ? Math.round(op.totalRevenue * 0.88) : 0;
    const variance = op.totalRevenue > 0 && pdaTotal > 0 ? Math.round((op.totalRevenue - pdaTotal) / pdaTotal * 100) : 0;
    const margin = op.totalRevenue > 0 ? Math.round((op.totalRevenue - op.totalCost) / op.totalRevenue * 100) : 0;
    const totalEffort = services.reduce((a, s) => a + (s.effort || 0), 0);

    const tabs = [
      { key: "timeline", label: "Timeline" },
      { key: "voyage", label: "Voyage" },
      { key: "services", label: `Service log (${services.length})` },
      { key: "pda", label: `PDA (${op.pdaCount})` },
      { key: "fda", label: `FDA (${op.fdaCount})` },
      { key: "crew", label: "Crew & Guests" },
      { key: "emails", label: `Emails (${(op.emails || []).length})` },
      { key: "docs", label: "Documents" },
    ];

    return <>
      <button onClick={() => { setSelectedOp(null); setActiveTab("timeline"); setSelectedPda(null); setEditPdaItems(null); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: S.brand, background: "none", border: "none", cursor: "pointer", marginBottom: 10, padding: 0 }}>
        <ChevronLeft size={14} /> Back to operations list
      </button>

      {/* Object Page Header */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 17, fontWeight: 500 }}>{op.opNumber}</span>
              <Status value={op.status} />
              {isLost && <span style={{ fontSize: 11, color: S.red, background: S.redBg, padding: "2px 8px", borderRadius: 4 }}>{op.lostReason}</span>}
            </div>
            <div style={{ fontSize: 13, color: S.textS }}>{op.vesselName} — {op.clientName}{op.notes ? ` — ${op.notes}` : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {!isLost && op.status !== "Closed" && <>
              <button onClick={goToPdaBuilder} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Plus size={13} /> Create PDA</button>
              <button onClick={() => setActiveTab("fda")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><FileText size={13} /> Create FDA</button>
            </>}
            <button onClick={() => alert("More actions: Close operation, Link operation, Print summary, Export to Excel")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 4, fontSize: 12, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}><MoreHorizontal size={13} /></button>
          </div>
        </div>

        {/* Attribute rows */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: `1px solid ${S.borderL}` }}>
          {[
            ["Vessel", op.vesselName], ["Client", op.clientName],
            ["ETA / ETD", `${op.eta || "—"} — ${op.etd || "—"}`], ["Base currency", op.baseCurrency],
          ].map(([l, v], i) => (
            <div key={i} style={{ padding: "10px 18px", borderRight: i < 3 ? `1px solid ${S.borderL}` : "none" }}>
              <div style={{ fontSize: 11, color: S.textS, marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderBottom: `1px solid ${S.borderL}` }}>
          {[
            ["Flag / LOA / GT", `${op.vesselFlag} · ${op.vesselLoa}m · ${op.vesselGt?.toLocaleString()} GT`],
            ["Ports of call", op.ports?.join(", ")],
            ["Last → Next port", (() => { const portOpts = ["Other / TBC", ...PORTS_EG.map(p => `${p.name} (Egypt)`), ...WORLD_PORTS.filter(p => p !== "Other / TBC"), ...FLAG_COUNTRIES];
              return <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <SearchSelect value={op.lastPort || ""} options={portOpts} placeholder="Last..." width={105} onChange={v => patchOp({ lastPort: v })} />
                <span style={{ color: S.textH }}>→</span>
                <SearchSelect value={op.nextPort || ""} options={portOpts} placeholder="Next..." width={105} onChange={v => patchOp({ nextPort: v })} />
              </span>; })()],
            ["Team", <OpTeamChips key={`team_${op.id}`} op={op} patchOp={patchOp} />],
          ].map(([l, v], i) => (
            <div key={i} style={{ padding: "10px 18px", borderRight: i < 3 ? `1px solid ${S.borderL}` : "none" }}>
              <div style={{ fontSize: 11, color: S.textS, marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", borderBottom: `1px solid ${S.borderL}` }}>
          {[
            ["IMO", <input key={`imo_${op.id}`} defaultValue={yacht?.imo || op.vesselImo || ""} placeholder="Add IMO..." onBlur={e => { const v = formatIMO(e.target.value); if (!v || v === (yacht?.imo || op.vesselImo)) return; patchVessel({ vesselImo: v }, { imo: v }); }} title="Saved on the operation AND the vessel's Yacht Directory profile" style={{ width: "100%", border: "none", borderBottom: `1px dashed ${S.border}`, background: "transparent", fontSize: 13, fontWeight: 500, color: S.text, outline: "none", padding: 0 }} />],
            ["SCGT", <input key={`scgt_${op.id}`} defaultValue={yacht?.scgt || ""} placeholder="Add SCGT..." onBlur={e => { const v = parseFloat(e.target.value); if (!v || v === yacht?.scgt) return; patchVessel({}, { scgt: v }); }} title="Saved to the vessel's Yacht Directory profile" style={{ width: "100%", border: "none", borderBottom: `1px dashed ${S.border}`, background: "transparent", fontSize: 13, fontWeight: 500, color: S.text, outline: "none", padding: 0 }} />],
            ["Services", op.serviceCount], ["PDAs / FDAs", `${op.pdaCount} / ${op.fdaCount}`],
            ["Effort", `${totalEffort} min`],
          ].map(([l, v], i) => (
            <div key={i} style={{ padding: "10px 18px", borderRight: i < 4 ? `1px solid ${S.borderL}` : "none" }}>
              <div style={{ fontSize: 11, color: S.textS, marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: typeof v === "number" ? S.brand : S.text }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${S.border}`, padding: "0 8px" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setSelectedPda(null); setEditPdaItems(null); }} style={{ padding: "10px 16px", fontSize: 12, cursor: "pointer", border: "none", background: "transparent", marginBottom: -1, color: activeTab === t.key ? S.brand : S.textS, fontWeight: activeTab === t.key ? 500 : 400, borderBottom: `2px solid ${activeTab === t.key ? S.brand : "transparent"}` }}>{t.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "16px 18px" }}>

          {/* TIMELINE TAB */}
          {activeTab === "timeline" && <>
            <div style={{ fontSize: 12, color: S.textS, marginBottom: 12 }}>Operation lifecycle — 6-stage status machine (Section 3.2)</div>
            <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
              {(isLost ? ["Enquiry", "Lost"] : LIFECYCLE).map((stage, i, arr) => {
                const ts = op.timestamps?.[tsKeys[stage] || (stage === "Lost" ? "lost" : "")] || null;
                const done = isLost ? (stage === "Lost" ? true : true) : (activeIdx >= i);
                const current = isLost ? stage === "Lost" : LIFECYCLE[activeIdx] === stage;
                const color = isLost && stage === "Lost" ? S.red : done ? S.green : S.border;
                return (
                  <div key={stage} style={{ flex: 1, textAlign: "center", position: "relative", paddingTop: 22 }}>
                    <div style={{ width: current ? 14 : 10, height: current ? 14 : 10, borderRadius: "50%", background: color, position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", border: current ? `2px solid ${S.surface}` : "none", boxShadow: current ? `0 0 0 2px ${color}` : "none" }} />
                    {i < arr.length - 1 && <div style={{ position: "absolute", top: current ? 6 : 4, left: "55%", right: "-45%", height: 2, background: done && (isLost || activeIdx > i) ? S.green : S.borderL }} />}
                    <div style={{ fontSize: 12, fontWeight: current ? 500 : 400, color: done ? (isLost && stage === "Lost" ? S.red : S.green) : S.textS }}>{stage}</div>
                    <div style={{ fontSize: 10, color: S.textH }}>{ts ? new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            {op.totalRevenue > 0 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div style={{ background: S.bg, borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, color: S.textS, marginBottom: 8 }}>Financial summary</div>
                {[["Total revenue (actuals)", `$${op.totalRevenue.toLocaleString()}`],
                  ["Total cost (expenses)", `$${op.totalCost.toLocaleString()}`],
                  ["Gross margin", { val: `$${(op.totalRevenue - op.totalCost).toLocaleString()} (${margin}%)`, color: margin > 20 ? S.green : S.orange }],
                ].map(([l, v], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, borderBottom: i < 2 ? `1px solid ${S.borderL}` : "none" }}>
                    <span style={{ color: S.textS }}>{l}</span>
                    <span style={{ fontWeight: 500, color: typeof v === "object" ? v.color : S.text }}>{typeof v === "object" ? v.val : v}</span>
                  </div>
                ))}
              </div>
              {pdaTotal > 0 && <div style={{ background: S.bg, borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, color: S.textS, marginBottom: 8 }}>PDA vs actuals</div>
                {[["Accepted PDA total", `$${pdaTotal.toLocaleString()}`],
                  ["Current actuals", `$${op.totalRevenue.toLocaleString()}`],
                  ["Variance", { val: `+$${(op.totalRevenue - pdaTotal).toLocaleString()} (+${variance}%)`, color: variance > 15 ? S.red : variance > 5 ? S.orange : S.green }],
                ].map(([l, v], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, borderBottom: i < 2 ? `1px solid ${S.borderL}` : "none" }}>
                    <span style={{ color: S.textS }}>{l}</span>
                    <span style={{ fontWeight: 500, color: typeof v === "object" ? v.color : S.text }}>{typeof v === "object" ? v.val : v}</span>
                  </div>
                ))}
              </div>}
            </div>}

            {/* Alerts */}
            {variance > 10 && <InfoStrip type="warning"><strong>Variance alert:</strong> Actuals exceed accepted PDA by {variance}%. Consider issuing a supplementary PDA ({op.opNumber.replace("OPS", "PDA")}-S1) before generating FDA.</InfoStrip>}
            {op.clientName === "Hill Robinson" && <InfoStrip type="gold"><strong>NDA in effect:</strong> Hill Robinson confidentiality agreement valid until December 2026.</InfoStrip>}
            {isLost && <InfoStrip type="critical"><strong>Operation lost:</strong> {op.lostReason}. Marked lost on {op.lostDate} by {staff?.name?.split(" ")[0]}.</InfoStrip>}
          </>}

          {/* VOYAGE TAB */}
          {activeTab === "voyage" && (
            <VoyageTab op={op} plan={voyagePlans[op.id] || []}
              setPlan={(next) => { const val = typeof next === "function" ? next(voyagePlans[op.id] || []) : next; setVoyagePlans(prev => ({ ...prev, [op.id]: val })); updOp && updOp(op.id, { voyage: val }); }} />
          )}

          {/* SERVICE LOG TAB */}
          {activeTab === "services" && <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Service log — {services.length} entries</span>
              <button onClick={() => alert("Add service: select from SVC catalog, assign vendor, set quantities and rates")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Plus size={12} /> Add service</button>
            </div>
            <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: "#F2F2F2" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: S.textS, fontWeight: 500, fontSize: 11 }}>Code</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: S.textS, fontWeight: 500, fontSize: 11 }}>Service</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: S.textS, fontWeight: 500, fontSize: 11 }}>Source</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: S.textS, fontWeight: 500, fontSize: 11 }}>Effort</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: S.textS, fontWeight: 500, fontSize: 11 }}>Status</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", color: S.textS, fontWeight: 500, fontSize: 11 }}>Amount</th>
                </tr></thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={i}>
                      <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, fontFamily: "monospace", color: S.brand, fontWeight: 500 }}>{s.code}</td>
                      <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, fontWeight: 500 }}>{s.name}</td>
                      <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}` }}>
                        <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: s.source === "PDA" ? S.blueBg : S.orangeBg, color: s.source === "PDA" ? S.blue : S.orange }}>{s.source}</span>
                      </td>
                      <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, color: S.textS }}>{s.effort > 0 ? `${s.effort}m` : "—"}</td>
                      <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}` }}><Status value={s.status} /></td>
                      <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right", fontWeight: 500 }}>${s.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr style={{ background: "#F2F2F2" }}>
                  <td colSpan={3} style={{ padding: "8px 12px", fontWeight: 500, fontSize: 12 }}>Total ({services.length} services)</td>
                  <td style={{ padding: "8px 12px", fontSize: 12, color: S.textS }}>{totalEffort}m</td>
                  <td style={{ padding: "8px 12px" }}></td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 500, fontSize: 13, color: S.navy }}>${services.reduce((a, s) => a + s.amount, 0).toLocaleString()}</td>
                </tr></tfoot>
              </table>
            </div>
          </>}

          {/* PDA TAB */}
          {activeTab === "pda" && <>
            {showPdaBuilder ? <>
              {/* SERVICE CATALOG BUILDER */}
              <button onClick={() => { setShowPdaBuilder(false); setPdaCart([]); setSub300Pkg(null); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: S.brand, background: "none", border: "none", cursor: "pointer", marginBottom: 10, padding: 0 }}><ChevronLeft size={14} /> Cancel</button>
              {sub300Pkg && <Sub300Builder pkg={SC_SUB300_PACKAGES[sub300Pkg]} op={selectedOp} yacht={yachts.find(yy => yy.id === selectedOp?.yachtId)} onSave={saveSub300Pda} onCancel={() => setSub300Pkg(null)} externalAddRef={sub300AddRef} />}
              {sub300Pkg && <div style={{ margin: "10px 0 6px", padding: "6px 12px", background: S.blueBg, borderRadius: 6, fontSize: 11, color: "#0C447C", display: "flex", alignItems: "center", gap: 6 }}><Info size={12} /> The service catalog stays available below — "Add" sends items into the transit builder above, under <strong>Additional services</strong>.</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: sub300Pkg ? 4 : 0 }}>
                {/* Left: Catalog */}
                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}><ClipboardList size={14} /> Service catalog</span>
                  </div>
                  {(Number(selectedOp?.vesselGt) || 0) > 0 && <div style={{ padding: "6px 12px", background: S.blueBg, borderBottom: `1px solid ${S.borderL}`, fontSize: 11, color: "#0C447C", display: "flex", alignItems: "center", gap: 4 }}>
                    <Info size={12} /> Vessel: {selectedOp?.vesselGt} GT ({Number(selectedOp?.vesselGt) < 300 ? "under" : "above"} 300). Showing relevant packages.
                  </div>}
                  <div style={{ padding: "6px 12px", borderBottom: `1px solid ${S.borderL}`, display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: S.textS }}>Direction:</span>
                    {["nb", "sb"].map(d => (
                      <button key={d} onClick={() => setCatalogDir(d)} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${catalogDir === d ? S.brand : S.border}`, background: catalogDir === d ? S.brandL : "transparent", color: catalogDir === d ? S.brand : S.textS }}>{d === "nb" ? "N.B." : "S.B."}</button>
                    ))}
                  </div>
                  <div style={{ padding: "6px 12px", borderBottom: `1px solid ${S.borderL}` }}>
                    <input value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)} placeholder="Search services..." style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 12, background: S.surface, color: S.text, outline: "none" }} />
                  </div>

                  {/* Transit packages */}
                  <div style={{ padding: "5px 12px", background: S.bg, borderBottom: `1px solid ${S.borderL}`, fontSize: 11, fontWeight: 500, color: S.textS, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: S.brand }} /> SC transit packages
                  </div>
                  {(() => {
                    const p = SC_SUB300_PACKAGES[catalogDir];
                    const _ty = yachts.find(yy => yy.id === selectedOp?.yachtId);
                    const gt = (_ty && tonnageOf(_ty)) || Number(selectedOp?.vesselGt) || 0;
                    const disabled = gt >= 300;
                    return <div style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, borderLeft: `3px solid ${disabled ? S.border : S.orange}`, opacity: disabled ? 0.4 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{p.label}</span>
                        {!disabled && <button onClick={() => setSub300Pkg(catalogDir)} style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: "pointer", border: `1px solid ${S.orange}`, background: S.orange, color: "#fff" }}><Plus size={10} /> Open builder</button>}
                      </div>
                      <div style={{ fontSize: 10, color: S.textH, lineHeight: 1.5 }}>{p.groups.map(g => `${g.name} (${g.unit.toLowerCase()})`).join(" · ")}</div>
                    </div>;
                  })()}
                  {Object.entries(SERVICE_CATALOG).filter(([k]) => k.startsWith(catalogDir) && !k.includes("under300")).filter(([, v]) => !catalogSearch || v.label.toLowerCase().includes(catalogSearch.toLowerCase())).map(([key, pkg]) => {
                    const _ty = yachts.find(yy => yy.id === selectedOp?.yachtId);
                    const gt = (_ty && tonnageOf(_ty)) || Number(selectedOp?.vesselGt) || 0;
                    const disabled = gt > 0 && ((pkg.gtClass === "under300" && gt >= 300) || (pkg.gtClass === "above300" && gt < 300));
                    return (
                      <div key={key} style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, borderLeft: `3px solid ${disabled ? S.border : pkg.color}`, opacity: disabled ? 0.4 : 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <div>
                            <span style={{ fontSize: 12, fontWeight: 500 }}>{pkg.label}</span>
                            {pkg.cond && <span style={{ fontSize: 9, marginLeft: 6, padding: "1px 5px", borderRadius: 3, background: `${pkg.color}18`, color: pkg.color, fontWeight: 500 }}>{pkg.cond}</span>}
                          </div>
                          {!disabled && <button onClick={() => addPackageToCart(key)} style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${pkg.color}`, background: "transparent", color: pkg.color }}><Plus size={10} /> Add all</button>}
                        </div>
                        <div style={{ fontSize: 10, color: S.textH, lineHeight: 1.4 }}>{pkg.items.map(i => `${i.svc} ${i.name}`).join(" · ")}</div>
                      </div>
                    );
                  })}

                  {/* Individual services */}
                  {INDIVIDUAL_SERVICES.filter(cat => !catalogSearch || cat.items.some(i => i.name.toLowerCase().includes(catalogSearch.toLowerCase()))).map(cat => (
                    <div key={cat.cat}>
                      <div style={{ padding: "5px 12px", background: S.bg, borderBottom: `1px solid ${S.borderL}`, fontSize: 11, fontWeight: 500, color: S.textS }}>{cat.cat}</div>
                      {cat.items.filter(i => !catalogSearch || i.name.toLowerCase().includes(catalogSearch.toLowerCase())).map(item => (
                        <div key={item.svc + item.name} style={{ padding: "5px 12px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                          <span><span style={{ fontFamily: "monospace", fontSize: 10, color: S.brand, marginRight: 6 }}>{item.svc}</span>{item.name}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: S.textH, fontFamily: "monospace" }}>{item.unit}</span>
                            <button onClick={() => addItemToCart({ ...item })} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><Plus size={10} /> Add</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ padding: "5px 12px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: S.textS }}>
                    <span>Custom item...</span>
                    <button onClick={() => addItemToCart({ svc: "", name: "", unit: "", qty: 1, price: 0, vat: 0, internalNote: "" })} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><Plus size={10} /> Add</button>
                  </div>
                </div>

                {/* Right: PDA Cart */}
                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}><FileText size={14} /> PDA — building</span>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 10, background: S.blueBg, color: S.blue }}>{pdaCart.length} items</span>
                  </div>
                  <div style={{ padding: "6px 12px", background: S.bg, borderBottom: `1px solid ${S.borderL}`, fontSize: 11, color: S.textS }}>
                    {selectedOp?.vesselName || "Vessel"} · {selectedOp?.vesselGt || "—"} GT · {selectedOp?.vesselLoa || "—"}m · {catalogDir === "nb" ? "N.B." : "S.B."}
                  </div>
                  {pdaCart.length === 0 ? (
                    <div style={{ padding: 30, textAlign: "center", color: S.textH, fontSize: 12 }}>
                      <Receipt size={24} color={S.textH} style={{ marginBottom: 6 }} />
                      <div>Select services from the catalog to build your PDA</div>
                    </div>
                  ) : <>
                    {pdaCart.map((item, idx) => (
                      <div key={idx} style={{ padding: "4px 12px", borderBottom: `1px solid ${S.borderL}`, fontSize: 11 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button onClick={() => removeFromCart(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: S.textH, padding: 2, borderRadius: 4, display: "flex" }} onMouseEnter={e => { e.currentTarget.style.color = S.red; }} onMouseLeave={e => { e.currentTarget.style.color = S.textH; }}><Trash2 size={11} /></button>
                          {item.svc && <span style={{ fontFamily: "monospace", fontSize: 9, color: S.brand, background: S.brandL, padding: "1px 4px", borderRadius: 3, flexShrink: 0 }}>{item.svc}</span>}
                          <input value={item.name} onChange={e => updateCartItem(idx, "name", e.target.value)} style={{ flex: 1, border: `1px solid ${S.borderL}`, borderRadius: 3, padding: "2px 4px", fontSize: 11, background: S.surface, color: S.text, outline: "none" }} />
                          <input type="number" value={item.qty} onChange={e => updateCartItem(idx, "qty", Number(e.target.value) || 0)} style={{ width: 32, border: `1px solid ${S.borderL}`, borderRadius: 3, padding: "2px 3px", fontSize: 11, textAlign: "center", background: S.surface, color: S.text, outline: "none" }} />
                          <span style={{ color: S.textH, fontSize: 10 }}>×</span>
                          <input type="number" step="0.01" value={item.price} onChange={e => updateCartItem(idx, "price", Number(e.target.value) || 0)} style={{ width: 52, border: `1px solid ${S.borderL}`, borderRadius: 3, padding: "2px 3px", fontSize: 11, textAlign: "right", background: S.surface, color: S.text, outline: "none" }} />
                          <span style={{ fontWeight: 500, minWidth: 55, textAlign: "right" }}>${(Math.round(item.qty * item.price * 100) / 100).toFixed(2)}</span>
                        </div>
                        <div style={{ marginLeft: 26, marginTop: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                          <input value={item.note || ""} onChange={e => updateCartItem(idx, "note", e.target.value)} placeholder="Client note (shows on PDA/FDA)..." style={{ width: "100%", border: `1px solid ${S.borderL}`, borderRadius: 3, padding: "2px 6px", fontSize: 10, fontStyle: "italic", background: S.surface, color: S.textS, outline: "none" }} />
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Lock size={9} style={{ color: S.orange, flexShrink: 0 }} />
                            <input value={item.internalNote || ""} onChange={e => updateCartItem(idx, "internalNote", e.target.value)} placeholder="Internal note (not sent to client)..." style={{ width: "100%", border: `1px dashed ${S.orange}40`, borderRadius: 3, padding: "2px 6px", fontSize: 10, fontStyle: "italic", background: `${S.orange}08`, color: S.orange, outline: "none" }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div style={{ padding: "10px 12px", borderTop: `1px solid ${S.border}`, background: S.bg }}>
                      {(() => {
                        const sub = pdaCart.reduce((a, i) => a + Math.round(i.qty * i.price * 100) / 100, 0);
                        const discAmt = pdaDiscount.mode === "pct" ? Math.round(sub * pdaDiscount.pct / 100 * 100) / 100 : pdaDiscount.amount;
                        return <>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: 12 }}>
                            <span style={{ color: S.textS }}>Subtotal</span>
                            <span style={{ fontWeight: 500 }}>${sub.toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 11, gap: 6 }}>
                            <input value={pdaDiscount.desc} onChange={e => setPdaDiscount(d => ({ ...d, desc: e.target.value }))} placeholder="Discount description (optional)" style={{ flex: 1, border: `1px solid ${S.borderL}`, borderRadius: 3, padding: "3px 6px", fontSize: 10, background: S.surface, color: S.text, outline: "none" }} />
                            <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                              <button onClick={() => setPdaDiscount(d => ({ ...d, mode: "pct" }))} style={{ padding: "2px 6px", borderRadius: "3px 0 0 3px", fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.borderL}`, background: pdaDiscount.mode === "pct" ? S.brand : S.surface, color: pdaDiscount.mode === "pct" ? "#fff" : S.textS }}>%</button>
                              <button onClick={() => setPdaDiscount(d => ({ ...d, mode: "fixed" }))} style={{ padding: "2px 6px", borderRadius: "0 3px 3px 0", fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.borderL}`, borderLeft: "none", background: pdaDiscount.mode === "fixed" ? S.brand : S.surface, color: pdaDiscount.mode === "fixed" ? "#fff" : S.textS }}>$</button>
                            </div>
                            {pdaDiscount.mode === "pct" ? (
                              <input type="number" min={0} max={100} step="0.1" value={pdaDiscount.pct} onChange={e => setPdaDiscount(d => ({ ...d, pct: Number(e.target.value) || 0 }))} style={{ width: 48, border: `1px solid ${S.borderL}`, borderRadius: 3, padding: "3px 4px", fontSize: 10, textAlign: "right", background: S.surface, color: S.text, outline: "none" }} />
                            ) : (
                              <input type="number" min={0} step="0.01" value={pdaDiscount.amount} onChange={e => setPdaDiscount(d => ({ ...d, amount: Number(e.target.value) || 0 }))} style={{ width: 60, border: `1px solid ${S.borderL}`, borderRadius: 3, padding: "3px 4px", fontSize: 10, textAlign: "right", background: S.surface, color: S.text, outline: "none" }} />
                            )}
                            {discAmt > 0 && <span style={{ color: S.red, fontSize: 11, fontWeight: 500, minWidth: 55, textAlign: "right" }}>−${discAmt.toFixed(2)}</span>}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 2px", fontSize: 13, fontWeight: 500, borderTop: `1px solid ${S.border}`, marginTop: 4 }}>
                            <span>Total</span>
                            <span style={{ color: S.navy }}>${(sub - discAmt).toFixed(2)}</span>
                          </div>
                        </>;
                      })()}
                    </div>
                  </>}
                  <div style={{ padding: "8px 12px", borderTop: `1px solid ${S.borderL}`, display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <button onClick={() => setPdaCart([])} style={{ padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: S.surface, color: S.text }}>Clear all</button>
                    <button onClick={savePdaFromCart} disabled={pdaCart.length === 0} title="Saves as a Draft — nothing goes to the client until you press Send on the document" style={{ padding: "5px 14px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: pdaCart.length > 0 ? "pointer" : "not-allowed", border: `1px solid ${pdaCart.length > 0 ? S.brand : S.border}`, background: pdaCart.length > 0 ? S.brand : S.border, color: pdaCart.length > 0 ? "#fff" : S.textH, display: "flex", alignItems: "center", gap: 4 }}><Check size={11} /> Save as draft</button>
                  </div>
                </div>
              </div>
            </> : selectedPda ? (() => {
              const pda = PDA_ITEMS[selectedPda] || createdPdas[selectedPda];
              if (!pda) return <div style={{ textAlign: "center", padding: 30, color: S.textH }}>PDA not found</div>;
              const items = editPdaItems || pda.items.filter(i => i.n).map(i => ({ ...i }));
              if (!editPdaItems) setTimeout(() => setEditPdaItems(pda.items.filter(i => i.n).map(i => ({ ...i }))), 0);
              // Effective line total: "On request" lines count 0 until priced; a manual
              // amount override wins; blank qty means a flat per-vessel charge (×1).
              const lineTotal = (i) => i.onRequest ? 0 : (i.amount != null && i.amount !== "" ? Number(i.amount) || 0 : ((i.qty == null || i.qty === "" ? 1 : Number(i.qty) || 0) * (Number(i.price) || 0)));
              const subtotal = items.reduce((a, i) => a + Math.round(lineTotal(i) * 100) / 100, 0);
              const totalVat = items.reduce((a, i) => a + Math.round(lineTotal(i) * (Number(i.vat) || 0) / 100 * 100) / 100, 0);
              const discAmt = pdaDiscount.mode === "pct" ? Math.round(subtotal * pdaDiscount.pct / 100 * 100) / 100 : pdaDiscount.amount;
              const grand = Math.round((subtotal + totalVat - discAmt) * 100) / 100;
              const inp = { border: `1px solid ${S.border}`, borderRadius: 4, padding: "3px 5px", fontSize: 12, background: S.surface, color: S.text, outline: "none" };
              const updateItem = (idx, key, val) => setEditPdaItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val, ...(key === "price" && val != null ? { onRequest: false } : {}) } : it));
              const deleteItem = (idx) => setEditPdaItems(prev => prev.filter((_, i) => i !== idx));
              const addItem = () => setEditPdaItems(prev => [...prev, { n: (prev.length + 1) * 10, svc: "", name: "", unit: "", qty: 1, price: 0, vat: 0, note: "", internalNote: "" }]);
              const resetItems = () => setEditPdaItems(pda.items.filter(i => i.n).map(i => ({ ...i })));

              return <>
                <button onClick={() => { setSelectedPda(null); setEditPdaItems(null); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: S.brand, background: "none", border: "none", cursor: "pointer", marginBottom: 10, padding: 0 }}>
                  <ChevronLeft size={14} /> Back to PDA list
                </button>
                <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
                  {/* Header */}
                  <div style={{ padding: "16px 18px", borderBottom: `1px solid ${S.borderL}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Ship size={22} color={S.navy} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>Felix Maritime Agency</div>
                          <div style={{ fontSize: 11, color: S.textS }}>Palace Tower 1, Palestine & El Salam St, Port Said, Egypt</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>Proforma disbursement account</div>
                        <div style={{ fontSize: 13, color: S.brand, fontWeight: 500 }}>{pda.number}</div>
                        <div style={{ marginTop: 4 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 12, background: pda.status === "Accepted" ? S.greenBg : pda.status === "Draft" ? S.orangeBg : S.blueBg, color: pda.status === "Accepted" ? S.green : pda.status === "Draft" ? S.orange : S.blue }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />{pda.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontSize: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: S.textH, marginBottom: 2 }}>Client</div>
                        <div style={{ fontWeight: 500 }}>{pda.client}</div>
                        {pda.clientEmail && <div style={{ color: S.textS, marginTop: 2 }}>{pda.clientEmail}</div>}
                      </div>
                      <div>
                        {[["Operation", op.opNumber], ["Vessel", `${op.vesselName} — ${op.vesselFlag || "TBC"} · ${op.vesselGt || "—"} GT · ${op.vesselLoa || "—"}m`], ["Issue date", pda.date], ["Currency", pda.currency], ["Prepared by", pda.staff]].map(([l, v], i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                            <span style={{ color: S.textH, fontSize: 11 }}>{l}</span><span style={{ fontWeight: i === 0 ? 500 : 400 }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status-aware toolbar */}
                  {(() => {
                    const locked = pda.status === "Accepted";
                    const isDraft = pda.status === "Draft";
                    const isSent = pda.status === "Sent";
                    const isDeclined = pda.status === "Declined";
                    const statusColors = { Draft: { bg: S.orangeBg, color: S.orange }, Sent: { bg: S.blueBg, color: S.blue }, Accepted: { bg: S.greenBg, color: S.green }, Declined: { bg: S.redBg, color: S.red } };
                    const sc = statusColors[pda.status] || statusColors.Draft;
                    return <>
                      <div style={{ padding: "6px 18px", background: sc.bg, borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: sc.color, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                          {locked ? <><Shield size={11} /> Locked — accepted by client. No edits allowed.</> :
                           isDraft ? <><Edit3 size={11} /> Draft — editable. All values recalculate live.</> :
                           isSent ? <><Clock size={11} /> Sent to client — awaiting response. Editing creates a revision.</> :
                           <><AlertCircle size={11} /> Declined — {pda.declineReason || "No reason given"}. Create a revision to re-submit.</>}
                        </span>
                        {(isDraft || isSent) && <button onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${sc.color}`, background: "transparent", color: sc.color }}><Plus size={11} /> Add item</button>}
                      </div>

                      {/* Table */}
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                          <thead><tr style={{ background: "#F2F2F2" }}>
                            {(locked ? ["Code", "Description", "Unit", "Qty", "Price", "VAT %", "Total"] : ["Code", "Description", "Unit", "Qty", "Price", "VAT %", "Total", ""]).map((h, i) => (
                              <th key={i} style={{ textAlign: i >= 3 && i <= 6 ? "right" : "left", padding: "6px 8px", color: S.textS, fontWeight: 500, fontSize: 10, borderBottom: `1px solid ${S.border}`, whiteSpace: "nowrap", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {items.map((item, idx) => {
                              const lineAmt = Math.round(lineTotal(item) * 100) / 100;
                              const lineVat = Math.round(lineAmt * (Number(item.vat) || 0) / 100 * 100) / 100;
                              const sapLine = item.n || (idx + 1) * 10;
                              // Group header row (sub-300 packages): shown when the group changes;
                              // carries the subtotal of the group's lines.
                              const showGroup = item.group && (idx === 0 || items[idx - 1].group !== item.group);
                              const groupRows = showGroup ? items.filter(x => x.group === item.group) : [];
                              const groupSum = groupRows.reduce((a, x) => a + Math.round(lineTotal(x) * 100) / 100, 0);
                              const groupHasReq = groupRows.some(x => x.onRequest);
                              const groupHeader = showGroup ? (
                                <tr key={"g" + idx} style={{ background: "#EAF1F5" }}>
                                  <td colSpan={6} style={{ padding: "5px 8px", borderBottom: `1px solid ${S.border}`, fontWeight: 700, fontSize: 11, color: S.navy, letterSpacing: 0.4 }}>{item.group}</td>
                                  <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.border}`, textAlign: "right", fontWeight: 700, fontSize: 11, color: S.navy, whiteSpace: "nowrap" }}>${groupSum.toFixed(2)}{groupHasReq ? <span style={{ fontWeight: 400, fontSize: 9, color: S.orange }}> +on req.</span> : null}</td>
                                  {!locked && <td style={{ borderBottom: `1px solid ${S.border}` }}></td>}
                                </tr>
                              ) : null;
                              const row = locked ? (
                                <tr key={idx} style={{ verticalAlign: "top" }}>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.brand, fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap" }}>{item.svc || sapLine}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}` }}>
                                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                                    {item.note && <div style={{ fontSize: 10, fontStyle: "italic", color: S.textS, marginTop: 2 }}>{item.note}</div>}
                                    {item.internalNote && <div style={{ display: "flex", alignItems: "flex-start", gap: 4, marginTop: 2, background: S.greenBg, border: `1px dashed ${S.green}50`, borderRadius: 3, padding: "2px 6px" }}>
                                      <Lock size={9} style={{ color: S.green, flexShrink: 0, marginTop: 2 }} />
                                      <span style={{ fontSize: 10, fontStyle: "italic", color: S.green }}>{item.internalNote}</span>
                                    </div>}
                                  </td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS, fontSize: 11 }}>{item.unit}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}>{item.qty == null || item.qty === "" ? "" : item.qty}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}>{item.onRequest || item.price == null ? "" : `$${(Number(item.price) || 0).toFixed(2)}`}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}>{item.vat == null || item.vat === "" ? "" : `${item.vat}%`}</td>
                                  <td style={{ padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right", fontWeight: 500 }}>
                                    {item.onRequest ? <span style={{ fontStyle: "italic", fontSize: 10, color: S.orange, fontWeight: 600 }}>On request</span> : `$${lineAmt.toFixed(2)}`}
                                    {lineVat > 0 && <div style={{ fontSize: 9, fontWeight: 400, color: S.textS }}>+ ${lineVat.toFixed(2)} VAT</div>}
                                  </td>
                                </tr>
                              ) : (
                                <tr key={idx} style={{ verticalAlign: "top" }} onMouseEnter={e => e.currentTarget.style.background = S.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${S.borderL}`, color: S.brand, fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap" }}>{item.svc || sapLine}</td>
                                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${S.borderL}`, minWidth: 180 }}>
                                    <input style={{ ...inp, width: "100%" }} value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} />
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 4, marginTop: 2, background: S.greenBg, border: `1px dashed ${S.green}50`, borderRadius: 4, padding: "2px 6px" }}>
                                      <Lock size={9} style={{ color: S.green, flexShrink: 0, marginTop: 3 }} />
                                      <textarea rows={1} style={{ width: "100%", border: "none", fontSize: 10, fontStyle: "italic", color: S.green, background: "transparent", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.4, minHeight: 15 }} value={item.internalNote || ""} onChange={e => updateItem(idx, "internalNote", e.target.value)} placeholder="INTERNAL — employees only, never printed..." />
                                    </div>
                                    <input style={{ ...inp, width: "100%", marginTop: 2, fontSize: 10, fontStyle: "italic", color: S.textS }} value={item.note || ""} onChange={e => updateItem(idx, "note", e.target.value)} placeholder="Add note... (shows on the PDA/FDA)" />
                                  </td>
                                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${S.borderL}` }}>
                                    <select style={{ ...inp, width: 96 }} value={item.unit || ""} onChange={e => updateItem(idx, "unit", e.target.value)}>
                                      <option value="">—</option>
                                      {(UNIT_OPTIONS.includes(item.unit) || !item.unit ? UNIT_OPTIONS : [item.unit, ...UNIT_OPTIONS]).map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                  </td>
                                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}><input style={{ ...inp, width: 44, textAlign: "center" }} type="number" min={0} value={item.qty ?? ""} placeholder="—" onChange={e => updateItem(idx, "qty", e.target.value === "" ? null : Number(e.target.value) || 0)} title="Blank = flat per-vessel charge — qty not shown on the document" /></td>
                                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}><input style={{ ...inp, width: 66, textAlign: "right" }} type="number" step="0.01" min={0} value={item.price ?? ""} placeholder={item.onRequest ? "on req." : "0"} onChange={e => updateItem(idx, "price", e.target.value === "" ? null : Number(e.target.value) || 0)} /></td>
                                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right" }}><input style={{ ...inp, width: 42, textAlign: "center" }} type="number" min={0} max={100} value={item.vat ?? ""} placeholder="—" onChange={e => updateItem(idx, "vat", e.target.value === "" ? null : Number(e.target.value) || 0)} title="Blank = VAT not shown on the document" /></td>
                                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right", fontWeight: 500, whiteSpace: "nowrap" }}>
                                    {item.onRequest ? <span style={{ fontStyle: "italic", fontSize: 10, color: S.orange, fontWeight: 600 }}>On request</span> : `$${lineAmt.toFixed(2)}`}
                                    {lineVat > 0 && <div style={{ fontSize: 9, fontWeight: 400, color: S.textS }}>+ ${lineVat.toFixed(2)} VAT</div>}
                                  </td>
                                  <td style={{ padding: "4px 6px", borderBottom: `1px solid ${S.borderL}`, width: 26 }}>
                                    <button onClick={() => deleteItem(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: S.textH, padding: 2, borderRadius: 4, display: "flex" }} onMouseEnter={e => { e.currentTarget.style.background = S.redBg; e.currentTarget.style.color = S.red; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = S.textH; }}><Trash2 size={13} /></button>
                                  </td>
                                </tr>
                              );
                              return <Fragment key={idx}>{groupHeader}{row}</Fragment>;
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals */}
                      <div style={{ padding: "14px 18px", borderTop: `1px solid ${S.borderL}`, display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ minWidth: 270 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 13 }}>
                            <span style={{ color: S.textS }}>Subtotal ({items.length} items)</span>
                            <span style={{ fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 13 }}>
                            <span style={{ color: S.textS }}>VAT</span>
                            <span>{totalVat > 0 ? `$${totalVat.toFixed(2)}` : "$0"}</span>
                          </div>
                          <div style={{ borderTop: `1px solid ${S.borderL}`, marginTop: 6, paddingTop: 6 }}>
                            {locked ? (
                              discAmt > 0 ? <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 12 }}>
                                <span style={{ color: S.textS }}>{pdaDiscount.desc || "Discount"}{pdaDiscount.mode === "pct" ? ` (${pdaDiscount.pct}%)` : ""}</span>
                                <span style={{ color: S.red }}>−${discAmt.toFixed(2)}</span>
                              </div> : null
                            ) : (
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", fontSize: 12, gap: 6 }}>
                                <input style={{ ...inp, flex: 1, fontSize: 11 }} value={pdaDiscount.desc} onChange={e => setPdaDiscount(d => ({ ...d, desc: e.target.value }))} placeholder="Discount description (optional)" />
                                <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                                  <button onClick={() => setPdaDiscount(d => ({ ...d, mode: "pct" }))} style={{ padding: "2px 6px", borderRadius: "3px 0 0 3px", fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.borderL}`, background: pdaDiscount.mode === "pct" ? S.brand : S.surface, color: pdaDiscount.mode === "pct" ? "#fff" : S.textS }}>%</button>
                                  <button onClick={() => setPdaDiscount(d => ({ ...d, mode: "fixed" }))} style={{ padding: "2px 6px", borderRadius: "0 3px 3px 0", fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.borderL}`, borderLeft: "none", background: pdaDiscount.mode === "fixed" ? S.brand : S.surface, color: pdaDiscount.mode === "fixed" ? "#fff" : S.textS }}>$</button>
                                </div>
                                {pdaDiscount.mode === "pct" ? (
                                  <input style={{ ...inp, width: 48, textAlign: "right" }} type="number" min={0} max={100} step="0.1" value={pdaDiscount.pct} onChange={e => setPdaDiscount(d => ({ ...d, pct: Number(e.target.value) || 0 }))} />
                                ) : (
                                  <input style={{ ...inp, width: 60, textAlign: "right" }} type="number" min={0} step="0.01" value={pdaDiscount.amount} onChange={e => setPdaDiscount(d => ({ ...d, amount: Number(e.target.value) || 0 }))} />
                                )}
                                {discAmt > 0 && <span style={{ color: S.red, fontSize: 11, fontWeight: 500, flexShrink: 0 }}>−${discAmt.toFixed(2)}</span>}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 4px", fontSize: 14, fontWeight: 500, borderTop: `1px solid ${S.border}`, marginTop: 6 }}>
                            <span>Total ({pda.currency})</span>
                            <span style={{ color: S.navy }}>${grand.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Terms */}
                      {pda.sub300 ? (
                        <div style={{ padding: "12px 18px", borderTop: `1px solid ${S.borderL}`, fontSize: 10.5, color: S.textS, lineHeight: 1.6 }}>
                          <div style={{ fontWeight: 700, color: S.navy, marginBottom: 3, letterSpacing: 0.3 }}>{SUB300_TERMS.title}</div>
                          <div style={{ marginBottom: 3 }}>{SUB300_TERMS.intro}</div>
                          <div style={{ fontWeight: 600, color: S.text, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                            <span>Payment Terms:</span>
                            {locked ? <span>{pda.paymentTerms || PAYMENT_TERMS[0]}</span> : (
                              <select value={pda.paymentTerms || PAYMENT_TERMS[0]} onChange={e => updateCreatedPdas(prev => ({ ...prev, [selectedPda]: { ...prev[selectedPda], paymentTerms: e.target.value } }))} style={{ border: `1px solid ${S.border}`, borderRadius: 4, padding: "2px 6px", fontSize: 10.5, fontWeight: 600, background: S.surface, color: S.text }}>
                                {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            )}
                          </div>
                          <ol style={{ margin: 0, paddingLeft: 18 }}>
                            {SUB300_TERMS.clauses.map((c, i) => <li key={i} style={{ marginBottom: 2 }}>{c}</li>)}
                          </ol>
                        </div>
                      ) : (
                        <div style={{ padding: "12px 18px", borderTop: `1px solid ${S.borderL}`, fontSize: 11, color: S.textS, lineHeight: 1.6 }}>
                          <div style={{ fontWeight: 500, color: S.text, marginBottom: 4 }}>Terms & conditions</div>
                          This PDA is an estimate. Final charges billed on FDA based on actuals. Canal dues based on SDR rate at time of transit. EGP charges converted at prevailing rate. Ismailia Marina berth fees charged directly by the marina — not included. Payment terms: Due upon FDA issuance.
                        </div>
                      )}
                    </>;
                  })()}
                </div>

                {/* Status-aware actions */}
                {(() => {
                  const st = pda.status;
                  const ab = { display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer" };
                  return (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 6 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {st === "Draft" && <>
                          <button onClick={resetItems} style={{ ...ab, border: `1px solid ${S.border}`, background: S.surface, color: S.text }}><RotateCcw size={12} /> Reset</button>
                          <button onClick={() => handleDeletePda(selectedPda)} style={{ ...ab, border: `1px solid ${S.red}`, background: "transparent", color: S.red }}><Trash2 size={12} /> Delete draft</button>
                        </>}
                        {st === "Sent" && <>
                          <button onClick={() => handleRevisePda(selectedPda)} style={{ ...ab, border: `1px solid ${S.orange}`, background: "transparent", color: S.orange }}><FileText size={12} /> Revise (creates -R{(pda.revision || 0) + 1})</button>
                        </>}
                        {st === "Accepted" && <>
                          <button onClick={() => handleSupplementaryPda(selectedPda)} style={{ ...ab, border: `1px solid ${S.orange}`, background: "transparent", color: S.orange }}><Plus size={12} /> Supplementary PDA</button>
                        </>}
                        {st === "Declined" && <>
                          <button onClick={() => handleRevisePda(selectedPda)} style={{ ...ab, border: `1px solid ${S.orange}`, background: "transparent", color: S.orange }}><FileText size={12} /> Create revision</button>
                        </>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => alert("PDF generation will be available in production. The document will render with Felix Maritime branding, SAP line numbering, and entity letterhead.")} style={{ ...ab, border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><Download size={12} /> Download PDF</button>
                        {st === "Draft" && <button onClick={() => handleSendPda(selectedPda)} style={{ ...ab, border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><ExternalLink size={12} /> Send to client</button>}
                        {st === "Sent" && <>
                          <button onClick={() => handleSendPda(selectedPda)} style={{ ...ab, border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><RefreshCw size={12} /> Resend</button>
                          <button onClick={() => handleAcceptPda(selectedPda)} style={{ ...ab, border: `1px solid ${S.green}`, background: S.green, color: "#fff" }}><Check size={12} /> Mark accepted</button>
                          <button onClick={() => handleDeclinePda(selectedPda, "Client requested lower rates")} style={{ ...ab, border: `1px solid ${S.red}`, background: "transparent", color: S.red }}><X size={12} /> Mark declined</button>
                        </>}
                        {st === "Accepted" && <button onClick={() => setActiveTab("fda")} style={{ ...ab, border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Receipt size={12} /> Generate FDA</button>}
                      </div>
                    </div>
                  );
                })()}
              </>;
            })() : <>
              {/* PDA List View */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Proforma disbursement accounts</span>
                <button onClick={() => goToPdaBuilder()} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Plus size={12} /> Create PDA</button>
              </div>
              {(() => {
                const allPdas = [...Object.values(PDA_ITEMS), ...Object.values(createdPdas)].filter(p => p && !p.isFda && (p.opId === op.id || (p.number || "").startsWith(`FMA-PDA-2026-00${op.opNumber.slice(-2)}`)));
                return allPdas.length > 0 ? <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ background: "#F2F2F2" }}>
                    {["PDA number", "Type", "Revision", "Date", "Valid until", "Status", "Items", "Total"].map((h, i) => (
                      <th key={i} style={{ textAlign: i === 7 ? "right" : "left", padding: "8px 12px", color: S.textS, fontWeight: 500, fontSize: 11 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {allPdas.map(pda => {
                      const items = pda.items.filter(i => i.n);
                      const total = items.reduce((a, i) => a + (i.qty * i.price), 0);
                      return (
                        <tr key={pda.number} onClick={() => setSelectedPda(pda.number)} style={{ cursor: "pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, color: S.brand, fontWeight: 500 }}>{pda.number}</td>
                          <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}` }}>{pda.type}</td>
                          <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}` }}>{pda.revision > 0 ? `R${pda.revision}` : "—"}</td>
                          <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}` }}>{pda.date}</td>
                          <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}` }}>{pda.validUntil}</td>
                          <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}` }}><Status value={pda.status} /></td>
                          <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}` }}>{items.length}</td>
                          <td style={{ padding: "8px 12px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right", fontWeight: 500 }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div> : <div style={{ textAlign: "center", padding: 40, color: S.textH }}>
                <Receipt size={32} color={S.textH} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: S.text, marginBottom: 6 }}>No PDAs yet</div>
                <div style={{ fontSize: 12, marginBottom: 12 }}>Click "Create PDA" to auto-generate a proforma from vessel dimensions and port tariffs.</div>
                <button onClick={() => goToPdaBuilder()} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}><Plus size={13} /> Create PDA now</button>
              </div>;
              })()}
              <InfoStrip type="info"><strong>Section 9:</strong> PDA is an estimate, FDA is the truth. Tariffs auto-calculated from vessel GT/LOA. Click any PDA to view the full document.</InfoStrip>
            </>}
          </>}

          {/* FDA TAB */}
          {activeTab === "fda" && (() => {
            const opEntCode = opAgencyCode(op);
            const opFdas = (createdPdas && Object.entries(createdPdas).filter(([k, p]) => p.opId === op.id && p.isFda)) || [];
            const acceptedPdas = Object.entries(createdPdas).filter(([k, p]) => p.opId === op.id && !p.isFda && p.status === "Accepted");
            const pdaSources = Object.entries({ ...PDA_ITEMS, ...createdPdas }).filter(([k, p]) => !p.isFda && p.opId === op.id && p.status === "Accepted");

            const generateFda = (pdaId, pdaData) => {
              const fdaNum = `${opEntCode}-I-${new Date().toISOString().slice(0, 7)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
              const fdaItems = pdaData.items.filter(item => !item.cat && item.name).map(item => {
                const est = item.onRequest ? 0 : (item.amount != null && item.amount !== "" ? Number(item.amount) || 0 : ((item.qty == null || item.qty === "" ? 1 : Number(item.qty) || 0) * (Number(item.price) || 0)));
                return { ...item, estimatedAmount: est, actualAmount: est, variance: 0, internalNote: item.internalNote || "" };
              });
              updateCreatedPdas(prev => ({ ...prev, [fdaNum]: {
                ...pdaData,
                opId: pdaData.opId || op.id,
                isFda: true,
                fdaNumber: fdaNum,
                sourcePda: pdaId,
                items: fdaItems,
                status: "Draft",
                fdaDate: new Date().toISOString().slice(0, 10),
                glPosted: false,
                paymentStatus: "Unpaid",
              }}));
              setSelectedPda(fdaNum);
            };

            if (selectedPda && createdPdas[selectedPda]?.isFda) {
              const fda = createdPdas[selectedPda];
              const fdaSt = fda.status;
              // Line values are net; totals apply each line's VAT% on top (null-safe for blank qty).
              const withVat = (net, i) => (Number(net) || 0) * (1 + (Number(i.vat) || 0) / 100);
              const fdaTotal = fda.items.reduce((s, i) => s + withVat(i.actualAmount != null ? i.actualAmount : (Number(i.qty) || 0) * (Number(i.price) || 0), i), 0);
              const pdaTotal = fda.items.reduce((s, i) => s + withVat(i.estimatedAmount != null ? i.estimatedAmount : (Number(i.qty) || 0) * (Number(i.price) || 0), i), 0);
              const totalVar = pdaTotal > 0 ? Math.round((fdaTotal - pdaTotal) / pdaTotal * 100) : 0;

              const updateFdaItem = (idx, field, val) => {
                updateCreatedPdas(prev => {
                  const updated = { ...prev[selectedPda] };
                  updated.items = [...updated.items];
                  updated.items[idx] = { ...updated.items[idx], [field]: field === "actualAmount" ? parseFloat(val) || 0 : val };
                  if (field === "actualAmount") updated.items[idx].variance = Math.round((parseFloat(val) - updated.items[idx].estimatedAmount) / Math.max(updated.items[idx].estimatedAmount, 1) * 100);
                  return { ...prev, [selectedPda]: updated };
                });
              };
              const releaseFda = () => updateCreatedPdas(prev => ({ ...prev, [selectedPda]: { ...prev[selectedPda], status: "Released", glPosted: true, releaseDate: new Date().toISOString().slice(0, 10) }}));
              const markPaid = () => updateCreatedPdas(prev => ({ ...prev, [selectedPda]: { ...prev[selectedPda], paymentStatus: "Paid", paidDate: new Date().toISOString().slice(0, 10) }}));

              return <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: `1px solid ${S.borderL}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => setSelectedPda(null)} style={{ background: "none", border: "none", cursor: "pointer", color: S.textS }}><ChevronLeft size={16} /></button>
                    <span style={{ fontFamily: "monospace", fontWeight: 500, color: S.brand }}>{selectedPda}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, background: fdaSt === "Draft" ? S.orangeBg : fdaSt === "Released" ? S.greenBg : S.blueBg, color: fdaSt === "Draft" ? S.orange : fdaSt === "Released" ? S.green : S.blue }}>{fdaSt}</span>
                    {fda.glPosted && <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, background: S.purpleBg, color: S.purple }}>GL posted</span>}
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, background: fda.paymentStatus === "Paid" ? S.greenBg : S.redBg, color: fda.paymentStatus === "Paid" ? S.green : S.red }}>{fda.paymentStatus}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {fdaSt === "Draft" && <button onClick={releaseFda} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.green}`, background: S.green, color: "#fff" }}>Release FDA</button>}
                    {fdaSt === "Released" && fda.paymentStatus === "Unpaid" && <button onClick={markPaid} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}>Mark as paid</button>}
                  </div>
                </div>

                {fda.glPosted && <InfoStrip type="info"><strong>GL posting:</strong> Dr 1210 Accounts Receivable ${fdaTotal.toLocaleString()} · Cr 4020 Revenue ${fdaTotal.toLocaleString()} — posted on {fda.releaseDate}</InfoStrip>}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: 12 }}>
                  <Tile title="PDA estimate" value={`$${pdaTotal.toLocaleString()}`} icon={FileText} accent={S.textS} />
                  <Tile title="FDA actual" value={`$${fdaTotal.toLocaleString()}`} icon={Receipt} accent={S.brand} />
                  <Tile title="Variance" value={`${totalVar > 0 ? "+" : ""}${totalVar}%`} icon={TrendingUp} accent={totalVar > 5 ? S.red : totalVar < -5 ? S.orange : S.green} />
                  <Tile title="Source PDA" value={fda.sourcePda} icon={FileText} accent={S.blue} />
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, margin: "0 0 12px" }}>
                  <thead><tr style={{ background: S.bg }}>
                    {["#", "SVC", "Description", "Unit", "Estimated", "Actual", "Var %", ""].map(h => <th key={h} style={{ textAlign: h === "Description" || h === "Unit" ? "left" : "right", padding: "5px 8px", fontSize: 10, color: S.textS, fontWeight: 500, borderBottom: `1px solid ${S.border}` }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{fda.items.map((item, idx) => {
                    const v = item.estimatedAmount > 0 ? Math.round((item.actualAmount - item.estimatedAmount) / item.estimatedAmount * 100) : 0;
                    return <tr key={idx} style={{ borderBottom: `1px solid ${S.borderL}` }}>
                      <td style={{ padding: "4px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 10, color: S.textH }}>{item.n}</td>
                      <td style={{ padding: "4px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 10, color: S.brand }}>{item.svc || item.code || ""}</td>
                      <td style={{ padding: "4px 8px" }}>
                        {item.name}
                        {item.note && <div style={{ fontSize: 10, color: S.textH, fontStyle: "italic" }}>{item.note}</div>}
                      </td>
                      <td style={{ padding: "4px 8px", fontSize: 11, color: S.textS }}>{item.unit || ""}</td>
                      <td style={{ padding: "4px 8px", textAlign: "right", color: S.textS }}>${item.estimatedAmount?.toLocaleString()}</td>
                      <td style={{ padding: "4px 8px", textAlign: "right" }}>
                        {fdaSt === "Draft" ? <input type="number" value={item.actualAmount} onChange={e => updateFdaItem(idx, "actualAmount", e.target.value)} style={{ width: 80, textAlign: "right", border: `1px solid ${S.border}`, borderRadius: 3, padding: "2px 4px", fontSize: 12, fontWeight: 500 }} /> : <span style={{ fontWeight: 500 }}>${item.actualAmount?.toLocaleString()}</span>}
                      </td>
                      <td style={{ padding: "4px 8px", textAlign: "right", fontSize: 11, color: v > 5 ? S.red : v < -5 ? S.green : S.textH }}>{v !== 0 ? `${v > 0 ? "+" : ""}${v}%` : "—"}</td>
                      <td style={{ padding: "4px 8px" }}>
                        {item.internalNote && <Lock size={9} color={S.orange} />}
                      </td>
                    </tr>;
                  })}</tbody>
                  <tfoot><tr style={{ borderTop: `2px solid ${S.border}` }}>
                    <td colSpan={4} style={{ padding: "6px 8px", fontWeight: 500, textAlign: "right" }}>Total</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: S.textS }}>${pdaTotal.toLocaleString()}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 500, fontSize: 13 }}>${fdaTotal.toLocaleString()}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 500, color: totalVar > 5 ? S.red : S.green }}>{totalVar !== 0 ? `${totalVar > 0 ? "+" : ""}${totalVar}%` : "—"}</td>
                    <td></td>
                  </tr></tfoot>
                </table>
              </div>;
            }

            return <div style={{ padding: 14 }}>
              {/* FDA list */}
              {opFdas.length > 0 && <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Issued FDAs</div>
                {opFdas.map(([fdaId, fda]) => (
                  <div key={fdaId} onClick={() => setSelectedPda(fdaId)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 6, border: `1px solid ${S.borderL}`, marginBottom: 4, cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Receipt size={14} color={S.brand} />
                      <span style={{ fontFamily: "monospace", fontWeight: 500, color: S.brand }}>{fdaId}</span>
                      <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: fda.status === "Released" ? S.greenBg : S.orangeBg, color: fda.status === "Released" ? S.green : S.orange }}>{fda.status}</span>
                      <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: fda.paymentStatus === "Paid" ? S.greenBg : S.redBg, color: fda.paymentStatus === "Paid" ? S.green : S.red }}>{fda.paymentStatus}</span>
                    </div>
                    <span style={{ fontWeight: 500 }}>${fda.items.reduce((s, i) => s + (i.actualAmount || i.qty * i.price), 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>}

              {/* Generate from accepted PDA */}
              {pdaSources.length > 0 ? <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Generate FDA from accepted PDA</div>
                {pdaSources.map(([pdaId, pda]) => (
                  <div key={pdaId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 6, border: `1px solid ${S.borderL}`, marginBottom: 4 }}>
                    <div>
                      <span style={{ fontFamily: "monospace", fontWeight: 500, color: S.brand, marginRight: 8 }}>{pdaId}</span>
                      <span style={{ fontSize: 11, color: S.textS }}>{pda.items?.length || 0} items · ${(pda.items || []).reduce((s, i) => s + i.qty * i.price, 0).toLocaleString()}</span>
                    </div>
                    <button onClick={() => generateFda(pdaId, pda)} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}>Generate FDA</button>
                  </div>
                ))}
                <InfoStrip type="info"><strong>SAP document flow:</strong> FDA (billing document) is generated from accepted PDA (quotation). Actual amounts are pre-filled from PDA estimates and can be adjusted. When Released, GL posts automatically: Dr 1210 AR · Cr 4020 Revenue.</InfoStrip>
              </div> : opFdas.length === 0 && <div style={{ textAlign: "center", padding: 30, color: S.textH }}>
                <Receipt size={28} color={S.textH} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: S.text, marginBottom: 4 }}>No accepted PDA available</div>
                <div style={{ fontSize: 12 }}>Accept a PDA first, then generate FDA from actuals</div>
              </div>}
            </div>;
          })()}

          {/* CREW/GUESTS/DOCS — placeholder */}
          {activeTab === "emails" && <OpEmailsTab op={op} patchOp={patchOp} />}
          {activeTab === "docs" && <VesselDocsTab op={op} yacht={yacht} />}

          {activeTab === "crew" && <CrewGuestsTab op={op} yacht={yacht} />}
        </div>
      </div>
    </>;
  }

  // Create Form View
  if (showCreate) {
    const inp = { width: "100%", fontSize: 13, border: `1px solid ${S.border}`, borderRadius: 6, padding: "7px 10px", background: S.surface, color: S.text, outline: "none", boxSizing: "border-box" };
    const linkedYacht = yachts.find(y => y.id === form.yachtId);
    const linkedOwner = linkedYacht ? (owners || []).find(o => o.id === linkedYacht.ownerId) : null;

    return <>
      <button onClick={() => setShowCreate(false)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: S.brand, background: "none", border: "none", cursor: "pointer", marginBottom: 10, padding: 0 }}><ChevronLeft size={14} /> Back to operations list</button>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${S.borderL}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 16, fontWeight: 500 }}>Create new operation</div><div style={{ fontSize: 12, color: S.textS }}>{nextOpNum} — auto-generated on save</div></div>
        </div>
        <div style={{ padding: 18 }}>

          {/* ── Agency Selector — the op number & entity follow THIS choice ── */}
          <div style={{ fontSize: 12, fontWeight: 500, color: S.textS, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Briefcase size={14} /> Agency</span>
            <span style={{ fontSize: 11, color: S.textH }}>Operation number: <span style={{ fontFamily: "monospace", fontWeight: 600, color: S.brand }}>{nextOpNum}</span></span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[["Felix Maritime Agency", "FMA", S.blue], ["German Agency", "GRA", S.navy], ["Cruising Agency", "CRA", "#1D9E75"]].map(([name, code, clr]) => {
              const on = formEntity === name;
              return <button key={code} onClick={() => updateForm("entity", name)} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left", border: `2px solid ${on ? clr : S.border}`, background: on ? `${clr}12` : S.surface, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: on ? clr : S.borderL, color: on ? "#fff" : S.textS, letterSpacing: 0.5 }}>{code}</span>
                <span style={{ fontSize: 12, fontWeight: on ? 600 : 400, color: on ? S.text : S.textS }}>{name}</span>
              </button>;
            })}
          </div>

          {/* ── Operation Type Selector ── */}
          <div style={{ fontSize: 12, fontWeight: 500, color: S.textS, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 6 }}><ClipboardList size={14} /> Operation type</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            <button onClick={() => updateForm("opType", "enquiry")} style={{ padding: "14px 16px", borderRadius: 8, cursor: "pointer", textAlign: "left", border: `2px solid ${isEnquiry ? S.gold : S.border}`, background: isEnquiry ? S.goldBg : S.surface }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isEnquiry ? S.gold : S.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{isEnquiry && <div style={{ width: 10, height: 10, borderRadius: "50%", background: S.gold }} />}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: isEnquiry ? "#92400E" : S.text }}>Enquiry / quick quote</span>
              </div>
              <div style={{ fontSize: 11, color: S.textS, paddingLeft: 26 }}>Minimal info — vessel TBC. Only need estimated LOA/GT for port dues calculation. Full details added later.</div>
            </button>
            <button onClick={() => updateForm("opType", "confirmed")} style={{ padding: "14px 16px", borderRadius: 8, cursor: "pointer", textAlign: "left", border: `2px solid ${!isEnquiry ? S.green : S.border}`, background: !isEnquiry ? S.greenBg : S.surface }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${!isEnquiry ? S.green : S.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{!isEnquiry && <div style={{ width: 10, height: 10, borderRadius: "50%", background: S.green }} />}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: !isEnquiry ? "#166534" : S.text }}>Confirmed operation</span>
              </div>
              <div style={{ fontSize: 11, color: S.textS, paddingLeft: 26 }}>Full vessel details known. Planning begins immediately. Status starts as Upcoming.</div>
            </button>
          </div>

          {/* ── Vessel Section ── */}
          <div style={{ fontSize: 12, fontWeight: 500, color: S.textS, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Ship size={14} /> Vessel {isEnquiry && <span style={{ fontSize: 10, color: S.textH, fontWeight: 400 }}>— optional for enquiry</span>}</span>
          </div>

          {isEnquiry && <div style={{ background: S.goldBg, borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#92400E", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Info size={14} /> For quick quotes, you only need estimated LOA/GT for port dues calculation. Full vessel details can be added later.
          </div>}

          {/* Yacht selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: S.textS, display: "block", marginBottom: 3 }}>Select from vessel database</label>
              <SearchSelect value={form.yachtId ? (() => { const y = yachts.find(yy => yy.id === form.yachtId); return y ? `${y.name} (${y.loa}m · ${y.gt} GT · ${y.flag})` : ""; })() : ""} options={yachts.map(y => `${y.name} (${y.loa}m · ${y.gt} GT · ${y.flag})`)} placeholder="— Select vessel —" width="100%" onChange={(label) => { const y = yachts.find(yy => `${yy.name} (${yy.loa}m · ${yy.gt} GT · ${yy.flag})` === label); handleYachtSelect(y ? y.id : ""); }} />
            </div>
            <button onClick={() => setShowAddVessel(!showAddVessel)} style={{ padding: "7px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, height: 35 }}>
              <Plus size={12} /> Add new vessel
            </button>
          </div>

          {/* Add new vessel inline */}
          {showAddVessel && <div style={{ background: S.bg, borderRadius: 8, padding: 14, marginBottom: 12, border: `1px solid ${S.borderL}` }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: S.text, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Add new vessel to database</span>
              <button onClick={() => setShowAddVessel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: S.textS }}><X size={14} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
              <FW label="Vessel name"><input style={inp} placeholder="M/Y Example" value={newVessel.name} onChange={e => setNewVessel(v => ({ ...v, name: e.target.value }))} /></FW>
              <FW label="Type"><select style={inp} value={newVessel.type} onChange={e => setNewVessel(v => ({ ...v, type: e.target.value }))}><option>Motor</option><option>Sail</option></select></FW>
              <FW label="Flag"><select style={inp} value={newVessel.flag} onChange={e => setNewVessel(v => ({ ...v, flag: e.target.value }))}><option value="">Select...</option>{FLAG_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select></FW>
              <FW label="IMO"><input style={inp} placeholder="IMO8712345" value={newVessel.imo} onChange={e => setNewVessel(v => ({ ...v, imo: e.target.value }))} /></FW>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={handleAddVessel} disabled={!newVessel.name.trim()} style={{ padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: newVessel.name.trim() ? "pointer" : "not-allowed", border: `1px solid ${S.brand}`, background: newVessel.name.trim() ? S.brand : S.border, color: newVessel.name.trim() ? "#fff" : S.textH }}>Save to database</button>
            </div>
          </div>}

          {linkedYacht && <div style={{ background: S.blueBg, borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#0C447C", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={14} /> Auto-filled from yacht profile: {linkedYacht.name} — {linkedYacht.loa}m · {linkedYacht.gt} GT · {linkedYacht.flag}{linkedOwner && ` · Owner: ${linkedOwner.name}`}
          </div>}

          {/* Manual / override fields */}
          <div style={{ fontSize: 11, color: S.textH, marginBottom: 6 }}>Or enter manually{form.yachtId ? " (override auto-filled values)" : ""}:</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
            <FW label={`Vessel name${isEnquiry ? "" : ""}`} hint={isEnquiry ? "Optional — enter if known" : undefined}><input style={inp} value={form.vesselName} onChange={e => updateForm("vesselName", e.target.value)} placeholder={isEnquiry ? "Optional — vessel TBC" : "e.g. M/Y Champagne Seas"} /></FW>
            <FW label={`Est. LOA (m)${isEnquiry ? " *" : ""}`} hint="For port dues calc"><input style={inp} type="number" value={form.vesselLoa} onChange={e => updateForm("vesselLoa", e.target.value)} placeholder="62" /></FW>
            <FW label={`Est. GT${isEnquiry ? " *" : ""}`} hint="For tariff calc"><input style={inp} type="number" value={form.vesselGt} onChange={e => updateForm("vesselGt", e.target.value)} placeholder="1180" /></FW>
            <FW label="Flag"><SearchSelect value={form.vesselFlag} options={FLAG_COUNTRIES} placeholder="Select..." width="100%" onChange={v => updateForm("vesselFlag", v)} /></FW>
            <FW label="Charter status" hint="Drives VAT — flag alone isn't enough"><select style={inp} value={form.charterStatus} onChange={e => updateForm("charterStatus", e.target.value)}><option>Auto (from vessel)</option><option>Private</option><option>Commercial charter</option></select></FW>
          </div>

          {/* ── Client Section ── */}
          <div style={{ fontSize: 12, fontWeight: 500, color: S.textS, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 6 }}><UserCircle size={14} /> Client & billing</div>
          {linkedOwner && <div style={{ background: S.blueBg, borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#0C447C", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={14} /> Auto-filled from vessel owner: {linkedOwner.name} ({linkedOwner.email}). You can change this below.
          </div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <FW label={isEnquiry ? "Client name" : "Client name *"}><input style={inp} value={form.clientName} onChange={e => updateForm("clientName", e.target.value)} placeholder={isEnquiry ? "Optional for quick quote" : "e.g. Hill Robinson"} /></FW>
            <FW label="Client email"><input style={inp} type="email" value={form.clientEmail} onChange={e => updateForm("clientEmail", e.target.value)} placeholder="ops@hillrobinson.com" /></FW>
          </div>

          {/* ── Team Section ── */}
          <div style={{ fontSize: 12, fontWeight: 500, color: S.textS, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 6 }}><Users size={14} /> Team — who's working this call</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <FW label="Lead (in charge)" hint={`Defaults to you — ${user?.name || "current user"}`}><SearchSelect value={form.leadName} options={STAFF.map(s => s.name)} placeholder={user?.name || "Select..."} width="100%" onChange={v => updateForm("leadName", v)} /></FW>
            <FW label="Support team" hint="Everyone added sees this op under My operations"><MultiSearchSelect value={form.supportNames} options={STAFF.map(s => s.name)} placeholder="Add colleagues..." width="100%" onChange={v => updateForm("supportNames", v)} /></FW>
          </div>

          {/* ── Voyage Section ── */}
          <div style={{ fontSize: 12, fontWeight: 500, color: S.textS, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> Voyage details</div>

          {/* Transit designation */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: S.textS, display: "block", marginBottom: 6 }}>Suez Canal transit / cruising area</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[...TRANSIT_TYPES, ...CRUISING_AREAS].map(t => (
                <button key={t.code} onClick={() => handlePortToggle(t.code)} style={{ padding: "8px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: `2px solid ${form.ports.includes(t.code) ? S.brand : S.border}`, background: form.ports.includes(t.code) ? S.brandL : S.surface, color: form.ports.includes(t.code) ? S.brand : S.text, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  {form.ports.includes(t.code) ? <Check size={14} /> : (t.cat === "Cruising Area" ? <Waves size={14} color={S.textH} /> : <Compass size={14} color={S.textH} />)}
                  <div style={{ textAlign: "left" }}>
                    <div>{t.cat === "Cruising Area" ? t.name.split(" — ")[0] : t.code}</div>
                    <div style={{ fontSize: 10, fontWeight: 400, color: form.ports.includes(t.code) ? S.brand : S.textH }}>{t.cat === "Cruising Area" ? "Cruising area" : t.name}</div>
                  </div>
                </button>
              ))}
              {(() => { const noTransit = !form.ports.some(p => p.startsWith("SC-") || p.startsWith("AREA-"));
                return <button onClick={() => setForm(f => ({ ...f, ports: f.ports.filter(p => !p.startsWith("SC-") && !p.startsWith("AREA-")) }))} style={{ padding: "8px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: `2px solid ${noTransit ? S.navy : S.border}`, background: noTransit ? "#E6F1FB" : S.surface, color: noTransit ? S.navy : S.textS, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>{noTransit && <Check size={14} />} No transit</button>; })()}
            </div>
          </div>

          {/* Ports of call by category */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: S.textS, display: "block", marginBottom: 6 }}>Ports of call <span style={{ color: S.red }}>*</span> <span style={{ color: S.textH, fontWeight: 400 }}>— select all ports the vessel will visit</span></label>
            {PORT_CATEGORIES.map(cat => {
              const catPorts = PORTS_EG.filter(p => p.cat === cat);
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: S.textH, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: { "Suez Canal Zone": S.brand, "Red Sea (Northern)": S.cyan, "Red Sea (Central & Southern)": S.green, "Gulf of Aqaba": S.purple, "Mediterranean": S.navy, "Hurghada & El Gouna — Islands": S.orange, "Sharm El-Sheikh & Sinai — Islands": S.gold, "Marsa Alam & Deep South — Islands": S.red }[cat] || S.textH }} />
                    {cat}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {catPorts.map(p => {
                      const sel = form.ports.includes(p.code);
                      const isMarina = p.type.includes("Marina");
                      const isAnchorage = p.type.includes("Anchorage") || p.type.includes("Minor");
                      return (
                        <button key={p.code} onClick={() => handlePortToggle(p.code)} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${sel ? S.brand : S.border}`, background: sel ? S.brandL : S.surface, color: sel ? S.brand : S.text, display: "flex", alignItems: "center", gap: 4 }}>
                          {sel && <Check size={10} />}
                          <span style={{ fontWeight: 500 }}>{p.name}</span>
                          <span style={{ fontSize: 9, color: sel ? S.brand : S.textH, padding: "1px 4px", borderRadius: 3, background: sel ? "transparent" : (isMarina ? "#E0F7FA" : isAnchorage ? "#FEF3C7" : "transparent") }}>
                            {isMarina ? "Marina" : isAnchorage ? "Anchorage" : p.type.includes("Ferry") ? "Ferry" : p.type.includes("Border") ? "Border" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected ports summary */}
          {form.ports.length > 0 && <div style={{ background: S.bg, borderRadius: 6, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: S.textS, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 500, color: S.text }}>{form.ports.length} selected:</span>
            {form.ports.map(code => {
              const p = [...TRANSIT_TYPES, ...PORTS_EG].find(x => x.code === code);
              return <span key={code} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: S.brandL, color: S.brand, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 3 }}>
                {code.startsWith("SC-") && <Compass size={10} />}{p?.name || code}
                <button onClick={() => handlePortToggle(code)} style={{ background: "none", border: "none", cursor: "pointer", color: S.brand, padding: 0, display: "flex" }}><X size={10} /></button>
              </span>;
            })}
          </div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
            <FW label="ETA"><input style={inp} type="date" value={form.eta} onChange={e => updateForm("eta", e.target.value)} /></FW>
            <FW label="ETD"><input style={inp} type="date" value={form.etd} onChange={e => updateForm("etd", e.target.value)} /></FW>
            <FW label="Last port"><SearchSelect value={form.lastPort} options={["Other / TBC", ...PORTS_EG.map(p => `${p.name} (Egypt)`), ...WORLD_PORTS.filter(p => p !== "Other / TBC"), ...FLAG_COUNTRIES]} placeholder="Search port or country..." width="100%" onChange={v => updateForm("lastPort", v)} /></FW>
            <FW label="Next port"><SearchSelect value={form.nextPort} options={["Other / TBC", ...PORTS_EG.map(p => `${p.name} (Egypt)`), ...WORLD_PORTS.filter(p => p !== "Other / TBC"), ...FLAG_COUNTRIES]} placeholder="Search port or country..." width="100%" onChange={v => updateForm("nextPort", v)} /></FW>
          </div>

          {/* ── Financial & Assignment ── */}
          <div style={{ fontSize: 12, fontWeight: 500, color: S.textS, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={14} /> Financial & assignment</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <FW label="Base currency"><SearchSelect value={form.baseCurrency} options={Object.keys(CURRENCIES)} placeholder="Select..." width="100%" onChange={v => updateForm("baseCurrency", v)} /></FW>
            <FW label="FX rates (locked at creation)"><div style={{ background: S.bg, borderRadius: 6, padding: "7px 10px", fontSize: 11, color: S.textS, fontFamily: "monospace" }}>USD 1 · EUR 0.92 · EGP 50.85</div></FW>
          </div>

          {/* ── Notes ── */}
          <div style={{ fontSize: 12, fontWeight: 500, color: S.textS, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 6 }}><FileText size={14} /> Notes</div>
          <textarea style={{ ...inp, minHeight: 56, resize: "vertical" }} value={form.notes} onChange={e => updateForm("notes", e.target.value)} placeholder="Operation notes — itinerary details, special requirements..." />
        </div>

        {/* ── Actions Footer ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderTop: `1px solid ${S.borderL}`, background: S.bg }}>
          <div style={{ fontSize: 12, color: S.textH }}>
            {!canCreate && <span style={{ color: S.orange, display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={12} />
              {isEnquiry ? "Need: at least 1 port + estimated LOA or GT" : `Need: ${[!form.vesselName && "vessel name", !form.clientName && "client name", form.ports.length === 0 && "ports"].filter(Boolean).join(", ")}`}
            </span>}
            {canCreate && <span style={{ color: S.green, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} /> Ready to create as {isEnquiry ? "Enquiry" : "Confirmed (Upcoming)"}</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: S.surface, color: S.text }}>Cancel</button>
            <button onClick={handleCreate} disabled={!canCreate} style={{ padding: "7px 18px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: canCreate ? "pointer" : "not-allowed", border: `1px solid ${canCreate ? (isEnquiry ? S.gold : S.green) : S.border}`, background: canCreate ? (isEnquiry ? S.gold : S.green) : S.border, color: canCreate ? "#fff" : S.textH, display: "flex", alignItems: "center", gap: 4 }}>
              <Check size={13} /> {isEnquiry ? "Create enquiry" : "Create operation"}
            </button>
          </div>
        </div>
      </div>
    </>;
  }

  return <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 14 }}>
      {OP_STATUSES.map(s => {
        const ct = visibleOps.filter(o => o.status === s).length;
        const colors = { Enquiry: S.gold, Upcoming: S.blue, Active: S.green, Completed: S.purple, Closed: S.textS, Lost: S.red };
        return <Tile key={s} title={s} value={ct} icon={CircleDot} accent={colors[s]} />;
      })}
    </div>
    <FilterBar filters={all} active={filter} onToggle={toggle} count={filtered.length} />
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: -34, position: "relative", zIndex: 2, paddingRight: 210 }}>
      <button onClick={() => setMineOnly(!mineOnly)} title="Show only operations where you're on the team" style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${mineOnly ? S.brand : S.border}`, background: mineOnly ? S.brand : "transparent", color: mineOnly ? "#fff" : S.text, marginTop: 6 }}><UserCircle size={12} /> My operations ({myOpsCount})</button>
      <button onClick={() => setEmailImport(!emailImport)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: emailImport ? S.brand : "transparent", color: emailImport ? "#fff" : S.brand, marginTop: 6 }}><MessageCircle size={12} /> Create from email</button>
    </div>
    <Toolbar title="Operations — list report (Section 3)" onCreate={() => setShowCreate(true)} />
    {emailImport && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: S.navy, marginBottom: 4 }}>New operation from an email enquiry</div>
      <div style={{ fontSize: 11, color: S.textS, marginBottom: 8 }}>Paste the client's email below (with the From/Subject lines if possible). Felix iQ extracts the vessel, route (Suez NB/SB), LOA/GT, ETA, client and requested services, prefills the create form, and attaches the original email to the operation.</div>
      <textarea value={emailRaw} onChange={e => setEmailRaw(e.target.value)} rows={8}
        placeholder={"From: Captain John Smith <captain@myaurora.com>\nSubject: Quote request — Suez Canal transit NB\n\nGood day,\nWe are M/Y AURORA, 42m LOA, 380 GT, flag Malta.\nRequesting a quote for a northbound Suez Canal transit, ETA 2026-08-14.\nWe would also need bunkers (MGO) at Ismailia and a crew change in Port Said.\nBest regards"}
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${S.border}`, borderRadius: 6, padding: 10, fontSize: 12, fontFamily: "inherit", resize: "vertical" }} />
      <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
        <button onClick={() => { setEmailImport(false); setEmailRaw(""); }} style={{ padding: "6px 14px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Cancel</button>
        <button onClick={startFromEmail} disabled={!emailRaw.trim()} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 16px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: emailRaw.trim() ? "pointer" : "default", border: "none", background: emailRaw.trim() ? S.orange : S.border, color: emailRaw.trim() ? "#fff" : S.textH }}><Check size={12} /> Parse &amp; prefill operation</button>
      </div>
    </div>}
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: "0 0 8px 8px", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead><tr style={{ background: "#F2F2F2" }}>
          {["Op number", "Status", "Vessel", "Client", "Flag", "GT", "Ports", "ETA", "Ccy", "Svcs", "PDAs", "FDAs", "Team"].map((h, i) => (
            <th key={i} style={{ textAlign: "left", padding: "9px 12px", color: S.textS, fontWeight: 500, fontSize: 11, borderBottom: `1px solid ${S.border}`, whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {filtered.map(op => (
            <tr key={op.id} onClick={() => setSelectedOp(op)} style={{ cursor: "pointer", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}`, color: S.brand, fontWeight: 500 }}>{op.opNumber}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}><Status value={op.status} /></td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}`, fontWeight: 500 }}>{op.vesselName}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}>{op.clientName}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}>{op.vesselFlag}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}>{op.vesselGt}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}>{op.ports?.join(", ")}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}`, whiteSpace: "nowrap" }}>{op.eta}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}>{op.baseCurrency}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}>{op.serviceCount}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}>{op.pdaCount}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}>{op.fdaCount}</td>
              <td style={{ padding: "9px 12px", borderBottom: `1px solid ${S.borderL}` }}>{(() => { const t = teamMembers(op); if (!t.length) return "—"; const lead = t.find(m => m.role === "Lead") || t[0]; const others = t.filter(m => m !== lead); return <span title={t.map(m => `${m.name} (${m.role})`).join(", ")}>{lead.name.split(" ")[0]}{others.length > 0 && <span style={{ marginLeft: 4, padding: "1px 6px", borderRadius: 8, fontSize: 10, background: S.brandL, color: S.brand, fontWeight: 600 }}>+{others.length}</span>}{onTeam(op, user?.id) && <span style={{ marginLeft: 4, fontSize: 9.5, color: S.green, fontWeight: 600 }}>YOU</span>}</span>; })()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <InfoStrip type="info"><strong>Lifecycle:</strong> Enquiry → Upcoming → Active → Completed → Closed. Lost = declined enquiry with reason code. Click any row to open the object page.</InfoStrip>
  </>;
};

// VESSEL MOVEMENTS BOARD (Section 20)
const MovementsView = ({ allYachts, allOps }) => {
  const yachts = allYachts || YACHTS;
  const liveOps = allOps || OPERATIONS;
  const movements = liveOps.filter(o => ["Active", "Upcoming"].includes(o.status)).map(o => {
    const tr = TRANSITS.find(t => t.opId === o.id);
    const mvType = tr ? (tr.direction === "Southbound" ? "S.B" : "N.B") : (o.ports.some(p => ["HRG","EGN","SMB","SSH","MRS","PGH","SAF","DBH"].includes(p)) ? "RED SEA" : "MED");
    return { ...o, movement: mvType, transitStatus: tr?.status || "—", ismailia: tr?.ismailiaStop || "—", scgt: yachts.find(y => y.id === o.yachtId)?.scgt || "—", entryPoint: o.ports[0] };
  });
  return <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 14 }}>
      <Tile title="Total movements" value={movements.length} icon={Activity} accent={S.brand} />
      <Tile title="Southbound" value={movements.filter(m => m.movement === "S.B").length} icon={ChevronDown} accent={S.green} />
      <Tile title="Northbound" value={movements.filter(m => m.movement === "N.B").length} icon={ChevronUp} accent={S.blue} />
      <Tile title="Red Sea" value={movements.filter(m => m.movement === "RED SEA").length} icon={Waves} accent={S.cyan} />
      <Tile title="At Ismailia" value={movements.filter(m => m.ismailia?.startsWith("Yes")).length} icon={MapPin} accent={S.purple} />
    </div>
    <Toolbar title="Vessel movements board" />
    <Table columns={[
      { key: "eta", label: "Date" },
      { key: "vesselName", label: "Vessel", render: v => <span style={{ fontWeight: 500 }}>{v}</span> },
      { key: "vesselFlag", label: "Flag" },
      { key: "scgt", label: "SCGT" },
      { key: "entryPoint", label: "Entry" },
      { key: "lastPort", label: "From" },
      { key: "nextPort", label: "To" },
      { key: "movement", label: "Movement", render: v => <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: { "S.B": S.greenBg, "N.B": S.blueBg, "RED SEA": S.cyanBg, "MED": S.purpleBg }[v], color: { "S.B": S.green, "N.B": S.blue, "RED SEA": S.cyan, "MED": S.purple }[v] }}>{v}</span> },
      { key: "ismailia", label: "Ismailia" },
      { key: "transitStatus", label: "Transit Status", render: v => v !== "—" ? <Status value={v} /> : "—" },
      { key: "status", label: "Op Status", render: v => <Status value={v} /> },
    ]} data={movements} />
  </>;
};

// YACHT DIRECTORY (Section 4)
// Searchable combobox: type-to-filter + scrollable panel of all options.
// Used for long lists (builders, models) where a plain <select> is unusable.
function SearchSelect({ value, options, onChange, placeholder, width = 226 }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const filtered = q.trim()
    ? options.filter(o => o.toLowerCase().includes(q.toLowerCase())).slice(0, 300)
    : options.slice(0, 300);
  const more = (q.trim() ? options.filter(o => o.toLowerCase().includes(q.toLowerCase())).length : options.length) - filtered.length;
  return (
    <div ref={wrapRef} style={{ position: "relative", width }}>
      <button type="button" onClick={() => { setOpen(o => !o); setQ(""); }}
        style={{ width: "100%", textAlign: "left", border: `1px solid ${S.brand}40`, borderRadius: 3, padding: "4px 8px", fontSize: 12, fontWeight: 500, background: S.surface, color: value ? S.text : S.textH, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || placeholder}</span>
        <ChevronDown size={13} style={{ color: S.textH, flexShrink: 0, transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", width: typeof width === "number" ? Math.max(width, 240) : "100%", minWidth: 240, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, boxShadow: "0 8px 28px rgba(0,0,0,.14)", zIndex: 50, overflow: "hidden" }}>
          <div style={{ padding: 8, borderBottom: `1px solid ${S.borderL}` }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Type to search..."
              style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 4, padding: "5px 8px", fontSize: 12, boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {filtered.length === 0 && <div style={{ padding: "10px 12px", fontSize: 12, color: S.textH }}>No matches{q ? " — press Enter to keep typed value" : ""}</div>}
            {filtered.map(o => (
              <div key={o} onClick={() => { onChange(o); setOpen(false); }}
                style={{ padding: "6px 12px", fontSize: 12, cursor: "pointer", background: o === value ? S.brandL : "transparent", color: o === value ? S.brand : S.text, fontWeight: o === value ? 500 : 400 }}
                onMouseEnter={e => { if (o !== value) e.currentTarget.style.background = S.bg; }}
                onMouseLeave={e => { if (o !== value) e.currentTarget.style.background = "transparent"; }}>{o}</div>
            ))}
            {more > 0 && <div style={{ padding: "6px 12px", fontSize: 11, color: S.textH, borderTop: `1px solid ${S.borderL}` }}>+ {more} more — keep typing to narrow</div>}
          </div>
          {q.trim() && !options.some(o => o.toLowerCase() === q.trim().toLowerCase()) && (
            <div onClick={() => { onChange(q.trim()); setOpen(false); }} style={{ padding: "7px 12px", fontSize: 12, cursor: "pointer", borderTop: `1px solid ${S.borderL}`, color: S.brand, background: S.bg }}>
              Use "{q.trim()}" (custom entry)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Multi-select checkbox dropdown. Value/onChange use a comma-joined string.
function MultiSelect({ value, options, onChange, placeholder, width = 226 }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const selected = (value || "").split(",").map(s => s.trim()).filter(Boolean);
  const toggle = (opt) => {
    const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
    // keep canonical option order
    const ordered = options.filter(o => next.includes(o));
    onChange(ordered.join(", "));
  };
  return (
    <div ref={wrapRef} style={{ position: "relative", width }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: "100%", textAlign: "left", border: `1px solid ${S.brand}40`, borderRadius: 3, padding: "4px 8px", fontSize: 12, fontWeight: 500, background: S.surface, color: selected.length ? S.text : S.textH, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.length ? selected.join(", ") : placeholder}</span>
        <ChevronDown size={13} style={{ color: S.textH, flexShrink: 0, transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", width: typeof width === "number" ? Math.max(width, 200) : "100%", minWidth: 200, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, boxShadow: "0 8px 28px rgba(0,0,0,.14)", zIndex: 50, overflow: "hidden" }}>
          <div style={{ maxHeight: 240, overflowY: "auto", padding: 4 }}>
            {options.map(o => {
              const on = selected.includes(o);
              return (
                <label key={o} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", borderRadius: 4, background: on ? S.brandL : "transparent", color: on ? S.brand : S.text, fontWeight: on ? 500 : 400 }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = S.bg; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  <input type="checkbox" checked={on} onChange={() => toggle(o)} style={{ cursor: "pointer" }} />
                  {o}
                </label>
              );
            })}
          </div>
          {selected.length > 0 && <div style={{ borderTop: `1px solid ${S.borderL}`, padding: "6px 10px", fontSize: 11, color: S.textS, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{selected.length} selected</span>
            <span onClick={() => onChange("")} style={{ color: S.brand, cursor: "pointer" }}>Clear</span>
          </div>}
        </div>
      )}
    </div>
  );
}

// Multi-select with search + custom entries. Value/onChange use a comma-joined string.
// Unlike MultiSelect, this preserves selected values that are NOT in `options`
// (legacy entries, combined credits, custom typed names) and supports searching long lists.
function MultiSearchSelect({ value, options, onChange, placeholder, width = 226 }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const selected = (value || "").split(",").map(s => s.trim()).filter(Boolean);
  const setSel = (next) => onChange(next.join(", "));
  const toggle = (opt) => { setSel(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]); };
  const qq = q.trim().toLowerCase();
  const matches = qq ? options.filter(o => o.toLowerCase().includes(qq)) : options;
  const filtered = matches.slice(0, 300);
  const more = matches.length - filtered.length;
  const canAddCustom = q.trim() && !options.some(o => o.toLowerCase() === q.trim().toLowerCase()) && !selected.some(s => s.toLowerCase() === q.trim().toLowerCase());
  return (
    <div ref={wrapRef} style={{ position: "relative", width }}>
      <button type="button" title={selected.join(", ")} onClick={() => { setOpen(o => !o); setQ(""); }}
        style={{ width: "100%", textAlign: "left", border: `1px solid ${S.brand}40`, borderRadius: 3, padding: "4px 8px", fontSize: 12, fontWeight: 500, background: S.surface, color: selected.length ? S.text : S.textH, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.length ? selected.join(", ") : placeholder}</span>
        <ChevronDown size={13} style={{ color: S.textH, flexShrink: 0, transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", width: typeof width === "number" ? Math.max(width, 240) : "100%", minWidth: 240, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, boxShadow: "0 8px 28px rgba(0,0,0,.14)", zIndex: 50, overflow: "hidden" }}>
          <div style={{ padding: 8, borderBottom: `1px solid ${S.borderL}` }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Type to search or add..."
              style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 4, padding: "5px 8px", fontSize: 12, boxSizing: "border-box", outline: "none" }} />
          </div>
          {selected.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 8, borderBottom: `1px solid ${S.borderL}` }}>
              {selected.map(s => (
                <span key={s} onClick={() => toggle(s)} title="Click to remove"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: S.brandL, color: S.brand, borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
                  {s}<span style={{ fontWeight: 700 }}>×</span>
                </span>
              ))}
            </div>
          )}
          <div style={{ maxHeight: 220, overflowY: "auto", padding: 4 }}>
            {filtered.length === 0 && !canAddCustom && <div style={{ padding: "10px 12px", fontSize: 12, color: S.textH }}>No matches</div>}
            {filtered.map(o => {
              const on = selected.includes(o);
              return (
                <label key={o} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", borderRadius: 4, background: on ? S.brandL : "transparent", color: on ? S.brand : S.text, fontWeight: on ? 500 : 400 }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = S.bg; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  <input type="checkbox" checked={on} onChange={() => toggle(o)} style={{ cursor: "pointer" }} />
                  {o}
                </label>
              );
            })}
            {more > 0 && <div style={{ padding: "6px 12px", fontSize: 11, color: S.textH, borderTop: `1px solid ${S.borderL}` }}>+ {more} more — keep typing to narrow</div>}
          </div>
          {canAddCustom && (
            <div onClick={() => { toggle(q.trim()); setQ(""); }} style={{ padding: "7px 12px", fontSize: 12, cursor: "pointer", borderTop: `1px solid ${S.borderL}`, color: S.brand, background: S.bg }}>
              + Add "{q.trim()}" (custom entry)
            </div>
          )}
          {selected.length > 0 && <div style={{ borderTop: `1px solid ${S.borderL}`, padding: "6px 10px", fontSize: 11, color: S.textS, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{selected.length} selected</span>
            <span onClick={() => onChange("")} style={{ color: S.brand, cursor: "pointer" }}>Clear all</span>
          </div>}
        </div>
      )}
    </div>
  );
}


// ---- Ownership model -------------------------------------------------------
// A yacht's ownership is an array of
//   { type:'Person'|'Company', id, name, role:'Sole'|'Co-owner', share }.
// Legacy yachts carry a single `ownerId`; normalizeOwnership migrates that on read
// so the structured editor always has a consistent array to work with.
function normalizeOwnership(y, getOwnerName) {
  if (Array.isArray(y?.ownership) && y.ownership.length) {
    return y.ownership.map(o => ({
      type: o.type === "Company" ? "Company" : "Person",
      id: o.id || "",
      name: o.name || (o.id && getOwnerName ? getOwnerName(o.id) : "") || "",
      role: o.role === "Sole" ? "Sole" : "Co-owner",
      share: Number(o.share) || 0,
    }));
  }
  if (y?.ownerId) return [{ type: "Person", id: y.ownerId, name: getOwnerName ? getOwnerName(y.ownerId) : "", role: "Sole", share: 100 }];
  return [];
}

// The primary owner = the Sole owner, else the largest share, else the first.
// Used to keep the legacy `ownerId`/`ownerName` in sync for cards, exports & filters.
function primaryOwner(list) {
  if (!Array.isArray(list) || !list.length) return null;
  return list.find(o => o.role === "Sole")
    || [...list].sort((a, b) => (Number(b.share) || 0) - (Number(a.share) || 0))[0]
    || list[0];
}

// Reusable structured multi-owner editor. Controlled: `value` is the ownership
// array, `onChange(nextArray)` persists it. Read-only when editing=false.
function OwnershipEditor({ value, onChange, owners = [], companies = [], openOwner, editing = true }) {
  const list = Array.isArray(value) ? value : [];
  const total = list.reduce((s, o) => s + (Number(o.share) || 0), 0);
  const allocOk = list.length === 0 || total === 100;

  const selStyle = { border: `1px solid ${S.brand}40`, borderRadius: 3, padding: "4px 6px", fontSize: 11, fontWeight: 500, background: S.surface, color: S.text, cursor: "pointer" };
  const badgeStyle = (t) => ({ fontSize: 9, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase", padding: "1px 5px", borderRadius: 3, background: t === "Company" ? S.brand + "18" : S.orange + "18", color: t === "Company" ? S.brand : S.orange });

  const resolveId = (type, name) => {
    const pool = type === "Company" ? companies : owners;
    const m = pool.find(p => (p.name || p.fullName || "").toLowerCase() === (name || "").trim().toLowerCase());
    return m ? m.id : "";
  };
  const update = (i, patch) => onChange(list.map((o, j) => (j === i ? { ...o, ...patch } : o)));
  const remove = (i) => onChange(list.filter((_, j) => j !== i));
  const add = () => onChange([...list, { type: "Person", id: "", name: "", role: list.length === 0 ? "Sole" : "Co-owner", share: list.length === 0 ? 100 : 0 }]);

  const allocChip = list.length > 0
    ? <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: allocOk ? S.green + "1A" : S.red + "1A", color: allocOk ? S.green : S.red }}>{total}% allocated</span>
    : null;

  if (!editing) {
    return <div style={{ padding: "8px 0", borderBottom: `1px solid ${S.borderL}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: list.length ? 6 : 0 }}>
        <span style={{ color: S.textS, fontSize: 12 }}>Owner{list.length > 1 ? "s" : ""}</span>
        {allocChip}
      </div>
      {list.length === 0
        ? <div style={{ color: S.textH, fontSize: 12 }}>{"—"}</div>
        : list.map((o, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", fontSize: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <span style={badgeStyle(o.type)}>{o.type === "Company" ? "Company" : "Person"}</span>
              {o.id && openOwner
                ? <span onClick={() => openOwner(o.id)} style={{ fontWeight: 500, color: S.brand, cursor: "pointer", textDecoration: "underline", textDecorationColor: S.brand + "55", textUnderlineOffset: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name || "—"}</span>
                : <span style={{ fontWeight: 500, color: S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name || "—"}</span>}
              <span style={{ color: S.textH, fontSize: 11, flexShrink: 0 }}>{o.role}</span>
            </span>
            <span style={{ fontWeight: 600, color: S.text, flexShrink: 0 }}>{Number(o.share) || 0}%</span>
          </div>)}
    </div>;
  }

  return <div style={{ padding: "8px 0", borderBottom: `1px solid ${S.borderL}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ color: S.textS, fontSize: 12, fontWeight: 600 }}>Ownership structure</span>
      {allocChip}
    </div>
    {list.map((o, i) => {
      const opts = (o.type === "Company" ? companies : owners).map(p => p.name || p.fullName).filter(Boolean);
      return <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, background: S.bg, border: `1px solid ${S.borderL}`, borderRadius: 6, padding: 6 }}>
        <select value={o.type} onChange={e => update(i, { type: e.target.value, id: resolveId(e.target.value, o.name) })} style={selStyle}>
          <option>Person</option><option>Company</option>
        </select>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchSelect value={o.name} options={opts} placeholder={`Select ${o.type.toLowerCase()}…`} width="100%" onChange={(name) => update(i, { name, id: resolveId(o.type, name) })} />
        </div>
        <select value={o.role} onChange={e => update(i, { role: e.target.value })} style={selStyle}>
          <option>Sole</option><option>Co-owner</option>
        </select>
        <input type="number" min="0" max="100" value={o.share} onChange={e => update(i, { share: e.target.value === "" ? "" : Math.max(0, Math.min(100, Number(e.target.value))) })} style={{ width: 46, border: `1px solid ${S.brand}40`, borderRadius: 3, padding: "4px 6px", fontSize: 12, background: S.surface, color: S.text, boxSizing: "border-box", textAlign: "right" }} />
        <span style={{ fontSize: 11, color: S.textS }}>%</span>
        <button type="button" onClick={() => remove(i)} title="Remove owner" style={{ border: "none", background: "transparent", color: S.red, cursor: "pointer", padding: 2, display: "flex", flexShrink: 0 }}><X size={14} /></button>
      </div>;
    })}
    <button type="button" onClick={add} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", border: `1px dashed ${S.brand}66`, background: S.brand + "08", color: S.brand, borderRadius: 6, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
      <Plus size={13} /> Add owner
    </button>
    {list.length > 0 && !allocOk && <div style={{ marginTop: 6, fontSize: 11, color: S.red, fontWeight: 500 }}>Shares must total 100% (currently {total}%).</div>}
  </div>;
}

const YachtsView = ({ allYachts, allOwners, allCompanies, allOps, addYacht, addCompany, importYachts, updYacht, nav, intent, clearIntent, allTags, openCompany, openOwner, goBack, navDepth, backLabel, onCreateOp }) => {
  const liveOps = allOps || OPERATIONS;
  const yachts = allYachts || YACHTS;
  const owners = allOwners || [];
  const companies = allCompanies || COMPANIES;
  const [s, setS] = useState("");
  const [tf, setTf] = useState("All");
  const [vw, setVw] = useState("cards");
  const [adding, setAdding] = useState(false);
  const [sel, setSel] = useState(null);
  const [yTab, setYTab] = useState("overview");
  const [tagFilter, setTagFilter] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [docAdding, setDocAdding] = useState(false);
  const blankDoc = { name: "", docType: "Certificate of Registry", number: "", issued: "", expiry: "", fileName: "", fileData: "", notes: "" };
  const [docDraft, setDocDraft] = useState(blankDoc);
  const [ny, setNy] = useState({ name: "", type: "Motor", category: "Pleasure", loa: "", gt: "", flag: "", imo: "", beam: "", draught: "", hullMaterial: "Steel", yearBuilt: "", guestCapacity: "", crewCapacity: "", builderName: "", classificationSociety: "", exteriorDesignerName: "", interiorDesignerName: "", navalArchitectName: "" });
  useEffect(() => { if (intent && intent.openYacht) { setSel(intent.openYacht); setYTab("overview"); setEditing(false); } if (clearIntent) clearIntent(); }, []);
  const types = ["All", "Motor", "Sail"];
  const handleExport = () => {
    if (!allY.length) { alert("No yachts to export with the current filters."); return; }
    const withSerials = allY.map(y => ({ ...y, serial: getSerial(y) }));
    exportYachtsToExcel(withSerials, getOwner, getCompany, getYachtStatus, () => {});
  };
  const handleImport = (file) => {
    if (!file) return;
    const ownerByName = {}; (owners || []).forEach(o => { if (o.name) ownerByName[String(o.name).toLowerCase()] = o.id; if (o.fullName) ownerByName[String(o.fullName).toLowerCase()] = o.id; });
    const companyByName = {}; (companies || []).forEach(c => { if (c.name) companyByName[String(c.name).toLowerCase()] = c.id; });
    importYachtsFromExcel(file, (rows) => {
      if (!rows.length) { alert("No valid yacht rows found. Ensure the sheet has a 'Vessel Name' column."); return; }
      const cleaned = rows.map((r, k) => ({
        ...r, name: (r.name || "").toUpperCase(), type: r.type || "Motor", category: r.category || "Pleasure",
        status: r.status || "Inactive", forSale: r.forSale ?? false, prevNames: r.prevNames || [],
        serial: r.serial || padSerial(parseInt(/(\d+)\s*$/.exec(nextYachtSerial(yachts))?.[1] || "1") + k),
      }));
      if (importYachts) importYachts(cleaned);
      else { cleaned.forEach(addYacht); alert(`Imported ${cleaned.length} yacht(s).`); }
    }, () => alert("Could not read the spreadsheet. Save it as .xlsx or .csv and try again."), { ownerByName, companyByName });
  };
  const [gtClass, setGtClass] = useState("all");
  const getYachtStatus = (y) => liveOps.some(o => o.yachtId === y.id && ["Active", "Upcoming", "Enquiry"].includes(o.status)) ? "Active" : "Inactive";
  const gtFilter = y => gtClass === "all" || (gtClass === "above" ? tonnageOf(y) >= 300 : tonnageOf(y) < 300);
  const allY = yachts.filter(y => (tf === "All" || y.type === tf) && gtFilter(y) && (s === "" || y.name.toLowerCase().includes(s.toLowerCase()) || (y.imo || "").includes(s) || (y.flag || "").toLowerCase().includes(s.toLowerCase()) || (y.serial || yachtSerial(y, yachts.indexOf(y))).toLowerCase().includes(s.toLowerCase())) && (!tagFilter || (y.tags || []).includes(tagFilter)));
  const yachtTagsInUse = [...new Set(yachts.flatMap(y => y.tags || []))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const getOwner = oid => (owners.find(o => o.id === oid) || {}).name || "—";
  const getCompany = cid => (companies.find(c => c.id === cid) || {}).name || "";
  // Find a company by name (case-insensitive) across the directory + DB; if it's a
  // genuinely new custom entry, auto-create a profile in the Companies module and return
  // it so the calling field (yacht profile OR the quick "Add yacht" form) can link to it.
  const ensureCompany = (name, type) => {
    const nm = (name || "").trim();
    if (!nm) return null;
    const existing = companies.find(c => (c.name || "").toLowerCase() === nm.toLowerCase());
    if (existing) return existing;
    if (!addCompany) return null;
    return addCompany({ name: nm, type, country: "" }) || null;
  };
  // For the multi-value designer/architect fields: auto-create a Companies-module profile
  // for any comma-separated name that isn't one of the predefined options (a custom entry).
  const ensureCustomDesigners = (v, optList, type) => {
    (v || "").split(",").map(s => s.trim()).filter(Boolean).forEach(nm => {
      if (!optList.some(o => o.toLowerCase() === nm.toLowerCase())) ensureCompany(nm, type);
    });
  };
  const serialById = useMemo(() => { const m = {}; yachts.forEach((y, i) => { m[y.id] = yachtSerial(y, i); }); return m; }, [yachts]);
  const getSerial = (y) => (y && (y.serial || serialById[y.id])) || yachtSerial(y);
  const handleAdd = () => { if (!ny.name || !ny.loa || !ny.gt) { alert("Required fields: Vessel name, LOA, and GT"); return; } const serial = nextYachtSerial(yachts); const upName = (ny.name || "").toUpperCase(); addYacht({ ...ny, name: upName, serial, loa: parseFloat(ny.loa) || 0, gt: parseFloat(ny.gt) || 0, beam: parseFloat(ny.beam) || 0, draught: parseFloat(ny.draught) || 0, yearBuilt: parseInt(ny.yearBuilt) || 0, guestCapacity: parseInt(ny.guestCapacity) || 0, crewCapacity: parseInt(ny.crewCapacity) || 0, status: "Inactive", forSale: false, prevNames: [] }); alert("Yacht \"" + upName + "\" added to database — Vessel ID " + serial + " (" + ny.gt + " GT, " + ny.flag + " flag)"); setNy({ name: "", type: "Motor", category: "Pleasure", loa: "", gt: "", flag: "", imo: "", beam: "", draught: "", hullMaterial: "Steel", yearBuilt: "", guestCapacity: "", crewCapacity: "", builderName: "", classificationSociety: "", exteriorDesignerName: "", interiorDesignerName: "", navalArchitectName: "" }); setAdding(false); };

  if (sel) {
    const y = yachts.find(x => x.id === sel);
    if (!y) { setSel(null); return null; }
    const owner = owners.find(o => o.id === y.ownerId);
    const yOps = liveOps.filter(o => o.yachtId === y.id);
    const yTransits = TRANSITS.filter(t => yOps.some(op => op.id === t.opId));
    const status = getYachtStatus(y);
    const gc = id => (companies.find(c => c.id === id) || {}).name || "—";
    const docs = y.documents || [];
    const validDocs = docs.filter(d => !d.expiry || new Date(d.expiry) > new Date());
    const expiringDocs = docs.filter(d => d.expiry && new Date(d.expiry) < new Date("2027-01-01") && new Date(d.expiry) > new Date());
    const expiredDocs = docs.filter(d => d.expiry && new Date(d.expiry) < new Date());
    const totalRev = yOps.reduce((s, o) => s + (o.totalRevenue || 0), 0);
    const allPorts = [...new Set(yOps.flatMap(o => o.ports || []))];
    const lastOp = yOps.filter(o => o.eta).sort((a, b) => b.eta.localeCompare(a.eta))[0];
    const hasNDA = docs.some(d => d.name && /nda|non-disclosure|confidential/i.test(d.name) && (!d.expiry || new Date(d.expiry) > new Date()));
    const isReturning = !!y.scaFileNumber || yTransits.length > 0;
    const motherShip = y.motherShipId ? yachts.find(m => m.id === y.motherShipId) : null;
    const canDelete = yOps.length === 0;
    const startEdit = () => { setEditData({ ...y }); setEditing(true); };
    const cancelEdit = () => setEditing(false);
    const saveEdit = () => {
      const errs = tonnageErrors(editData);
      if (Object.keys(errs).length) { alert("Cannot save \u2014 tonnage values break the rule:\n\u2022 " + Object.values(errs).join("\n\u2022 ")); return; }
      const cleaned = { ...editData, name: (editData.name || "").toUpperCase() };
      if (updYacht) updYacht(y.id, cleaned);
      setEditing(false);
    };
    const ed = editing ? editData : y;
    const Row = ({ label, val, field, link, numeric9, imo, callSign, onClick, tonnage, tonnageError }) => {
      const raw = editData[field] || "";
      const invalid9 = numeric9 && raw.length > 0 && raw.length !== 9;
      const imoRaw = imo ? imoDigits(raw) : "";
      const invalidImo = imo && imoRaw.length > 0 && imoRaw.length !== 7;
      const csRaw = callSign ? cleanCallSign(raw) : "";
      const invalidCs = callSign && csRaw.length > 0 && !isValidCallSign(csRaw);
      const showErr = invalid9 || invalidImo || invalidCs || (tonnage && tonnageError);
      const clickable = !editing && onClick && val && val !== "\u2014";
      return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
        <span style={{ color: S.textS }}>{label}</span>
        {editing && field ? <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            {imo && <span style={{ fontSize: 12, fontWeight: 500, color: S.textS, marginRight: 3 }}>IMO</span>}
            <input value={imo ? imoRaw : callSign ? csRaw : raw} inputMode={(numeric9 || imo || tonnage) ? "numeric" : undefined} maxLength={numeric9 ? 9 : imo ? 7 : callSign ? 7 : undefined}
              placeholder={numeric9 ? "9 digits, e.g. 367123456" : imo ? "7 digits, e.g. 8712345" : callSign ? "e.g. ABC1234" : undefined}
              onChange={e => setEditData(prev => ({ ...prev, [field]: numeric9 ? e.target.value.replace(/\D/g, "").slice(0, 9) : imo ? formatIMO(e.target.value) : callSign ? cleanCallSign(e.target.value) : tonnage ? e.target.value.replace(/[^\d.]/g, "") : e.target.value }))}
              style={{ textAlign: "right", border: `1px solid ${showErr ? S.red : S.brand + "40"}`, borderRadius: 3, padding: "2px 6px", fontSize: 12, fontWeight: 500, background: S.surface, width: imo ? 150 : 180 }} />
          </span>
          {invalid9 && <span style={{ fontSize: 10, color: S.red }}>MMSI must be exactly 9 digits</span>}
          {invalidImo && <span style={{ fontSize: 10, color: S.red }}>IMO must be exactly 7 digits</span>}
          {invalidCs && <span style={{ fontSize: 10, color: S.red }}>Not a valid ITU call sign format</span>}
          {tonnage && tonnageError && <span style={{ fontSize: 10, color: S.red, maxWidth: 200, textAlign: "right" }}>{tonnageError}</span>}
        </span> : (clickable
          ? <span onClick={onClick} style={{ fontWeight: 500, color: S.brand, cursor: "pointer", textDecoration: "underline", textDecorationColor: S.brand + "55", textUnderlineOffset: 2 }}>{val}</span>
          : <span style={{ fontWeight: 500, color: link ? S.brand : S.text }}>{imo ? (formatIMO(val) || "\u2014") : (val || "\u2014")}</span>)}
      </div>;
    };
    // Tonnage rule: NT <= GT, SCNT <= SCGT, and GT <= SCGT. Returns a map of field -> error message.
    const tonnageErrors = (d) => {
      const num = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
      const nt = num(d.nt), gt = num(d.gt), scnt = num(d.scnt), scgt = num(d.scgt);
      const e = {};
      if (nt != null && gt != null && nt > gt) e.nt = "Net tonnage can't exceed gross tonnage (GT)";
      if (scnt != null && scgt != null && scnt > scgt) e.scnt = "SC net tonnage can't exceed SC gross tonnage (SCGT)";
      if (gt != null && scgt != null && gt > scgt) e.gt = "Gross tonnage can't exceed Suez Canal gross tonnage (SCGT)";
      return e;
    };
    const tErrs = editing ? tonnageErrors(editData) : {};
    const hasTonnageErr = Object.keys(tErrs).length > 0;

    return <>
      {/* Top toolbar: Back pill + title + date */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <button onClick={() => { if (navDepth > 0 && goBack) { goBack(); } else { setSel(null); setYTab("overview"); setEditing(false); } }} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${S.border}`, background: S.surface, color: S.navy, boxShadow: "0 1px 3px rgba(15,30,50,0.08)", flexShrink: 0 }}><ChevronLeft size={17} /> {navDepth > 0 ? `Back to ${backLabel || "previous"}` : "Back"}</button>
          <div style={{ fontSize: 24, fontWeight: 700, color: S.navy, letterSpacing: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(y.name || "").toUpperCase()}</div>
        </div>
        <div style={{ fontSize: 13, color: S.textS, flexShrink: 0 }}>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
      </div>
      {/* Breadcrumb row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span onClick={() => { setSel(null); setYTab("overview"); setEditing(false); }} style={{ color: S.brand, cursor: "pointer", fontWeight: 500 }}>Yacht Directory</span>
          <ChevronRight size={13} color={S.textH} />
          <span style={{ color: S.textH, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(y.name || "").toUpperCase()}</span>
        </div>
        {owner && openOwner && <span onClick={() => openOwner(owner.id, { mod: "yachts", type: "yacht", id: y.id })} style={{ fontSize: 13, color: S.brand, cursor: "pointer", flexShrink: 0 }}>View in Persons DB</span>}
      </div>
      {/* Hero header */}
      <div style={{ position: "relative", background: y.photo ? `linear-gradient(90deg, rgba(20,30,40,0.78) 0%, rgba(28,40,52,0.55) 30%, rgba(40,56,70,0.18) 62%, rgba(40,56,70,0.05) 100%), linear-gradient(0deg, rgba(15,22,30,0.55) 0%, rgba(15,22,30,0) 45%), url(${y.photo})` : "linear-gradient(135deg, #2C3E50, #354A5F, #4A6274)", backgroundSize: "cover", backgroundPosition: "center", borderRadius: 8, padding: "16px 20px", marginBottom: 12, color: "#fff", minHeight: y.photo ? 300 : undefined, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: y.type === "Sail" ? "rgba(93,202,165,0.3)" : "rgba(55,138,221,0.3)", color: "#fff" }}>{y.type === "Sail" ? "Sail Yacht" : "Motor Yacht"}</span>
          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: tonnageOf(y) >= 300 ? "rgba(239,159,39,0.3)" : "rgba(99,153,34,0.3)", color: tonnageOf(y) >= 300 ? "#FAC775" : "#C0DD97", fontWeight: 500 }}>{tonnageOf(y) >= 300 ? "≥ 300 GT" : "< 300 GT"}</span>
          {y.category && <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "rgba(255,255,255,0.15)", color: "#ddd" }}>{y.category}</span>}
          {isReturning ? <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "rgba(99,153,34,0.3)", color: "#C0DD97" }}>Return vessel</span> : <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "rgba(226,75,74,0.3)", color: "#F09595" }}>1st SC Transit</span>}
          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: status === "Active" ? "rgba(99,153,34,0.4)" : "rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: status === "Active" ? "#97C459" : "#888" }}></span>{status === "Active" ? "Active Ops" : "No Activity"}</span>
          {y.charterable && y.charterPrice && <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "rgba(99,153,34,0.3)", color: "#C0DD97" }}>Charter · {y.charterPrice}</span>}
          {y.forSale && <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "rgba(239,159,39,0.3)", color: "#FAC775" }}>For sale · {y.askingPrice || "POA"}</span>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
          <div>
            {editing ? <input value={editData.name || ""} onChange={e => setEditData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))} style={{ fontSize: 24, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4, padding: "2px 8px", color: "#fff", width: 300 }} /> : <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: 1, textShadow: y.photo ? "0 2px 10px rgba(0,0,0,0.6)" : "none" }}>{(y.name || "").toUpperCase()}</div>}
            <div style={{ fontSize: 11, fontFamily: "monospace", opacity: 0.85, marginTop: 3, letterSpacing: 0.5, textShadow: y.photo ? "0 1px 4px rgba(0,0,0,0.6)" : "none" }}>Vessel ID {getSerial(y)}</div>
            {y.prevNames?.length > 0 && <div style={{ fontSize: 11, opacity: 0.8, textShadow: y.photo ? "0 1px 4px rgba(0,0,0,0.6)" : "none" }}>Previously: {y.prevNames.join(", ")}</div>}
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2, textShadow: y.photo ? "0 1px 4px rgba(0,0,0,0.6)" : "none" }}>{gc(y.builderId) !== "—" ? gc(y.builderId) : ""}{y.yearBuilt ? ` · ${y.yearBuilt}` : ""}{y.flag ? ` · ${y.flag}` : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {!editing && <>
              <button onClick={() => onCreateOp ? onCreateOp(y) : alert("New operation")} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: "#1F6FB2", color: "#fff", backdropFilter: "blur(3px)" }}><Plus size={13} /> New Operation</button>
              <button onClick={() => { const tOp = lastOp || yOps[0]; if (tOp && nav) nav("voyage", tOp.id); else if (onCreateOp) { if (confirm("No operation exists for " + y.name + " yet. Create one to plan a voyage?")) onCreateOp(y); } }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: "rgba(45,122,90,0.95)", color: "#fff", backdropFilter: "blur(3px)" }}><Navigation size={13} /> Track Vessel</button>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: "rgba(60,80,96,0.92)", color: "#fff", backdropFilter: "blur(3px)" }}><ImageIcon size={13} /> Add Photos<input type="file" accept="image/*" multiple onChange={e => { const files = Array.from(e.target.files || []); files.forEach(f => fileToDataUrl(f, d => { if (!y.photo) updYacht(y.id, { photo: d, photoDate: new Date().toISOString().slice(0, 10) }); else updYacht(y.id, { gallery: [...(Array.isArray(y.gallery) ? y.gallery : []), { id: "g" + Date.now() + Math.random().toString(36).slice(2, 6), src: d, caption: "", date: new Date().toISOString().slice(0, 10) }] }); })); e.target.value = ""; }} style={{ display: "none" }} /></label>
              <button onClick={startEdit} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: "rgba(239,159,39,0.95)", color: "#fff", backdropFilter: "blur(3px)" }}><Edit3 size={13} /> Edit</button>
            </>}
            {editing && <><button onClick={cancelEdit} style={{ padding: "8px 13px", borderRadius: 6, fontSize: 11, cursor: "pointer", border: "1px solid rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.25)", color: "#fff" }}>Cancel</button><button onClick={saveEdit} disabled={hasTonnageErr} title={hasTonnageErr ? "Resolve the tonnage rule violation to save" : undefined} style={{ padding: "8px 13px", borderRadius: 6, fontSize: 11, cursor: hasTonnageErr ? "not-allowed" : "pointer", border: "none", background: hasTonnageErr ? "rgba(255,255,255,0.25)" : "#4CAF50", color: hasTonnageErr ? "rgba(255,255,255,0.6)" : "#fff", fontWeight: 600 }}>Save</button></>}
            {!editing && <button onClick={() => canDelete ? alert("Yacht deleted from database.") : alert("Cannot delete \"" + y.name + "\" — referenced by " + yOps.length + " operation(s): " + yOps.map(o => o.opNumber).join(", "))} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: canDelete ? "rgba(196,52,52,0.92)" : "rgba(255,255,255,0.12)", color: canDelete ? "#fff" : "rgba(255,255,255,0.4)", backdropFilter: "blur(3px)" }}><Trash2 size={13} /> Delete</button>}
          </div>
        </div>
      </div>

      {hasNDA && <div style={{ background: "#FDF6E3", border: "1px solid #D4A72C", borderRadius: 6, padding: "6px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <Lock size={13} color="#D4A72C" />
        <span style={{ color: "#8B6914", fontWeight: 500 }}>Confidential — NDA in effect</span>
        <span style={{ color: "#A68B3A", fontSize: 11 }}>This vessel has an active non-disclosure agreement. Handle information accordingly.</span>
      </div>}

      {motherShip && <div style={{ background: S.blueBg, borderRadius: 6, padding: "6px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: S.blue }}>
        <Ship size={13} /> Tender of <span style={{ fontWeight: 500 }}>{motherShip.name}</span> ({motherShip.loa}m · {motherShip.gt} GT · {motherShip.flag})
      </div>}

      {editing && <div style={{ background: `${S.brand}15`, border: `1px solid ${S.brand}40`, borderRadius: 6, padding: "6px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <Edit3 size={13} color={S.brand} />
        <span style={{ color: S.brand, fontWeight: 500 }}>Editing mode</span>
        <span style={{ color: S.textS }}>— fields with values are now editable. Click Save to apply changes.</span>
      </div>}

      {/* Spec strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 1, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, marginBottom: 12, overflow: "hidden" }}>
        {[["LOA", `${ed.loa}m`], ["Beam", ed.beam ? `${ed.beam}m` : "—"], ["Draught", ed.draught ? `${ed.draught}m` : "—"], ["NT", ed.nt || "—"], ["GT", ed.gt || "—"], ["SCNT", ed.scnt || "—"], ["SCGT", ed.scgt || "—"], ["Max spd", ed.maxSpeed ? `${ed.maxSpeed}kn` : "—"], ["Guests", ed.guestCapacity || "—"], ["Crew", ed.crewCapacity || "—"]].map(([l, v]) => (
          <div key={l} style={{ padding: "8px 4px", textAlign: "center", borderRight: `1px solid ${S.borderL}` }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
            <div style={{ fontSize: 9, color: S.textH, textTransform: "uppercase" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: S.textH, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Tags</span>
          <TagBox tags={y.tags} allTags={allTags} onChange={t => updYacht(y.id, { tags: t })} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${S.border}`, marginBottom: 12 }}>
        {[["overview", "Overview"], ["technical", "Technical"], ["commercial", "Commercial"], ["gallery", `Gallery (${(y.photo ? 1 : 0) + (Array.isArray(y.gallery) ? y.gallery.length : 0)})`], ["documents", "Documents"], ["history", "History"]].map(([k, l]) => (
          <button key={k} onClick={() => setYTab(k)} style={{ padding: "8px 16px", fontSize: 12, cursor: "pointer", border: "none", background: "transparent", color: yTab === k ? S.brand : S.textS, fontWeight: yTab === k ? 500 : 400, borderBottom: `2px solid ${yTab === k ? S.brand : "transparent"}`, marginBottom: -1 }}>{l}</button>
        ))}
      </div>

      {yTab === "overview" && (() => {
        // For the multi-value designer/architect fields: any name that isn't one of the
        // predefined options is treated as a custom entry → ensure a Companies-module profile.
        const handleDesignerChange = (v, nameField, optList, type) => {
          ensureCustomDesigners(v, optList, type);
          setEditData(prev => ({ ...prev, [nameField]: v, [nameField.replace("Name", "Id")]: "" }));
        };
        const companySelect = (label, field, filterType) => {
          const val = ed[field];
          const resolved = gc(val);
          const builderName = field === "builderId" ? (resolved !== "\u2014" ? resolved : ed.builderName || "") : "";
          const displayName = field === "builderId" && builderName ? builderName : resolved;
          const opts = companies.filter(c => !filterType || c.type === filterType || val === c.id);
          if (editing) {
            if (filterType === "Builder") {
              return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
                <span style={{ color: S.textS }}>{label}</span>
                <div><SearchSelect value={builderName || ""} options={BUILDERS} placeholder="Select / search shipyard..." onChange={(name) => {
                  const nm = (name || "").trim();
                  if (!nm) { setEditData(prev => ({ ...prev, builderId: "", builderName: "" })); return; }
                  const existing = companies.find(c => (c.name || "").toLowerCase() === nm.toLowerCase());
                  const isCustom = !BUILDERS.some(b => b.toLowerCase() === nm.toLowerCase());
                  const co = existing || (isCustom ? ensureCompany(nm, "Builder") : null);
                  setEditData(prev => co ? { ...prev, builderId: co.id, builderName: co.name } : { ...prev, builderId: "", builderName: nm });
                }} /></div>
              </div>;
            }
            return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>{label}</span>
              <SearchSelect value={val ? (opts.find(c => c.id === val)?.name || "") : ""} options={opts.map(c => c.name)} placeholder="— None —" width={200} onChange={(name) => { const c = opts.find(x => x.name === name); setEditData(prev => ({ ...prev, [field]: c ? c.id : "" })); }} />
            </div>;
          }
          return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
            <span style={{ color: S.textS }}>{label}</span>
            {displayName !== "\u2014" ? <span onClick={() => { const c = companies.find(x => x.id === val); if (c && openCompany) openCompany(c.id, { mod: "yachts", type: "yacht", id: y.id }); else alert(displayName + " (not in company directory)"); }} style={{ fontWeight: 500, color: S.brand, cursor: "pointer", textDecoration: "underline", textDecorationColor: S.brand + "55", textUnderlineOffset: 2 }}>{displayName}</span> : <span style={{ color: S.textH }}>{"\u2014"}</span>}
          </div>;
        };
        const dispDesigner = (idField, nameField) => {
          const nm = (ed[nameField] || "").trim();
          if (nm) return ed[nameField];
          const r = gc(ed[idField]);
          return r !== "—" ? r : "";
        };
        // Resolve a single designer/architect to a company-directory profile (by id, or by exact
        // name match for free-text entries). Returns null for blanks, multi-value, or non-directory names.
        const designerCompanyId = (idField, nameField) => {
          const id = ed[idField];
          if (id) { const c = companies.find(x => x.id === id); if (c) return c.id; }
          const nm = (ed[nameField] || "").trim();
          if (nm && !nm.includes(",")) { const c = companies.find(x => (x.name || "").toLowerCase() === nm.toLowerCase()); if (c) return c.id; }
          return null;
        };
        const designerOnClick = (idField, nameField) => {
          const cid = designerCompanyId(idField, nameField);
          return (cid && openCompany) ? () => openCompany(cid, { mod: "yachts", type: "yacht", id: y.id }) : undefined;
        };
        const ownerSelect = () => {
          if (editing) return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
            <span style={{ color: S.textS }}>Owner</span>
            <SearchSelect value={ed.ownerId ? (owners.find(o => o.id === ed.ownerId)?.name || "") : ""} options={owners.map(o => o.name)} placeholder="— None —" width={200} onChange={(name) => { const o = owners.find(x => x.name === name); setEditData(prev => ({ ...prev, ownerId: o ? o.id : "" })); }} />
          </div>;
          return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
            <span style={{ color: S.textS }}>Owner</span>
            {owner ? <span onClick={() => { if (openOwner) openOwner(owner.id, { mod: "yachts", type: "yacht", id: y.id }); }} style={{ fontWeight: 500, color: S.brand, cursor: "pointer", textDecoration: "underline", textDecorationColor: S.brand + "55", textUnderlineOffset: 2 }}>{owner.name}</span> : <span style={{ color: S.textH }}>{"\u2014"}</span>}
          </div>;
        };
        return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <Section title="Build & design">
            {companySelect("Builder / Shipyard", "builderId", "Builder")}
            {editing ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>Exterior Designer</span>
              <MultiSearchSelect value={dispDesigner("exteriorDesignerId", "exteriorDesignerName")} options={EXTERIOR_DESIGNERS} placeholder="Select / search designer(s)..." width={220} onChange={(v) => handleDesignerChange(v, "exteriorDesignerName", EXTERIOR_DESIGNERS, "Exterior Designer")} />
            </div> : <Row label="Exterior Designer" val={dispDesigner("exteriorDesignerId", "exteriorDesignerName")} onClick={designerOnClick("exteriorDesignerId", "exteriorDesignerName")} />}
            {editing ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>Interior Designer</span>
              <MultiSearchSelect value={dispDesigner("interiorDesignerId", "interiorDesignerName")} options={INTERIOR_DESIGNERS} placeholder="Select / search designer(s)..." width={220} onChange={(v) => handleDesignerChange(v, "interiorDesignerName", INTERIOR_DESIGNERS, "Interior Designer")} />
            </div> : <Row label="Interior Designer" val={dispDesigner("interiorDesignerId", "interiorDesignerName")} onClick={designerOnClick("interiorDesignerId", "interiorDesignerName")} />}
            {editing ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>Naval Architect</span>
              <MultiSearchSelect value={dispDesigner("navalArchitectId", "navalArchitectName")} options={NAVAL_ARCHITECTS} placeholder="Select / search architect(s)..." width={220} onChange={(v) => handleDesignerChange(v, "navalArchitectName", NAVAL_ARCHITECTS, "Naval Architect")} />
            </div> : <Row label="Naval Architect" val={dispDesigner("navalArchitectId", "navalArchitectName")} onClick={designerOnClick("navalArchitectId", "navalArchitectName")} />}
            {editing ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>Year Built</span>
              <SearchSelect value={ed.yearBuilt ? String(ed.yearBuilt) : ""} options={YEARS} placeholder="Select year..." width={140} onChange={(v) => setEditData(prev => ({ ...prev, yearBuilt: v }))} />
            </div> : <Row label="Year Built" val={ed.yearBuilt} />}
            {editing ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>Model</span>
              <div><SearchSelect value={ed.model || ""} options={YACHT_MODELS} placeholder="Select / search model..." onChange={(m) => setEditData(prev => ({ ...prev, model: m }))} /></div>
            </div> : <Row label="Model" val={ed.model} />}
            {editing ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>Hull Material</span>
              <MultiSelect value={ed.hullMaterial || ""} options={HULL_MATERIALS} placeholder="Select material(s)..." width={226} onChange={(v) => setEditData(prev => ({ ...prev, hullMaterial: v }))} />
            </div> : <Row label="Hull Material" val={ed.hullMaterial} />}
            {editing ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>Superstructure</span>
              <MultiSelect value={ed.superstructureMaterial || ""} options={SUPERSTRUCTURE_MATERIALS} placeholder="Select material(s)..." width={226} onChange={(v) => setEditData(prev => ({ ...prev, superstructureMaterial: v }))} />
            </div> : <Row label="Superstructure" val={ed.superstructureMaterial} />}
            {editing ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>Classification Society</span>
              <SearchSelect value={ed.classificationSociety || ""} options={CLASS_SOCIETIES} placeholder="— Select —" width={220} onChange={(v) => setEditData(prev => ({ ...prev, classificationSociety: v }))} />
            </div> : <Row label="Classification Society" val={ed.classificationSociety} />}
          </Section>
          <SCTransitCard yacht={y} ops={liveOps} allYachts={yachts} updYacht={updYacht} nav={nav} />
        </div>
        <div>
          <Section title="Ownership & registration">
            <Row label="Vessel Category" val={ed.category} field="category" />
            <Row label="Activity Level" val={status} />
            <OwnershipEditor
              value={normalizeOwnership(ed, getOwner)}
              editing={editing}
              owners={owners}
              companies={companies}
              openOwner={openOwner ? (id) => openOwner(id, { mod: "yachts", type: "yacht", id: y.id }) : undefined}
              onChange={(arr) => { const p = primaryOwner(arr); setEditData(prev => ({ ...prev, ownership: arr, ownerId: (p && p.type === "Person" && p.id) ? p.id : "", ownerName: p ? p.name : "" })); }}
            />
            {companySelect("Management", "managementId", "Management")}
            {editing ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>Flag State</span>
              <SearchSelect value={ed.flag || ""} options={FLAG_COUNTRIES} placeholder="— Select —" width={200} onChange={(v) => setEditData(prev => ({ ...prev, flag: v }))} />
            </div> : <Row label="Flag State" val={ed.flag} />}
            <Row label="IMO Number" val={ed.imo} field="imo" imo />
            <Row label="MMSI" val={ed.mmsi} field="mmsi" numeric9 />
            <Row label="Call Sign" val={ed.callSign} field="callSign" callSign />
            <Row label="Official Number" val={ed.officialNumber} field="officialNumber" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}>
              <span style={{ color: S.textS }}>AIS Tracking</span>
              {y.imo ? <div style={{ display: "flex", gap: 8 }}>
                <span onClick={() => window.open("https://www.marinetraffic.com/en/ais/details/ships/imo:" + imoDigits(y.imo), "_blank")} style={{ fontWeight: 500, color: S.brand, cursor: "pointer" }}>MarineTraffic {"\u2197"}</span>
                <span onClick={() => window.open("https://www.vesselfinder.com/vessels?name=" + imoDigits(y.imo), "_blank")} style={{ fontWeight: 500, color: S.brand, cursor: "pointer" }}>VesselFinder {"\u2197"}</span>
              </div> : <span style={{ color: S.textH }}>{"\u2014"}</span>}
            </div>
          </Section>
          <Section title="GT impact \u2014 what this vessel's tonnage drives">
            {(() => { const ton = resolveTonnage(y); const T = ton.value; return <>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 11 }}><span style={{ color: S.textS }}>Tonnage basis</span><span style={{ fontWeight: 500, color: ton.missingSC ? S.red : S.text }}>{ton.basis} {T.toLocaleString()}{ton.missingSC ? " (no SC tonnage — using GT)" : ""}</span></div>
            {T >= 300 ? <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>Transit method</span><span style={{ fontWeight: 500, color: S.orange }}>SDR slab table (≥ 300)</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>Mooring tariff</span><span style={{ fontWeight: 500 }}>{T < 1500 ? "$2,500" : "$3,500 (mooring + lighting)"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>Pilotage</span><span style={{ fontWeight: 500 }}>{T <= 999 ? "$97 / $167" : "$178 / $273"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>ETR</span><span style={{ fontWeight: 500 }}>$500</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>Environmental</span><span style={{ fontWeight: 500 }}>$200/CBM</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>Sea trial (if 1st transit)</span><span style={{ fontWeight: 500 }}>{T <= 900 ? "$340" : "$2,000"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12 }}><span style={{ color: S.textS }}>Ismailia stop default</span><span style={{ fontWeight: 500 }}>No</span></div>
            </> : <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>Transit method</span><span style={{ fontWeight: 500, color: S.green }}>{"LOA-based (< 300)"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>Transit dues</span><span style={{ fontWeight: 500, color: S.brand }}>SCA tonnage formula (see calculator below)</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>ETR</span><span style={{ fontWeight: 500, color: S.green }}>EXEMPT</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>Environmental</span><span style={{ fontWeight: 500, color: S.green }}>EXEMPT</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12 }}><span style={{ color: S.textS }}>Sea trial</span><span style={{ fontWeight: 500, color: S.green }}>EXEMPT</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12 }}><span style={{ color: S.textS }}>Ismailia stop default</span><span style={{ fontWeight: 500 }}>Yes</span></div>
            </>}
            </>; })()}
          </Section>
          {tonnageOf(y) < 300 && <SuezDuesCalculator yacht={y} />}
        </div>
      </div>;
      })()}

      {yTab === "technical" && <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Section title="Dimensions">
            <Row label="Length Overall (LOA)" val={ed.loa ? `${ed.loa} m` : null} field="loa" />
            <Row label="Beam / Width" val={ed.beam ? `${ed.beam} m` : null} field="beam" />
            <Row label="Draught" val={ed.draught ? `${ed.draught} m` : null} field="draught" />
            <Row label="Net Tonnage" val={ed.nt ? `${ed.nt} NT` : null} field="nt" tonnage tonnageError={tErrs.nt} />
            <Row label="Gross Tonnage" val={ed.gt ? `${ed.gt} GT` : null} field="gt" tonnage tonnageError={tErrs.gt} />
            <Row label="Suez Canal Net Tonnage (SCNT)" val={ed.scnt ? `${ed.scnt} SCNT` : null} field="scnt" tonnage tonnageError={tErrs.scnt} />
            <Row label="Suez Canal Gross Tonnage (SCGT)" val={ed.scgt ? `${ed.scgt} SCGT` : null} field="scgt" tonnage tonnageError={tErrs.scgt} />
          </Section>
          <Section title="Performance">
            <Row label="Engines" val={ed.engines} field="engines" />
            <Row label="Maximum Speed" val={ed.maxSpeed ? `${ed.maxSpeed} knots` : null} field="maxSpeed" />
            <Row label="Cruising Speed" val={ed.cruisingSpeed ? `${ed.cruisingSpeed} knots` : null} field="cruisingSpeed" />
            <Row label="Range" val={ed.range ? `${ed.range.toLocaleString()} nm` : null} field="range" />
            <Row label="Fuel Capacity" val={ed.fuelCapacity ? `${ed.fuelCapacity.toLocaleString()} litres` : null} field="fuelCapacity" />
          </Section>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
          <StatCard val={y.guestCapacity || 0} label="Guests" color={S.green} />
          <StatCard val={y.crewCapacity || 0} label="Crew" color={S.green} />
          <StatCard val={y.guestCapacity && y.crewCapacity ? (y.crewCapacity / y.guestCapacity).toFixed(1) : "—"} label="Crew ratio" color={S.green} />
        </div>
      </div>}

      {yTab === "commercial" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Section title="Sales">
          <Row label="For Sale" val={y.forSale ? "Yes" : "No"} />
          {y.forSale && y.askingPrice && <Row label="Asking Price" val={y.askingPrice} />}
          <Row label="Central Agent" val={gc(y.centralAgentId)} link onClick={y.centralAgentId ? () => openCompany && openCompany(y.centralAgentId, { mod: "yachts", type: "yacht", id: y.id }) : undefined} />
          <Row label="Broker" val={gc(y.brokerId)} link onClick={y.brokerId ? () => openCompany && openCompany(y.brokerId, { mod: "yachts", type: "yacht", id: y.id }) : undefined} />
        </Section>
        <Section title="Charter">
          <Row label="Available for Charter" val={y.charterable ? "Yes" : "No"} />
          {y.charterable && <Row label="Charter Price" val={y.charterPrice} />}
          <Row label="Management Company" val={gc(y.managementId)} link onClick={y.managementId ? () => openCompany && openCompany(y.managementId, { mod: "yachts", type: "yacht", id: y.id }) : undefined} />
        </Section>
      </div>}

      {yTab === "gallery" && (() => {
        const today = () => new Date().toISOString().slice(0, 10);
        // Photos are stored as: y.photo = main image (kept in sync with the directory card/table & hero),
        // y.gallery = array of { id, src, caption, date } for the remaining photos.
        const extra = Array.isArray(y.gallery) ? y.gallery : [];
        // Unified list with the main photo first.
        const photos = [
          ...(y.photo ? [{ id: "__main__", src: y.photo, caption: y.photoCaption || "", date: y.photoDate || "", main: true }] : []),
          ...extra.map(g => ({ ...g, main: false })),
        ];
        const count = photos.length;
        const addPhotos = (fileList) => {
          const files = Array.from(fileList || []);
          files.forEach(f => fileToDataUrl(f, d => {
            // If there's no main yet, the first upload becomes the main photo.
            if (!y.photo) { updYacht(y.id, { photo: d, photoCaption: "", photoDate: today() }); }
            else { updYacht(y.id, { gallery: [...(Array.isArray(y.gallery) ? y.gallery : []), { id: "g" + Date.now() + Math.random().toString(36).slice(2, 6), src: d, caption: "", date: today() }] }); }
          }));
        };
        const setMain = (p) => {
          if (p.main) return;
          const rest = extra.filter(g => g.id !== p.id);
          // demote current main into the gallery list, promote the chosen one
          const demoted = y.photo ? [{ id: "g" + Date.now(), src: y.photo, caption: y.photoCaption || "", date: y.photoDate || "" }] : [];
          updYacht(y.id, { photo: p.src, photoCaption: p.caption || "", photoDate: p.date || today(), gallery: [...demoted, ...rest] });
        };
        const removePhoto = (p) => {
          if (p.main) {
            // promote the first gallery photo to main, if any
            const [next, ...rest] = extra;
            if (next) updYacht(y.id, { photo: next.src, photoCaption: next.caption || "", photoDate: next.date || "", gallery: rest });
            else updYacht(y.id, { photo: "", photoCaption: "", photoDate: "", gallery: [] });
          } else {
            updYacht(y.id, { gallery: extra.filter(g => g.id !== p.id) });
          }
        };
        const setCaption = (p, val) => {
          if (p.main) updYacht(y.id, { photoCaption: val });
          else updYacht(y.id, { gallery: extra.map(g => g.id === p.id ? { ...g, caption: val } : g) });
        };
        const uploadBtn = <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: S.navy, color: "#fff" }}><ImageIcon size={14} /> Upload Photos<input type="file" accept="image/*" multiple onChange={e => { addPhotos(e.target.files); e.target.value = ""; }} style={{ display: "none" }} /></label>;
        return <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: S.navy, letterSpacing: 0.5, textTransform: "uppercase" }}>Photo Gallery ({count})</div>
            {uploadBtn}
          </div>

          {count === 0 ? <label style={{ display: "block", border: `2px dashed ${S.borderL}`, borderRadius: 8, padding: 48, textAlign: "center", cursor: "pointer" }}>
            <Eye size={32} color={S.textH} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: S.textS }}>No photos yet</div>
            <div style={{ fontSize: 11, color: S.textH, marginTop: 2 }}>Upload one or more photos — the first becomes the main photo shown on the directory card, table, and profile hero</div>
            <div style={{ marginTop: 12, display: "inline-block", padding: "6px 16px", borderRadius: 4, fontSize: 11, background: S.navy, color: "#fff" }}>Choose Photos</div>
            <input type="file" accept="image/*" multiple onChange={e => { addPhotos(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
          </label> : <>
            {/* Large main photo */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <img src={y.photo} alt={y.name} style={{ width: "100%", maxHeight: 380, objectFit: "cover", borderRadius: 8, display: "block", border: `1px solid ${S.border}` }} />
              <span style={{ position: "absolute", top: 12, left: 12, padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(28,40,52,0.78)", color: "#fff", backdropFilter: "blur(2px)" }}>Main Photo</span>
            </div>

            {/* Thumbnail grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {photos.map(p => (
                <div key={p.id} style={{ border: `1px solid ${p.main ? S.navy : S.border}`, borderRadius: 8, overflow: "hidden", background: S.surface }}>
                  <div style={{ position: "relative" }}>
                    <img src={p.src} alt="" style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                    {p.main
                      ? <span style={{ position: "absolute", top: 8, left: 8, padding: "3px 10px", borderRadius: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, background: "rgba(28,40,52,0.85)", color: "#fff" }}>MAIN</span>
                      : <button onClick={() => setMain(p)} style={{ position: "absolute", top: 8, left: 8, padding: "3px 10px", borderRadius: 5, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.3, cursor: "pointer", border: "none", background: "rgba(255,255,255,0.9)", color: S.navy }}>Set as main</button>}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <input value={p.caption} onChange={e => setCaption(p, e.target.value)} placeholder="Add caption..." style={{ width: "100%", border: "none", borderBottom: `1px solid ${S.borderL}`, fontSize: 12, fontStyle: p.caption ? "normal" : "italic", color: p.caption ? S.text : S.textH, padding: "2px 0", outline: "none", background: "transparent" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: S.textH }}>{p.date || "—"}</span>
                      <button onClick={() => removePhoto(p)} style={{ padding: "3px 12px", borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.red}33`, background: `${S.red}12`, color: S.red }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              {/* Add photos tile */}
              <label style={{ border: `2px dashed ${S.borderL}`, borderRadius: 8, minHeight: 218, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: S.textH }}>
                <Plus size={28} />
                <span style={{ fontSize: 12, fontWeight: 500, marginTop: 6, color: S.textS }}>Add Photos</span>
                <input type="file" accept="image/*" multiple onChange={e => { addPhotos(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
              </label>
            </div>
            <div style={{ fontSize: 11, color: S.textH, marginTop: 12 }}>The main photo appears on the vessel's card, table row, and profile hero. Set any photo as main to swap it.</div>
          </>}
        </div>;
      })()}

      {yTab === "documents" && <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
          <StatCard val={docs.length} label="Total documents" color={S.brand} />
          <StatCard val={validDocs.length} label="Valid" color={S.green} />
          <StatCard val={expiringDocs.length} label="Expiring soon" color={S.orange} />
          <StatCard val={expiredDocs.length} label="Expired" color={S.red} />
        </div>
        <Section title="Vessel documents & certificates">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button onClick={() => updYacht(y.id, { documents: [{ id: "ydoc_" + Date.now(), name: "", docType: "", issued: "", expiry: "", issuedBy: "", number: "", notes: "", fileName: "", fileData: "" }, ...(y.documents || [])] })} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: S.navy, color: "#fff" }}><Plus size={13} /> Add Document</button>
          </div>
          {docs.length > 0 ? docs.map((d, i) => (
            <YachtDocCard key={d.id || "doc" + i} doc={d}
              onCommit={(nd) => updYacht(y.id, { documents: (y.documents || []).map((x, j) => j === i ? { ...x, ...nd } : x) })}
              onRemove={() => updYacht(y.id, { documents: (y.documents || []).filter((_, j) => j !== i) })} />
          )) : <div style={{ border: `2px dashed ${S.borderL}`, borderRadius: 8, padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: S.textS }}>No documents uploaded</div>
            <div style={{ fontSize: 11, color: S.textH, marginTop: 2 }}>Add certificates, class documents, insurance, and other vessel papers</div>
            <button onClick={() => updYacht(y.id, { documents: [{ id: "ydoc_" + Date.now(), name: "", docType: "", issued: "", expiry: "", issuedBy: "", number: "", notes: "", fileName: "", fileData: "" }] })} style={{ marginTop: 12, padding: "6px 16px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: "none", background: S.navy, color: "#fff" }}>+ Add First Document</button>
          </div>}
        </Section>
      </div>}

      {yTab === "history" && <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
          <StatCard val={yOps.length} label="Total operations" color={S.brand} />
          <StatCard val={`$${totalRev.toLocaleString()}`} label="Total revenue" color={S.brand} />
          <StatCard val={lastOp?.eta || "—"} label="Last visit" color={S.brand} />
          <StatCard val={allPorts.length} label="Ports visited" color={S.brand} />
        </div>
        <Section title="Operations history">
          {yOps.length > 0 ? <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ background: S.bg }}>{["Ref", "Client", "Ports", "ETA", "Revenue", "Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "5px 8px", fontSize: 10, color: S.textS, fontWeight: 500, borderBottom: `1px solid ${S.border}` }}>{h}</th>)}</tr></thead>
            <tbody>{yOps.map(op => <tr key={op.id} style={{ borderBottom: `1px solid ${S.borderL}` }}>
              <td style={{ padding: "5px 8px", fontFamily: "monospace", color: S.brand, fontWeight: 500 }}>{op.opNumber}</td>
              <td style={{ padding: "5px 8px" }}>{op.clientName}</td>
              <td style={{ padding: "5px 8px" }}>{(op.ports || []).join(", ")}</td>
              <td style={{ padding: "5px 8px" }}>{op.eta || "—"}</td>
              <td style={{ padding: "5px 8px", fontWeight: 500 }}>{op.totalRevenue ? `$${op.totalRevenue.toLocaleString()}` : "—"}</td>
              <td style={{ padding: "5px 8px" }}><Status value={op.status} /></td>
            </tr>)}</tbody>
          </table> : <div style={{ textAlign: "center", padding: 30, color: S.textH }}>No operations recorded for this vessel yet</div>}
        </Section>
      </div>}
    </>;
  }


  return <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
      <Tile title="Total vessels" value={yachts.length} icon={Ship} accent={S.brand} />
      <Tile title="≥ 300 GT" value={yachts.filter(y => tonnageOf(y) >= 300).length} icon={Ship} accent={S.navy} footer="SCA slab tolls apply" />
      <Tile title="< 300 GT" value={yachts.filter(y => tonnageOf(y) < 300).length} icon={Ship} accent={S.cyan} footer="LOA-based dues" />
      <Tile title="Active now" value={yachts.filter(y => getYachtStatus(y) === "Active").length} icon={Activity} accent={S.green} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 4, padding: "6px 10px", flex: 1 }}><Search size={14} color={S.textH} /><input value={s} onChange={e => setS(e.target.value)} placeholder="Search by Vessel ID, name, IMO, flag..." style={{ border: "none", outline: "none", fontSize: 12, background: "transparent", width: "100%" }} /></div>
      {types.map(t => <button key={t} onClick={() => setTf(t)} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${tf === t ? S.brand : S.border}`, background: tf === t ? S.brand : "transparent", color: tf === t ? "#fff" : S.text }}>{t}</button>)}
      <span style={{ width: 1, height: 18, background: S.border }}></span>
      {[["all", "All GT"], ["above", "≥ 300 GT"], ["below", "< 300 GT"]].map(([k, l]) => <button key={k} onClick={() => setGtClass(k)} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${gtClass === k ? S.navy : S.border}`, background: gtClass === k ? S.navy : "transparent", color: gtClass === k ? "#fff" : S.text }}>{l}</button>)}
      <button onClick={() => setVw(vw === "cards" ? "table" : "cards")} style={{ padding: "4px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>{vw === "cards" ? "Table" : "Cards"}</button>
      <button onClick={handleExport} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📤 Export Excel</button>
      <label style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📥 Import Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={e => { handleImport(e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} /></label>
      <button onClick={() => setAdding(!adding)} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: adding ? "transparent" : S.brand, color: adding ? S.brand : "#fff" }}>{adding ? "Cancel" : "+ Add yacht"}</button>
    </div>
    {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 6, padding: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>New yacht</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <F label="Vessel name *" val={ny.name} set={v => setNy({ ...ny, name: (v || "").toUpperCase() })} w={2} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Type</div><select value={ny.type} onChange={e => setNy({ ...ny, type: e.target.value })} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 6px", fontSize: 11, background: S.surface }}><option>Motor</option><option>Sail</option></select></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Category</div><SearchSelect value={ny.category} options={["Pleasure", "Commercial", "Navy", "Tug", "Barge", "Cargo", "Tender", "Research", "Government", "Cruise", "Other"]} placeholder="Select..." width="100%" onChange={v => setNy({ ...ny, category: v })} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Flag *</div><SearchSelect value={ny.flag} options={FLAG_COUNTRIES} placeholder="Select flag..." width="100%" onChange={v => setNy({ ...ny, flag: v })} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>IMO</div><div style={{ display: "flex", alignItems: "center", border: `1px solid ${S.border}`, borderRadius: 3, background: S.surface, paddingLeft: 6 }}><span style={{ fontSize: 11, color: S.textS }}>IMO</span><input value={imoDigits(ny.imo)} inputMode="numeric" maxLength={7} placeholder="8712345" onChange={e => setNy({ ...ny, imo: formatIMO(e.target.value) })} style={{ width: "100%", border: "none", outline: "none", borderRadius: 3, padding: "4px 6px", fontSize: 11, background: "transparent" }} /></div></div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <F label="LOA (m) *" val={ny.loa} set={v => setNy({ ...ny, loa: v })} />
        <F label="GT *" val={ny.gt} set={v => setNy({ ...ny, gt: v })} />
        <F label="Beam (m)" val={ny.beam} set={v => setNy({ ...ny, beam: v })} />
        <F label="Draught (m)" val={ny.draught} set={v => setNy({ ...ny, draught: v })} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Year built</div><SearchSelect value={ny.yearBuilt ? String(ny.yearBuilt) : ""} options={YEARS} placeholder="Select year..." width="100%" onChange={v => setNy({ ...ny, yearBuilt: v })} /></div>
        <F label="Guests" val={ny.guestCapacity} set={v => setNy({ ...ny, guestCapacity: v })} />
        <F label="Crew" val={ny.crewCapacity} set={v => setNy({ ...ny, crewCapacity: v })} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 2 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Builder / Shipyard</div><SearchSelect value={ny.builderName} options={BUILDERS} placeholder="Select / search shipyard..." width="100%" onChange={(name) => {
          const nm = (name || "").trim();
          if (!nm) { setNy({ ...ny, builderName: "", builderId: "" }); return; }
          const existing = companies.find(c => (c.name || "").toLowerCase() === nm.toLowerCase());
          const isCustom = !BUILDERS.some(b => b.toLowerCase() === nm.toLowerCase());
          const co = existing || (isCustom ? ensureCompany(nm, "Builder") : null);
          setNy({ ...ny, builderName: co ? co.name : nm, builderId: co ? co.id : "" });
        }} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Classification</div><SearchSelect value={ny.classificationSociety} options={CLASS_SOCIETIES} placeholder="Select..." width="100%" onChange={v => setNy({ ...ny, classificationSociety: v })} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Hull material</div><MultiSelect value={ny.hullMaterial} options={HULL_MATERIALS} placeholder="Select material(s)..." width="100%" onChange={v => setNy({ ...ny, hullMaterial: v })} /></div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Exterior Designer</div><MultiSearchSelect value={ny.exteriorDesignerName || ""} options={EXTERIOR_DESIGNERS} placeholder="Select / search designer(s)..." width="100%" onChange={(v) => { ensureCustomDesigners(v, EXTERIOR_DESIGNERS, "Exterior Designer"); setNy({ ...ny, exteriorDesignerName: v }); }} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Interior Designer</div><MultiSearchSelect value={ny.interiorDesignerName || ""} options={INTERIOR_DESIGNERS} placeholder="Select / search designer(s)..." width="100%" onChange={(v) => { ensureCustomDesigners(v, INTERIOR_DESIGNERS, "Interior Designer"); setNy({ ...ny, interiorDesignerName: v }); }} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Naval Architect</div><MultiSearchSelect value={ny.navalArchitectName || ""} options={NAVAL_ARCHITECTS} placeholder="Select / search architect(s)..." width="100%" onChange={(v) => { ensureCustomDesigners(v, NAVAL_ARCHITECTS, "Naval Architect"); setNy({ ...ny, navalArchitectName: v }); }} /></div>
      </div>
      <button onClick={handleAdd} disabled={!ny.name || !ny.loa || !ny.gt} style={{ padding: "5px 16px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: ny.name && ny.loa && ny.gt ? "pointer" : "default", border: "none", background: ny.name && ny.loa && ny.gt ? S.brand : S.border, color: ny.name && ny.loa && ny.gt ? "#fff" : S.textH }}>Save yacht to database</button>
    </div>}
    {yachtTagsInUse.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}><span style={{ fontSize: 10, color: S.textH, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 2 }}>Filter by tag</span>{yachtTagsInUse.map(t => { const tc = tagColor(t); const on = tagFilter === t; return <button key={t} onClick={() => setTagFilter(on ? null : t)} style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${on ? tc.fg : S.border}`, background: on ? tc.fg : tc.bg, color: on ? "#fff" : tc.fg }}>{t}</button>; })}{tagFilter && <button onClick={() => setTagFilter(null)} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Clear</button>}</div>}
    {vw === "cards" ? <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
      {allY.map(y => {
        const owner = getOwner(y.ownerId);
        const builder = getCompany(y.builderId);
        const mgmt = getCompany(y.managementId);
        return <div key={y.id} onClick={() => setSel(y.id)} style={{ background: S.surface, borderTop: `1px solid ${S.border}`, borderRight: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, borderLeft: `3px solid ${y.type === "Sail" ? S.cyan : S.navy}`, borderRadius: 8, cursor: "pointer", overflow: "hidden" }}>
          {y.photo ? <img src={y.photo} alt={y.name} style={{ width: "100%", height: 104, objectFit: "cover", display: "block" }} /> : <div style={{ height: 104, background: S.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: S.textH, borderBottom: `1px solid ${S.borderL}` }}><Ship size={26} /><span style={{ fontSize: 10, marginTop: 3 }}>No photo</span></div>}
          <div style={{ padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{(y.name || "").toUpperCase()}</span>
              <span style={{ padding: "1px 6px", borderRadius: 3, fontSize: 10, background: y.type === "Motor" ? S.blueBg : S.cyanBg, color: y.type === "Motor" ? S.blue : S.cyan }}>{y.type}</span>
              <span style={{ padding: "1px 6px", borderRadius: 3, fontSize: 10, background: tonnageOf(y) >= 300 ? S.orangeBg : S.greenBg, color: tonnageOf(y) >= 300 ? S.orange : S.green, fontWeight: 500 }}>{tonnageOf(y) >= 300 ? "≥ 300 GT" : "< 300 GT"}</span>
              {y.category && y.category !== "Pleasure" && <span style={{ padding: "1px 6px", borderRadius: 3, fontSize: 10, background: S.purpleBg, color: S.purple }}>{y.category}</span>}
              {y.forSale && <span style={{ padding: "1px 6px", borderRadius: 3, fontSize: 10, background: S.goldBg, color: S.gold }}>For sale</span>}
            </div>
            <Status value={getYachtStatus(y)} />
          </div>
          {y.prevNames?.length > 0 && <div style={{ fontSize: 10, color: S.textH, marginBottom: 3 }}>ex-{y.prevNames.join(", ")}</div>}
          <div style={{ fontSize: 10, fontFamily: "monospace", color: S.textH, marginBottom: 3 }}>{getSerial(y)}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: S.textS, marginBottom: 4 }}>
            <span>{y.loa}m LOA</span>{y.beam && <span>{y.beam}m beam</span>}<span>{y.gt?.toLocaleString()} GT</span><span>{y.yearBuilt}</span>{y.hullMaterial && <span>{y.hullMaterial}</span>}
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 10, color: S.textH }}>
            {owner !== "—" && <span>Owner: <span style={{ color: S.text }}>{owner}</span></span>}
            {builder && <span>Builder: <span style={{ color: S.text }}>{builder}</span></span>}
            {mgmt && <span>Mgmt: <span style={{ color: S.text }}>{mgmt}</span></span>}
          </div>
          {(y.tags && y.tags.length) ? <div style={{ marginTop: 6 }}><TagChips tags={y.tags} onClick={(t) => setTagFilter(t === tagFilter ? null : t)} active={tagFilter} /></div> : null}
          </div>
        </div>;
      })}
    </div> : <Table columns={[
      { key: "photo", label: "", render: (_, r) => r.photo ? <img src={r.photo} alt="" style={{ width: 40, height: 28, objectFit: "cover", borderRadius: 4, display: "block" }} /> : <div style={{ width: 40, height: 28, borderRadius: 4, background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", color: S.textH }}><Ship size={14} /></div> },
      { key: "id", label: "Vessel ID", render: (_, r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: S.textS }}>{getSerial(r)}</span> },
      { key: "name", label: "Vessel", render: (v, r) => <span style={{ fontWeight: 500, color: S.brand, cursor: "pointer" }} onClick={() => setSel(r.id)}>{(v || "").toUpperCase()}</span> },
      { key: "type", label: "Type", render: v => <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 11, background: v === "Motor" ? S.blueBg : S.cyanBg, color: v === "Motor" ? S.blue : S.cyan }}>{v}</span> },
      { key: "flag", label: "Flag" }, { key: "loa", label: "LOA" }, { key: "gt", label: "GT" }, { key: "yearBuilt", label: "Year Built" }, { key: "tags", label: "Tags", render: (v, r) => <TagChips tags={r.tags} onClick={(t) => setTagFilter(t === tagFilter ? null : t)} active={tagFilter} /> },
      { key: "ownerId", label: "Owner", render: v => getOwner(v) },
      { key: "id", label: "Status", render: (_, r) => <Status value={getYachtStatus(r)} /> },
    ]} data={allY} />}
  </>;
};


// OWNERS (Section 5)
const OWNER_CRM = [
  { key: "tier", label: "Tier", multi: false, opts: ["VIP", "Premium", "Standard", "New", "Inactive"] },
  { key: "relationship", label: "Relationship", multi: false, opts: ["Direct Owner", "Representative", "Family Office", "Corporate", "Government"] },
  { key: "servicePrefs", label: "Service preferences", multi: true, opts: ["Provisions", "Bunkering", "Crew Change", "SC Transit", "Full Service", "Agency Only"] },
  { key: "communication", label: "Preferred channel", multi: false, opts: ["WhatsApp", "Email", "Phone", "Broker Only"] },
  { key: "language", label: "Language", multi: true, opts: ["English", "Arabic", "French", "German", "Russian", "Italian", "Spanish", "Turkish"] },
  { key: "billing", label: "Billing terms", multi: false, opts: ["Net 30", "Net 60", "Prepay", "Letter of Credit", "Cash on Delivery"] },
  { key: "dietary", label: "Dietary", multi: true, opts: ["None", "Halal", "Kosher", "Vegetarian", "Vegan", "Gluten-Free", "Allergies"] },
];
const OwnersView = ({ allOwners, allYachts, allOps, addOwner, importOwners, nav, updOwner, intent, clearIntent, openYacht, openCompany, goBack, navDepth, backLabel }) => {
  const liveOps = allOps || OPERATIONS;
  const owners = allOwners || [];
  const yachts = allYachts || YACHTS;
  const [s, setS] = useState("");
  const [vw, setVw] = useState("cards");
  const [adding, setAdding] = useState(false);
  const [sel, setSel] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [no, setNo] = useState({ name: "", nationality: "", email: "", netWorth: "", notes: "" });
  const [noteDraft, setNoteDraft] = useState("");
  const [newContact, setNewContact] = useState({ name: "", role: "", email: "", phone: "", channel: "" });
  const allO = owners.filter(o => s === "" || o.name.toLowerCase().includes(s.toLowerCase()) || (o.nationality || "").toLowerCase().includes(s.toLowerCase()));
  const getYachts = oid => yachts.filter(y => y.ownerId === oid);
  const handleAdd = () => { if (!no.name) return; addOwner({ ...no, addresses: [], yachtIds: [] }); setNo({ name: "", nationality: "", email: "", netWorth: "", notes: "" }); setAdding(false); };
  useEffect(() => { if (intent && intent.openOwner) { setSel(intent.openOwner); setEditing(false); } if (clearIntent) clearIntent(); }, []);

  if (sel) {
    const o = owners.find(x => x.id === sel);
    if (!o) { setSel(null); return null; }
    const oYachts = getYachts(o.id);
    const oOps = liveOps.filter(op => oYachts.some(y => y.id === op.yachtId));
    const money = (n) => "$" + (n || 0).toLocaleString();
    const ds = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";
    const oRevenue = oOps.reduce((s, op) => s + (op.totalRevenue || 0), 0);
    const oCost = oOps.reduce((s, op) => s + (op.totalCost || 0), 0);
    const oMargin = oRevenue > 0 ? Math.round((oRevenue - oCost) / oRevenue * 100) : 0;
    const oActive = oOps.filter(op => op.status === "Active" || op.status === "Upcoming").length;
    const oWithRev = oOps.filter(op => (op.totalRevenue || 0) > 0).length;
    const oAvg = oWithRev > 0 ? Math.round(oRevenue / oWithRev) : 0;
    const addNote = () => { const txt = noteDraft.trim(); if (!txt) return; updOwner(o.id, { notes_log: [{ id: "n" + Date.now(), date: new Date().toISOString().slice(0, 10), by: "Sarah Ahmed", text: txt }, ...(o.notes_log || [])] }); setNoteDraft(""); };
    const rmNote = (nid) => updOwner(o.id, { notes_log: (o.notes_log || []).filter(n => n.id !== nid) });
    const addContact = () => { if (!newContact.name.trim()) return; updOwner(o.id, { contacts: [...(o.contacts || []), { ...newContact, name: newContact.name.trim(), id: "ct" + Date.now(), isPrimary: (o.contacts || []).length === 0 }] }); setNewContact({ name: "", role: "", email: "", phone: "", channel: "" }); };
    const onOwnerDoc = (file) => { if (!file) return; fileToDataUrl(file, data => { const nm = file.name; const isNda = /nda|non-disclosure|confidential/i.test(nm); updOwner(o.id, { documents: [...(o.documents || []), { id: "doc" + Date.now(), name: nm, type: isNda ? "NDA" : "Document", fileData: data, date: new Date().toISOString().slice(0, 10), expiry: "", by: "Sarah Ahmed" }] }); }); };
    const ownerTimeline = [...(o.notes_log || []).map(n => ({ ...n, auto: false })), ...oOps.map(op => ({ id: "ev_" + op.id, date: op.eta || op.created || "", by: "system", text: op.opNumber + " · " + op.status, auto: true }))].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const ed = editing ? editData : o;
    const startEdit = () => { setEditData({ ...o }); setEditing(true); };
    return <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button onClick={() => { if (navDepth > 0 && goBack) { goBack(); } else { setSel(null); setEditing(false); } }} style={{ background: "none", border: "none", cursor: "pointer", color: S.textS, display: "flex", alignItems: "center", gap: 3 }}><ChevronLeft size={16} /> {navDepth > 0 ? `Back to ${backLabel || "previous"}` : "Back"}</button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: S.blueBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 12, color: S.blue }}>{o.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
        <span style={{ fontSize: 16, fontWeight: 500 }}>{o.name}</span>
        {o.netWorth && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, background: S.goldBg, color: S.gold }}>{o.netWorth}</span>}
        {o.crm && o.crm.tier && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 500, background: tagColor(o.crm.tier).bg, color: tagColor(o.crm.tier).fg }}>{o.crm.tier}</span>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {!editing && <button onClick={startEdit} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}>Edit</button>}
          {editing && <><button onClick={() => setEditing(false)} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>Cancel</button><button onClick={() => setEditing(false)} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.green}`, background: S.green, color: "#fff" }}>Save</button></>}
        </div>
      </div>
      {(o.documents || []).some(d => /nda|non-disclosure|confidential/i.test(d.name || "") && (!d.expiry || new Date(d.expiry) > new Date())) && <div style={{ background: "#FDF6E3", border: "1px solid #D4A72C", borderRadius: 6, padding: "7px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}><Lock size={13} color="#D4A72C" /><span style={{ color: "#8B6914", fontWeight: 500 }}>Confidential — NDA on file</span><span style={{ color: "#A68B3A", fontSize: 11 }}>This owner has an active non-disclosure agreement.</span></div>}
      {oOps.length > 0 && <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: S.textS, textTransform: "uppercase", marginBottom: 12 }}>Financial summary · from {oOps.length} operation{oOps.length === 1 ? "" : "s"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))", gap: 10 }}>
          {[["Revenue", money(oRevenue), S.text], ["Cost", money(oCost), S.text], ["Margin", oRevenue > 0 ? oMargin + "%" : "—", S.green], ["Operations", String(oOps.length), S.text], ["Active now", String(oActive), oActive > 0 ? S.green : S.text], ["Avg / op", oWithRev > 0 ? money(oAvg) : "—", S.text]].map(([k, v, c], i) => <div key={i} style={{ background: S.bg, borderRadius: 6, padding: "10px 12px" }}><div style={{ fontSize: 18, fontWeight: 600, color: c }}>{v}</div><div style={{ fontSize: 10, color: S.textS, marginTop: 2 }}>{k}</div></div>)}
        </div>
      </div>}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <F label="Full name" val={ed.name} set={v => setEditData({ ...editData, name: v })} disabled={!editing} w={2} />
              <F label="Nationality" val={ed.nationality} set={v => setEditData({ ...editData, nationality: v })} disabled={!editing} />
              <F label="Email" val={ed.email} set={v => setEditData({ ...editData, email: v })} disabled={!editing} w={2} />
              <F label="Net worth" val={ed.netWorth} set={v => setEditData({ ...editData, netWorth: v })} disabled={!editing} />
            </div>
            {ed.notes && <div style={{ marginTop: 8, fontSize: 11, fontStyle: "italic", color: S.textH }}>{ed.notes}</div>}
          </div>
          {o.addresses?.length > 0 && <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Addresses ({o.addresses.length})</div>
            {o.addresses.map((a, i) => <div key={i} style={{ padding: "6px 0", borderBottom: i < o.addresses.length - 1 ? `1px solid ${S.borderL}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 500 }}>{a.label}</span>
                {a.isDefault && <span style={{ padding: "1px 5px", borderRadius: 3, fontSize: 9, background: S.greenBg, color: S.green }}>Default</span>}
              </div>
              <div style={{ fontSize: 11, color: S.textS }}>{a.lines}</div>
            </div>)}
          </div>}
          {oOps.length > 0 && <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Operations history ({oOps.length})</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead><tr>{["Op #", "Vessel", "Status", "Ports", "ETA – ETD", "Svcs", "Revenue"].map((h, i) => <th key={i} style={{ textAlign: i === 6 ? "right" : i === 5 ? "center" : "left", fontSize: 9.5, fontWeight: 500, color: S.textS, textTransform: "uppercase", padding: "6px 8px", borderBottom: `1px solid ${S.borderL}`, whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[...oOps].sort((a, b) => (b.eta || "").localeCompare(a.eta || "")).map(op => <tr key={op.id}>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}`, whiteSpace: "nowrap" }}><span onClick={() => nav && nav("operations", op.id)} style={{ fontFamily: "monospace", color: S.brand, cursor: nav ? "pointer" : "default" }}>{op.opNumber}</span></td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}` }}>{op.vesselName}</td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}` }}><Status value={op.status} /></td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS }}>{(op.ports || []).join(" · ") || "—"}</td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS, whiteSpace: "nowrap" }}>{ds(op.eta)}{op.etd && op.etd !== op.eta ? " – " + ds(op.etd) : ""}</td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "center" }}>{op.serviceCount || 0}</td>
                    <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right", whiteSpace: "nowrap" }}>{(op.totalRevenue || 0) > 0 ? money(op.totalRevenue) : "—"}</td>
                  </tr>)}
                  <tr><td colSpan={5} style={{ padding: "7px 8px", fontWeight: 600 }}>Total</td><td style={{ padding: "7px 8px", fontWeight: 600, textAlign: "center" }}>{oOps.reduce((s, op) => s + (op.serviceCount || 0), 0)}</td><td style={{ padding: "7px 8px", fontWeight: 600, textAlign: "right" }}>{money(oRevenue)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>}
        </div>
        <div>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Fleet ({oYachts.length})</div>
            {oYachts.length > 0 ? oYachts.map(y => <div key={y.id} onClick={() => { if (openYacht) openYacht(y.id, { mod: "owners", type: "owner", id: o.id }); }} style={{ padding: "5px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 12, cursor: openYacht ? "pointer" : "default" }}>
              <div style={{ fontWeight: 500, color: openYacht ? S.brand : S.text, textDecoration: openYacht ? "underline" : "none", textDecorationColor: S.brand + "55", textUnderlineOffset: 2 }}>{(y.name || "").toUpperCase()}</div>
              <div style={{ fontSize: 10, color: S.textS }}>{y.type} · {y.loa}m · {y.gt} GT · {y.flag}</div>
            </div>) : <div style={{ fontSize: 11, color: S.textH }}>No yachts linked</div>}
          </div>
        </div>
      </div>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: S.textS, textTransform: "uppercase", marginBottom: 12 }}>CRM &amp; preferences</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
          {OWNER_CRM.map(cat => { const cur = (o.crm || {})[cat.key]; const selv = cat.multi ? (Array.isArray(cur) ? cur : []) : cur; const setVal = (v) => updOwner(o.id, { crm: { ...(o.crm || {}), [cat.key]: v } }); return <div key={cat.key}>
            <div style={{ fontSize: 10, color: S.textH, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.3 }}>{cat.label}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{cat.opts.map(opt => { const on = cat.multi ? selv.includes(opt) : selv === opt; const tc = tagColor(opt); return <span key={opt} onClick={() => { if (cat.multi) setVal(on ? selv.filter(x => x !== opt) : [...selv, opt]); else setVal(on ? "" : opt); }} style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 500, cursor: "pointer", background: on ? tc.bg : "transparent", color: on ? tc.fg : S.textS, border: `1px solid ${on ? tc.bg : S.border}` }}>{opt}</span>; })}</div>
          </div>; })}
        </div>
      </div>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: S.textS, textTransform: "uppercase", marginBottom: 12 }}>Contacts ({(o.contacts || []).length})</div>
        {(o.contacts || []).length > 0 && <div style={{ overflowX: "auto", marginBottom: 10 }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead><tr>{["", "Name", "Role", "Email", "Phone", "Channel", ""].map((h, i) => <th key={i} style={{ textAlign: "left", fontSize: 9.5, fontWeight: 500, color: S.textS, textTransform: "uppercase", padding: "5px 8px", borderBottom: `1px solid ${S.borderL}` }}>{h}</th>)}</tr></thead>
          <tbody>{(o.contacts || []).map(ct => <tr key={ct.id}>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}` }}><span title="Set primary" onClick={() => updOwner(o.id, { contacts: (o.contacts || []).map(c => ({ ...c, isPrimary: c.id === ct.id })) })} style={{ cursor: "pointer", color: ct.isPrimary ? S.gold : S.border, fontSize: 14, lineHeight: 1 }}>{ct.isPrimary ? "★" : "☆"}</span></td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}`, fontWeight: 500 }}>{ct.name}</td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS }}>{ct.role || "—"}</td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS }}>{ct.email || "—"}</td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS }}>{ct.phone || "—"}</td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS }}>{ct.channel || "—"}</td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}` }}><span onClick={() => updOwner(o.id, { contacts: (o.contacts || []).filter(c => c.id !== ct.id) })} style={{ cursor: "pointer", color: S.textH, fontSize: 14, lineHeight: 1 }}>×</span></td>
          </tr>)}</tbody>
        </table></div>}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <input value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} placeholder="Name" style={{ border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 7px", fontSize: 11, background: S.surface, outline: "none", width: 110 }} />
          <input value={newContact.role} onChange={e => setNewContact({ ...newContact, role: e.target.value })} placeholder="Role (Captain, PA, Broker...)" style={{ border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 7px", fontSize: 11, background: S.surface, outline: "none", width: 160 }} />
          <input value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} placeholder="Email" style={{ border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 7px", fontSize: 11, background: S.surface, outline: "none", width: 140 }} />
          <input value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} placeholder="Phone" style={{ border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 7px", fontSize: 11, background: S.surface, outline: "none", width: 110 }} />
          <select value={newContact.channel} onChange={e => setNewContact({ ...newContact, channel: e.target.value })} style={{ border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 7px", fontSize: 11, background: S.surface, outline: "none" }}><option value="">Channel</option>{["WhatsApp", "Email", "Phone", "Broker"].map(c => <option key={c} value={c}>{c}</option>)}</select>
          <button onClick={addContact} disabled={!newContact.name.trim()} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: newContact.name.trim() ? "pointer" : "default", border: "none", background: newContact.name.trim() ? S.brand : S.border, color: newContact.name.trim() ? "#fff" : S.textH }}>+ Add</button>
        </div>
      </div>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: S.textS, textTransform: "uppercase" }}>Documents ({(o.documents || []).length})</div><label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><Upload size={12} /> Upload<input type="file" accept="image/*,application/pdf" onChange={e => onOwnerDoc(e.target.files[0])} style={{ display: "none" }} /></label></div>
        {(o.documents || []).length > 0 ? <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead><tr>{["Name", "Type", "Date", "Expiry", "By", ""].map((h, i) => <th key={i} style={{ textAlign: "left", fontSize: 9.5, fontWeight: 500, color: S.textS, textTransform: "uppercase", padding: "5px 8px", borderBottom: `1px solid ${S.borderL}` }}>{h}</th>)}</tr></thead>
          <tbody>{(o.documents || []).map(d => <tr key={d.id}>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}` }}><a href={d.fileData} download={d.name} style={{ color: S.brand, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}><FileText size={12} />{d.name}</a></td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}` }}>{d.type === "NDA" ? <span style={{ padding: "1px 7px", borderRadius: 10, fontSize: 10, background: S.goldBg, color: S.gold, fontWeight: 500 }}>NDA</span> : <span style={{ color: S.textS }}>{d.type || "—"}</span>}</td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS }}>{d.date || "—"}</td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}` }}><input type="date" value={d.expiry || ""} onChange={e => updOwner(o.id, { documents: (o.documents || []).map(x => x.id === d.id ? { ...x, expiry: e.target.value } : x) })} style={{ border: `1px solid ${S.border}`, borderRadius: 3, padding: "2px 5px", fontSize: 10.5, background: S.surface, outline: "none", color: S.textS }} /></td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS }}>{d.by || "—"}</td>
            <td style={{ padding: "5px 8px", borderBottom: `1px solid ${S.borderL}` }}><span onClick={() => updOwner(o.id, { documents: (o.documents || []).filter(x => x.id !== d.id) })} style={{ cursor: "pointer", color: S.textH, fontSize: 14, lineHeight: 1 }}>×</span></td>
          </tr>)}</tbody>
        </table></div> : <div style={{ fontSize: 11, color: S.textH }}>No documents yet. Upload NDAs, contracts or correspondence — filenames containing &quot;NDA&quot; are auto-flagged and surface a banner.</div>}
      </div>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: S.textS, textTransform: "uppercase", marginBottom: 12 }}>Notes &amp; timeline</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)} placeholder="Add a note..." rows={2} style={{ flex: 1, border: `1px solid ${S.border}`, borderRadius: 4, padding: "6px 8px", fontSize: 11.5, background: S.surface, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
          <button onClick={addNote} disabled={!noteDraft.trim()} style={{ padding: "4px 14px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: noteDraft.trim() ? "pointer" : "default", border: "none", background: noteDraft.trim() ? S.brand : S.border, color: noteDraft.trim() ? "#fff" : S.textH, alignSelf: "flex-start" }}>Add</button>
        </div>
        {ownerTimeline.length === 0 ? <div style={{ fontSize: 11, color: S.textH }}>No notes or operations yet.</div> : <div>{ownerTimeline.map(ev => <div key={ev.id} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: `1px solid ${S.borderL}`, alignItems: "flex-start" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: ev.auto ? S.blue : S.green, marginTop: 5, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11.5, color: S.text }}><span style={{ fontWeight: 600 }}>{ev.auto ? "System" : ev.by}</span> <span style={{ color: S.textH, fontSize: 10.5 }}>{ev.date}</span>{ev.auto && <span style={{ marginLeft: 6, padding: "0 6px", borderRadius: 8, fontSize: 9, background: S.blueBg, color: S.blue, fontWeight: 500 }}>auto</span>}</div><div style={{ fontSize: 11.5, color: S.textS, marginTop: 2 }}>{ev.text}</div></div>
          {!ev.auto && <span onClick={() => rmNote(ev.id)} style={{ cursor: "pointer", color: S.textH, fontSize: 14, lineHeight: 1 }}>×</span>}
        </div>)}</div>}
      </div>
    </>;
  }

  return <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
      <Tile title="Total owners" value={owners.length} icon={UserCircle} accent={S.brand} />
      <Tile title="Total fleet" value={owners.reduce((s, o) => s + getYachts(o.id).length, 0)} icon={Ship} accent={S.navy} />
      <Tile title="With addresses" value={owners.filter(o => o.addresses?.length > 0).length} icon={MapPin} accent={S.green} />
      <Tile title="Nationalities" value={[...new Set(owners.map(o => o.nationality))].length} icon={Globe} accent={S.purple} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 4, padding: "6px 10px", flex: 1 }}><Search size={14} color={S.textH} /><input value={s} onChange={e => setS(e.target.value)} placeholder="Search by name, nationality..." style={{ border: "none", outline: "none", fontSize: 12, background: "transparent", width: "100%" }} /></div>
      <button onClick={() => setVw(vw === "cards" ? "table" : "cards")} style={{ padding: "4px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>{vw === "cards" ? "Table" : "Cards"}</button>
      <button onClick={() => { if (!allO.length) { alert("No owners to export with the current filter."); return; } exportRegistryToExcel(allO, PERSON_XLSX_SPEC, "Owners", "Felix_Owners", o => o.serial || "", () => {}); }} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📤 Export Excel</button>
      <label style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📥 Import Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={e => { const f = e.target.files[0]; if (f) importRegistryFromExcel(f, PERSON_XLSX_SPEC, rows => { if (!rows.length) { alert("No valid rows found. Ensure the sheet has a 'Full Name' column."); return; } importOwners && importOwners(rows); }, () => alert("Could not read the spreadsheet. Save it as .xlsx or .csv and try again.")); e.target.value = ""; }} style={{ display: "none" }} /></label>
      <button onClick={() => setAdding(!adding)} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: adding ? "transparent" : S.brand, color: adding ? S.brand : "#fff" }}>{adding ? "Cancel" : "+ Add owner"}</button>
    </div>
    {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 6, padding: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>New owner</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <F label="Full name *" val={no.name} set={v => setNo({ ...no, name: v })} w={2} />
        <F label="Nationality" val={no.nationality} set={v => setNo({ ...no, nationality: v })} />
        <F label="Email" val={no.email} set={v => setNo({ ...no, email: v })} w={2} />
        <F label="Net worth" val={no.netWorth} set={v => setNo({ ...no, netWorth: v })} />
      </div>
      <button onClick={handleAdd} disabled={!no.name} style={{ padding: "5px 16px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: no.name ? "pointer" : "default", border: "none", background: no.name ? S.brand : S.border, color: no.name ? "#fff" : S.textH }}>Save owner</button>
    </div>}
    {vw === "cards" ? <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
      {allO.map(o => {
        const oy = getYachts(o.id);
        const defAddr = o.addresses?.find(a => a.isDefault);
        return <div key={o.id} onClick={() => setSel(o.id)} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: S.blueBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 13, color: S.blue, flexShrink: 0 }}>{o.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{o.name}</div><div style={{ fontSize: 11, color: S.textS }}>{o.nationality}{o.netWorth ? ` · ${o.netWorth}` : ""}</div></div>
            {o.netWorth && <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, background: S.goldBg, color: S.gold, fontWeight: 500 }}>{o.netWorth}</span>}
          </div>
          {oy.length > 0 && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>{oy.map(y => <span key={y.id} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: y.type === "Sail" ? S.cyanBg : S.blueBg, color: y.type === "Sail" ? S.cyan : S.blue, fontWeight: 500 }}>{y.name} · {y.loa}m</span>)}</div>}
          <div style={{ fontSize: 11, color: S.textH }}>
            {o.email && <div><span style={{ color: S.textS }}>Email:</span> <span style={{ color: S.brand }}>{o.email}</span></div>}
            {defAddr && <div><span style={{ color: S.textS }}>{defAddr.label}:</span> {defAddr.lines}</div>}
          </div>
        </div>;
      })}
    </div> : <Table columns={[
      { key: "name", label: "Owner", render: (v, r) => <span style={{ fontWeight: 500, color: S.brand, cursor: "pointer" }} onClick={() => setSel(r.id)}>{v}</span> },
      { key: "nationality", label: "Nationality" },
      { key: "netWorth", label: "Net worth" },
      { key: "email", label: "Email", render: v => v ? <ObjLink>{v}</ObjLink> : "—" },
      { key: "id", label: "Vessels", render: (_, r) => getYachts(r.id).map(y => y.name).join(", ") || "—" },
    ]} data={allO} />}
  </>;
};

// COMPANIES (Section 6)
const CompaniesView = ({ allCompanies, addCompany, importCompanies, updCompany, deleteCompany, allPersons, allYachts, allOps, companyContacts, linkContact, unlinkContact, openYacht, allTags, nav, intent, clearIntent, openOwner, goBack, navDepth, backLabel }) => {
  const yachts = allYachts || YACHTS;
  const liveOps = allOps || OPERATIONS;
  const companies = allCompanies || COMPANIES;
  const [s, setS] = useState("");
  const [tf, setTf] = useState("All");
  const [adding, setAdding] = useState(false);
  const [sel, setSel] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [nc, setNc] = useState({ name: "", type: "Management", country: "", nameAr: "" });
  const [tagFilter, setTagFilter] = useState(null);
  const [vw, setVw] = useState("cards");
  const [linking, setLinking] = useState(false);
  const compTypes = ["All", ...new Set(companies.map(c => c.type))].filter(Boolean);
  const typeColors = { Agency: S.brand, Builder: S.navy, Broker: S.green, Management: S.blue, Marina: S.cyan, "Exterior Designer": S.purple, "Interior Designer": S.purple, "Naval Architect": S.orange, Supplier: S.red, "Government Authority": "#854F0B", "Classification Society": "#0F766E", "Owner / Principal": S.textS };
  const allC = companies.filter(c => (tf === "All" || c.type === tf) && (s === "" || c.name.toLowerCase().includes(s.toLowerCase()) || (c.nameAr || "").includes(s)) && (!tagFilter || (c.tags || []).includes(tagFilter)));
  const compTagsInUse = [...new Set(companies.flatMap(c => c.tags || []))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const typeBreakdown = Object.entries(companies.reduce((a, c) => { a[c.type] = (a[c.type] || 0) + 1; return a; }, {})).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
  const handleAdd = () => { if (!nc.name) return; addCompany({ ...nc }); setNc({ name: "", type: "Management", country: "", nameAr: "" }); setAdding(false); };
  useEffect(() => { if (intent && intent.openCompany) { setSel(intent.openCompany); setEditing(false); } if (clearIntent) clearIntent(); }, []);
  const companySerialById = useMemo(() => { const m = {}; companies.forEach((c, i) => { m[c.id] = companySerial(c, i); }); return m; }, [companies]);
  const getCompanySerial = (c) => (c && (c.serial || companySerialById[c.id])) || companySerial(c);

  if (sel) {
    const c = companies.find(x => x.id === sel);
    if (!c) { setSel(null); return null; }
    const cYachts = yachts.filter(y => [y.builderId, y.exteriorDesignerId, y.interiorDesignerId, y.navalArchitectId, y.managementId, y.brokerId, y.centralAgentId, y.marinaId].includes(c.id));
    const ed = editing ? editData : c;
    const tc = typeColors[c.type] || S.textS;
    const persons = allPersons || PERSONS;
    const contactIds = (companyContacts && companyContacts[c.id]) || [];
    const linkedPersons = persons.filter(p => contactIds.includes(p.id));
    const headerBits = [c.country, c.type, (c.founded && c.founded > 0) ? `Founded ${c.founded}` : null].filter(Boolean);
    const contactBits = [c.email, c.website].filter(Boolean);
    const addrList = (c.addresses || []).filter(a => a && (a.text || a.label));
    const saveEdit = () => { if (!emailOK) { alert("Please enter a valid email address, or leave the email field blank."); return; } const { documents, tags, ...changes } = editData; changes.website = normalizeWebsite(changes.website); changes.ccEmails = (changes.ccEmails || []).filter(e => e && e.address); if (updCompany) updCompany(c.id, changes); setEditing(false); };
    const doDelete = () => { if (confirm(`Delete "${c.name}"? This cannot be undone.`)) { if (deleteCompany) deleteCompany(c.id); setSel(null); setEditing(false); } };
    const onLogo = (e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setEditData(prev => ({ ...prev, logo: ev.target.result })); r.readAsDataURL(f); } e.target.value = ""; };
    const setAddr = (i, field, val) => setEditData(prev => { const arr = [...(prev.addresses || [])]; arr[i] = { ...arr[i], [field]: val }; return { ...prev, addresses: arr }; });
    const addAddr = () => setEditData(prev => ({ ...prev, addresses: [...(prev.addresses || []), { label: "", text: "" }] }));
    const rmAddr = (i) => setEditData(prev => ({ ...prev, addresses: (prev.addresses || []).filter((_, j) => j !== i) }));
    const editSelectRow = (label, key, options, last) => <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: last ? "none" : `1px solid ${S.borderL}`, fontSize: 13, gap: 10 }}><span style={{ color: S.textS, flexShrink: 0 }}>{label}</span><div style={{ flex: 1, maxWidth: 210, display: "flex", justifyContent: "flex-end" }}><SearchSelect value={ed[key] || ""} options={options} placeholder="Select..." width="100%" onChange={v => setEditData(prev => ({ ...prev, [key]: v }))} /></div></div>;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailOK = (!ed.email || EMAIL_RE.test(ed.email)) && (ed.emails || []).every(e => !e || !e.address || EMAIL_RE.test(e.address)) && (ed.ccEmails || []).every(e => !e || !e.address || EMAIL_RE.test(e.address));
    const setEmail = (i, field, val) => setEditData(prev => { const arr = [...(prev.emails || [])]; arr[i] = { ...arr[i], [field]: val }; return { ...prev, emails: arr }; });
    const addEmail = () => setEditData(prev => ({ ...prev, emails: [...(prev.emails || []), { label: "", address: "" }] }));
    const rmEmail = (i) => setEditData(prev => ({ ...prev, emails: (prev.emails || []).filter((_, j) => j !== i) }));
    const setCcEmail = (i, val) => setEditData(prev => { const arr = [...(prev.ccEmails || [])]; arr[i] = { ...arr[i], address: val }; return { ...prev, ccEmails: arr }; });
    const addCcEmail = () => setEditData(prev => ({ ...prev, ccEmails: [...(prev.ccEmails || []), { address: "" }] }));
    const rmCcEmail = (i) => setEditData(prev => ({ ...prev, ccEmails: (prev.ccEmails || []).filter((_, j) => j !== i) }));
    const PHONE_TYPES = ["Mobile", "Office", "Direct", "Reception", "WhatsApp", "Fax", "Home", "Emergency"];
    const setPhone = (i, field, val) => setEditData(prev => { const arr = [...(prev.phones || [])]; arr[i] = { ...arr[i], [field]: val }; return { ...prev, phones: arr }; });
    const addPhone = () => setEditData(prev => ({ ...prev, phones: [...(prev.phones || []), { type: "Mobile", code: "+20", number: "" }] }));
    const rmPhone = (i) => setEditData(prev => ({ ...prev, phones: (prev.phones || []).filter((_, j) => j !== i) }));
    const SOCIAL_OPTIONS = ["Instagram", "Facebook", "LinkedIn", "X (Twitter)", "YouTube", "TikTok", "WhatsApp", "Website"];
    const socialMeta = (p) => { const k = (p || "").toLowerCase(); if (k.includes("instagram")) return { Ic: Instagram, color: "#E1306C" }; if (k.includes("facebook")) return { Ic: Facebook, color: "#1877F2" }; if (k.includes("linkedin")) return { Ic: Linkedin, color: "#0A66C2" }; if (k.includes("twitter") || k === "x") return { Ic: Twitter, color: "#1DA1F2" }; if (k.includes("youtube")) return { Ic: Youtube, color: "#FF0000" }; if (k.includes("tiktok")) return { Ic: Music2, color: S.text }; if (k.includes("whatsapp")) return { Ic: MessageCircle, color: "#25D366" }; if (k.includes("web")) return { Ic: Globe, color: S.brand }; return { Ic: Link2, color: S.textS }; };
    const setSocial = (i, field, val) => setEditData(prev => { const arr = [...(prev.socials || [])]; arr[i] = { ...arr[i], [field]: val }; return { ...prev, socials: arr }; });
    const addSocial = () => setEditData(prev => ({ ...prev, socials: [...(prev.socials || []), { platform: "Instagram", url: "" }] }));
    const rmSocial = (i) => setEditData(prev => ({ ...prev, socials: (prev.socials || []).filter((_, j) => j !== i) }));
    const DOC_TYPES = ["Tax card", "Commercial registration", "VAT certificate", "Trade license", "Other"];
    const docList = c.documents || [];
    const saveDocs = (arr) => { if (updCompany) updCompany(c.id, { documents: arr }); };
    const setDoc = (i, field, val) => { const arr = [...docList]; arr[i] = { ...arr[i], [field]: val }; saveDocs(arr); };
    const addDoc = () => saveDocs([...docList, { docType: "Tax card", fileName: "", fileData: "", url: "" }]);
    const rmDoc = (i) => saveDocs(docList.filter((_, j) => j !== i));
    const onDocFile = (i, e) => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => { const arr = [...docList]; arr[i] = { ...arr[i], fileData: ev.target.result, fileName: f.name }; saveDocs(arr); }; r.readAsDataURL(f); } e.target.value = ""; };
    const infoRow = (label, value, last) => <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: last ? "none" : `1px solid ${S.borderL}`, fontSize: 13 }}><span style={{ color: S.textS }}>{label}</span><span style={{ fontWeight: 500, color: S.text, textAlign: "right", maxWidth: "62%", overflowWrap: "anywhere" }}>{value}</span></div>;
    const editRow = (label, key, last, type) => <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: last ? "none" : `1px solid ${S.borderL}`, fontSize: 13, gap: 10 }}><span style={{ color: S.textS, flexShrink: 0 }}>{label}</span><input value={ed[key] || ""} type={type || "text"} onChange={e => setEditData(prev => ({ ...prev, [key]: e.target.value }))} style={{ flex: 1, maxWidth: 210, textAlign: "right", border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "4px 8px", fontSize: 13, background: S.surface, color: S.text }} /></div>;
    const cardTitle = (t) => <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.6, color: S.textS, textTransform: "uppercase", paddingBottom: 12, borderBottom: `1px solid ${S.borderL}`, marginBottom: 4 }}>{t}</div>;
    const editAreaRow = (label, key, last) => <div key={label} style={{ padding: "9px 0", borderBottom: last ? "none" : `1px solid ${S.borderL}` }}><div style={{ fontSize: 13, color: S.textS, marginBottom: 5 }}>{label}</div><textarea value={ed[key] || ""} rows={3} onChange={e => setEditData(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "6px 9px", fontSize: 13, background: S.surface, color: S.text, resize: "vertical", fontFamily: "inherit" }} /></div>;
    const infoAreaRow = (label, value, last) => <div key={label} style={{ padding: "9px 0", borderBottom: last ? "none" : `1px solid ${S.borderL}` }}><div style={{ fontSize: 13, color: S.textS, marginBottom: 4 }}>{label}</div><div style={{ fontSize: 13, color: value ? S.text : S.textH, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{value || "\u2014"}</div></div>;
    const card = (inner) => <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: "18px 22px" }}>{inner}</div>;
    const isOwnerCo = c.type === "Owner / Principal";
    const cOwnedYachts = yachts.filter(y => y.ownerId === c.id);
    const cOps = liveOps.filter(op => cOwnedYachts.some(y => y.id === op.yachtId));
    const moneyC = (n) => "$" + (n || 0).toLocaleString();
    const dsC = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";
    const cRevenue = cOps.reduce((s, op) => s + (op.totalRevenue || 0), 0);
    const cCost = cOps.reduce((s, op) => s + (op.totalCost || 0), 0);
    const cMarginPct = cRevenue > 0 ? Math.round((cRevenue - cCost) / cRevenue * 100) : 0;
    const cActiveOps = cOps.filter(op => ["Active", "Upcoming"].includes(op.status)).length;
    const cWithRev = cOps.filter(op => (op.totalRevenue || 0) > 0).length;
    const cAvgOp = cWithRev > 0 ? Math.round(cRevenue / cWithRev) : 0;
    return <>
      <button onClick={() => { if (navDepth > 0 && goBack) { goBack(); } else { setSel(null); setEditing(false); } }} style={{ background: "none", border: "none", cursor: "pointer", color: S.textS, display: "flex", alignItems: "center", gap: 3, marginBottom: 10, fontSize: 13 }}><ChevronLeft size={16} /> {navDepth > 0 ? `Back to ${backLabel || "previous"}` : "Back to companies"}</button>

      <div style={{ background: `linear-gradient(120deg, ${S.navy} 0%, #2C6E9E 55%, #3A82B4 100%)`, borderRadius: 14, padding: "26px 28px", marginBottom: 18, color: "#fff", boxShadow: "0 8px 24px rgba(27,79,114,.20)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          {ed.logo ? <img src={ed.logo} alt="" style={{ width: 58, height: 58, borderRadius: 12, objectFit: "cover", background: "#fff", border: "1px solid rgba(255,255,255,.35)", flexShrink: 0 }} /> : <div style={{ width: 58, height: 58, borderRadius: 12, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Building2 size={26} color="rgba(255,255,255,.85)" /></div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.3 }}>{c.name}</span>
              {c.nameAr && <span style={{ fontSize: 16, color: "rgba(255,255,255,.85)", direction: "rtl" }}>{c.nameAr}</span>}
            </div>
            {c.legalName && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", marginTop: 3 }}>{c.legalName}</div>}
            <div style={{ fontSize: 11.5, fontFamily: "monospace", color: "rgba(255,255,255,.7)", marginTop: 6, letterSpacing: 0.5 }}>Company ID {getCompanySerial(c)}</div>
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.92)", marginTop: 8 }}>{headerBits.join("  \u00b7  ")}</div>
            {contactBits.length > 0 && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.68)", marginTop: 5 }}>{contactBits.join("  \u00b7  ")}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {!editing ? <>
              <button onClick={() => { setEditData({ ...c, emails: (c.emails && c.emails.length) ? c.emails : (c.email ? [{ label: "", address: c.email }] : []), ccEmails: (c.ccEmails && c.ccEmails.length) ? c.ccEmails : [], phones: (c.phones && c.phones.length) ? c.phones : (c.phone ? [{ type: "Office", code: "", number: c.phone }] : []) }); setEditing(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.15)", color: "#fff" }}><Edit3 size={13} color={S.orange} /> Edit</button>
              <button onClick={doDelete} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,.22)", background: "rgba(0,0,0,.18)", color: "#fff" }}>Delete</button>
            </> : <>
              <button onClick={() => setEditing(false)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.15)", color: "#fff" }}>Cancel</button>
              <button onClick={saveEdit} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "#fff", color: S.navy }}>Save</button>
            </>}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>{card(<>{cardTitle("Tags")}<TagBox tags={c.tags} allTags={allTags} onChange={t => updCompany(c.id, { tags: t })} /><div style={{ fontSize: 11, color: S.textH, marginTop: 10 }}>Reuse an existing tag for a consistent colour, or create a new one. Tags save instantly and filter the directory.</div></>)}</div>
      {isOwnerCo && <div style={{ marginBottom: 16 }}>{card(<>
        {cardTitle("Ownership · fleet & operations")}
        {cOps.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))", gap: 10, marginBottom: 16 }}>
          {[["Revenue", moneyC(cRevenue)], ["Cost", moneyC(cCost)], ["Margin", cMarginPct + "%"], ["Operations", String(cOps.length)], ["Active now", String(cActiveOps)], ["Avg / op", moneyC(cAvgOp)]].map(([k, v]) => <div key={k} style={{ background: S.bg, borderRadius: 8, padding: "10px 12px" }}><div style={{ fontSize: 10, color: S.textH, textTransform: "uppercase", letterSpacing: 0.3 }}>{k}</div><div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{v}</div></div>)}
        </div>}
        <div style={{ fontSize: 11, fontWeight: 600, color: S.textS, marginBottom: 6 }}>Owned fleet ({cOwnedYachts.length})</div>
        {cOwnedYachts.length > 0 ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: cOps.length > 0 ? 16 : 0 }}>{cOwnedYachts.map(y => <div key={y.id} onClick={() => openYacht && openYacht(y.id, { mod: "companies", type: "company", id: c.id })} style={{ border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 12px", cursor: openYacht ? "pointer" : "default", minWidth: 150 }}><div style={{ fontWeight: 500, fontSize: 12.5 }}>{(y.name || "").toUpperCase()}</div><div style={{ fontSize: 10.5, color: S.textS }}>{y.type}{y.loa ? " · " + y.loa + "m" : ""}{y.flag ? " · " + y.flag : ""}</div></div>)}</div> : <div style={{ fontSize: 11.5, color: S.textH, marginBottom: 4 }}>No vessels linked to this owner.</div>}
        {cOps.length > 0 && <div style={{ overflowX: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: S.textS, marginBottom: 6 }}>Operations history</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead><tr>{["Op #", "Vessel", "Status", "Ports", "ETA – ETD", "Svcs", "Revenue"].map((h, i) => <th key={i} style={{ textAlign: i === 6 ? "right" : (i === 5 ? "center" : "left"), fontSize: 9.5, fontWeight: 500, color: S.textS, textTransform: "uppercase", padding: "6px 8px", borderBottom: `1px solid ${S.borderL}` }}>{h}</th>)}</tr></thead>
            <tbody>{[...cOps].sort((a, b) => (b.eta || "").localeCompare(a.eta || "")).map(op => <tr key={op.id}>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}` }}>{nav ? <span onClick={() => nav("operations", op.id)} style={{ color: S.brand, cursor: "pointer", fontWeight: 500 }}>{op.opNumber}</span> : op.opNumber}</td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}` }}>{op.vesselName}</td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}` }}><Status value={op.status} /></td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS }}>{(op.ports || []).join(" · ") || "—"}</td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}`, color: S.textS, whiteSpace: "nowrap" }}>{dsC(op.eta)}{op.etd && op.etd !== op.eta ? " – " + dsC(op.etd) : ""}</td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "center" }}>{op.serviceCount || 0}</td>
              <td style={{ padding: "7px 8px", borderBottom: `1px solid ${S.borderL}`, textAlign: "right", whiteSpace: "nowrap" }}>{(op.totalRevenue || 0) > 0 ? moneyC(op.totalRevenue) : "—"}</td>
            </tr>)}
            <tr><td colSpan={5} style={{ padding: "7px 8px", fontWeight: 600 }}>Total</td><td style={{ padding: "7px 8px", fontWeight: 600, textAlign: "center" }}>{cOps.reduce((s, op) => s + (op.serviceCount || 0), 0)}</td><td style={{ padding: "7px 8px", fontWeight: 600, textAlign: "right" }}>{moneyC(cRevenue)}</td></tr>
            </tbody>
          </table>
        </div>}
        <div style={{ marginTop: (cOps.length > 0 || cOwnedYachts.length > 0) ? 16 : 0, paddingTop: 14, borderTop: `1px solid ${S.borderL}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: S.textS, marginBottom: 10 }}>CRM &amp; preferences</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
            {OWNER_CRM.map(cat => { const cur = (c.crm || {})[cat.key]; const selv = cat.multi ? (Array.isArray(cur) ? cur : []) : cur; const setVal = (v) => updCompany(c.id, { crm: { ...(c.crm || {}), [cat.key]: v } }); return <div key={cat.key}>
              <div style={{ fontSize: 10, color: S.textH, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.3 }}>{cat.label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{cat.opts.map(opt => { const on = cat.multi ? selv.includes(opt) : selv === opt; const tcc = tagColor(opt); return <span key={opt} onClick={() => { if (cat.multi) setVal(on ? selv.filter(x => x !== opt) : [...selv, opt]); else setVal(on ? "" : opt); }} style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 500, cursor: "pointer", background: on ? tcc.bg : "transparent", color: on ? tcc.fg : S.textS, border: `1px solid ${on ? tcc.bg : S.border}` }}>{opt}</span>; })}</div>
            </div>; })}
          </div>
        </div>
      </>)}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {card(<>
          {cardTitle("Company Information")}
          {editing
            ? [editRow("Display name", "name"), editRow("Arabic name", "nameAr"), editRow("Business / legal name", "legalName"), editSelectRow("Type", "type", ["Agency", "Builder", "Broker", "Classification Society", "Exterior Designer", "Government Authority", "Interior Designer", "Management", "Marina", "Naval Architect", "Supplier", "Owner / Principal"]), editSelectRow("Country", "country", FLAG_COUNTRIES), <div key="Founded" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${S.borderL}`, fontSize: 13, gap: 10 }}><span style={{ color: S.textS, flexShrink: 0 }}>Founded</span><div style={{ flex: 1, maxWidth: 210, display: "flex", justifyContent: "flex-end" }}><SearchSelect value={ed.founded ? String(ed.founded) : ""} options={YEARS} placeholder="Select year..." width="100%" onChange={v => setEditData(prev => ({ ...prev, founded: v }))} /></div></div>, editRow("Employees", "employees"), editAreaRow("Notes", "notes", true)]
            : [infoRow("Business name", c.legalName || c.name), infoRow("Type", <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: `${tc}18`, color: tc, fontWeight: 600 }}>{c.type}</span>), infoRow("Country", c.country || "\u2014"), infoRow("Founded", (c.founded && c.founded > 0) ? c.founded : "\u2014"), infoRow("Employees", c.employees || "\u2014"), infoAreaRow("Notes", c.notes, true)]}
          {editing && <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, marginTop: 6, borderTop: `1px solid ${S.borderL}` }}>
            {ed.logo ? <img src={ed.logo} alt="" style={{ width: 42, height: 42, borderRadius: 7, objectFit: "cover", border: `1px solid ${S.border}` }} /> : <div style={{ width: 42, height: 42, borderRadius: 7, background: S.bg, display: "flex", alignItems: "center", justifyContent: "center", color: S.textH }}><Building2 size={18} /></div>}
            <label style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}>Upload logo<input type="file" accept="image/*" onChange={onLogo} style={{ display: "none" }} /></label>
            {ed.logo && <button onClick={() => setEditData(prev => ({ ...prev, logo: "" }))} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Remove</button>}
            <input value={ed.logo && ed.logo.startsWith("data:") ? "" : (ed.logo || "")} placeholder="or paste logo URL" onChange={e => setEditData(prev => ({ ...prev, logo: e.target.value }))} style={{ flex: 1, minWidth: 80, border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "5px 8px", fontSize: 12, background: S.surface, color: S.text }} />
          </div>}
        </>)}
        {card(<>
          {cardTitle("Contact Details")}
          {editing ? <>
            <div style={{ paddingBottom: 6, marginBottom: 4, borderBottom: `1px solid ${S.borderL}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: S.textS }}>Email addresses</span>
                <button onClick={addEmail} style={{ padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}>+ Add email</button>
              </div>
              {(ed.emails && ed.emails.length) ? ed.emails.map((em, i) => { const ok = !em.address || EMAIL_RE.test(em.address); return <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "6px 0", borderBottom: i === ed.emails.length - 1 ? "none" : `1px solid ${S.borderL}` }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={em.address || ""} type="email" inputMode="email" placeholder="name@company.com" onChange={e => setEmail(i, "address", e.target.value)} style={{ flex: 1, minWidth: 80, border: `1px solid ${ok ? S.brand + "40" : S.red}`, borderRadius: 4, padding: "4px 8px", fontSize: 12.5, background: S.surface, color: S.text }} />
                  <input value={em.label || ""} placeholder="Label" onChange={e => setEmail(i, "label", e.target.value)} style={{ width: 90, border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "4px 8px", fontSize: 12, background: S.surface, color: S.text }} />
                  <button onClick={() => rmEmail(i)} style={{ padding: "2px 9px", borderRadius: 5, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Remove</button>
                </div>
                {!ok && <div style={{ fontSize: 10, color: S.red }}>Enter a valid email address</div>}
              </div>; }) : <div style={{ fontSize: 12, color: S.textH, padding: "2px 0 4px" }}>No email addresses yet. Use + Add email.</div>}
            </div>
            <div style={{ paddingBottom: 6, marginBottom: 4, borderBottom: `1px solid ${S.borderL}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: S.textS }}>CC Email</span>
                <button onClick={addCcEmail} style={{ padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}>+ Add CC email</button>
              </div>
              {(ed.ccEmails && ed.ccEmails.length) ? ed.ccEmails.map((em, i) => { const ok = !em.address || EMAIL_RE.test(em.address); return <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "6px 0", borderBottom: i === ed.ccEmails.length - 1 ? "none" : `1px solid ${S.borderL}` }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={em.address || ""} type="email" inputMode="email" placeholder="cc@company.com" onChange={e => setCcEmail(i, e.target.value)} style={{ flex: 1, minWidth: 80, border: `1px solid ${ok ? S.brand + "40" : S.red}`, borderRadius: 4, padding: "4px 8px", fontSize: 12.5, background: S.surface, color: S.text }} />
                  <button onClick={() => rmCcEmail(i)} style={{ padding: "2px 9px", borderRadius: 5, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Remove</button>
                </div>
                {!ok && <div style={{ fontSize: 10, color: S.red }}>Enter a valid email address</div>}
              </div>; }) : <div style={{ fontSize: 12, color: S.textH, padding: "2px 0 4px" }}>No CC addresses yet. Use + Add CC email.</div>}
            </div>
            {editRow("Website", "website")}
            <div style={{ paddingTop: 10, marginTop: 4, borderTop: `1px solid ${S.borderL}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: S.textS }}>Phone numbers</span>
                <button onClick={addPhone} style={{ padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}>+ Add phone</button>
              </div>
              {(ed.phones && ed.phones.length) ? ed.phones.map((p, i) => { const other = !PHONE_TYPES.includes(p.type); return <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5, padding: "8px 0", borderBottom: i === ed.phones.length - 1 ? "none" : `1px solid ${S.borderL}` }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select value={other ? "__other__" : p.type} onChange={e => setPhone(i, "type", e.target.value === "__other__" ? "" : e.target.value)} style={{ border: `1px solid ${S.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 12, background: S.surface, color: S.text }}>
                    {PHONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    <option value="__other__">Other / name it</option>
                  </select>
                  {other && <input value={p.type || ""} placeholder="Name this type" onChange={e => setPhone(i, "type", e.target.value)} style={{ flex: 1, minWidth: 60, border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "4px 8px", fontSize: 12, background: S.surface, color: S.text }} />}
                  <button onClick={() => rmPhone(i)} style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: 5, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Remove</button>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 170 }}><SearchSelect value={p.code || ""} options={COUNTRY_CODE_LABELS} onChange={v => setPhone(i, "code", extractDial(v))} placeholder="Search country / code" width="100%" /></div>
                  <input value={p.number || ""} inputMode="tel" placeholder="Phone number" onChange={e => setPhone(i, "number", e.target.value.replace(/[^\d\s()\-]/g, ""))} style={{ flex: 1, minWidth: 80, border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "4px 8px", fontSize: 12.5, background: S.surface, color: S.text }} />
                </div>
              </div>; }) : <div style={{ fontSize: 12, color: S.textH, padding: "2px 0 4px" }}>No phone numbers yet. Use + Add phone.</div>}
            </div>
          </> : <>
            <div style={{ paddingBottom: 9, marginBottom: 9, borderBottom: `1px solid ${S.borderL}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: S.textS, marginBottom: 5 }}>Email addresses</div>
              {(c.emails && c.emails.filter(x => x && x.address).length) ? c.emails.filter(x => x && x.address).map((em, i) => <div key={i} style={{ padding: "4px 0", fontSize: 13 }}>{em.label && <span style={{ color: S.textS, marginRight: 6 }}>{em.label}:</span>}<a href={`mailto:${em.address}`} style={{ color: S.brand, textDecoration: "underline", overflowWrap: "anywhere" }}>{em.address}</a></div>) : <div style={{ fontSize: 13, color: c.email ? S.text : S.textH }}>{c.email ? <a href={`mailto:${c.email}`} style={{ color: S.brand, textDecoration: "underline" }}>{c.email}</a> : "\u2014"}</div>}
              {(c.ccEmails && c.ccEmails.filter(x => x && x.address).length) ? <div style={{ marginTop: 6 }}><div style={{ fontSize: 11, fontWeight: 600, color: S.textH, marginBottom: 3 }}>CC</div>{c.ccEmails.filter(x => x && x.address).map((em, i) => <div key={i} style={{ padding: "2px 0", fontSize: 13 }}><a href={`mailto:${em.address}`} style={{ color: S.brand, textDecoration: "underline", overflowWrap: "anywhere" }}>{em.address}</a></div>)}</div> : null}
            </div>
            {infoRow("Website", c.website ? <a href={c.website.startsWith("http") ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" style={{ color: S.brand, textDecoration: "underline" }}>{c.website}</a> : "\u2014")}
            <div style={{ paddingTop: 10, marginTop: 4, borderTop: `1px solid ${S.borderL}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: S.textS, marginBottom: 4 }}>Phone numbers</div>
              {(c.phones && c.phones.length) ? c.phones.map((p, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i === c.phones.length - 1 ? "none" : `1px solid ${S.borderL}`, fontSize: 13 }}>
                <span style={{ color: S.textS }}>{p.type || "Phone"}</span>
                <span style={{ fontWeight: 500, color: S.text }}>{[p.code, p.number].filter(Boolean).join(" ") || "\u2014"}</span>
              </div>) : <div style={{ fontSize: 13, color: c.phone ? S.text : S.textH, fontWeight: c.phone ? 500 : 400 }}>{c.phone || "\u2014"}</div>}
            </div>
          </>}
        </>)}
        {card(<>
          {cardTitle("Legal & Registration")}
          {editing
            ? [editRow("Tax / VAT number", "taxNumber"), editRow("Registration number", "registrationNumber", true)]
            : [infoRow("Tax / VAT number", c.taxNumber || "\u2014"), infoRow("Registration number", c.registrationNumber || "\u2014", true)]}
        </>)}
        {card(<>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: `1px solid ${S.borderL}`, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.6, color: S.textS, textTransform: "uppercase" }}>Social Media</span>
            {editing && <button onClick={addSocial} style={{ padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}>+ Add</button>}
          </div>
          {editing ? ((ed.socials && ed.socials.length) ? ed.socials.map((sm, i) => { const other = !SOCIAL_OPTIONS.includes(sm.platform); const Ic = socialMeta(sm.platform).Ic; return <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5, padding: "8px 0", borderBottom: i === ed.socials.length - 1 ? "none" : `1px solid ${S.borderL}` }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Ic size={15} color={socialMeta(sm.platform).color} />
              <select value={other ? "Other" : sm.platform} onChange={e => setSocial(i, "platform", e.target.value === "Other" ? "" : e.target.value)} style={{ border: `1px solid ${S.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 12, background: S.surface, color: S.text }}>
                {SOCIAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                <option value="Other">Other / name it</option>
              </select>
              {other && <input value={sm.platform || ""} placeholder="Name" onChange={e => setSocial(i, "platform", e.target.value)} style={{ flex: 1, minWidth: 50, border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "4px 8px", fontSize: 12, background: S.surface, color: S.text }} />}
              <button onClick={() => rmSocial(i)} style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: 5, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Remove</button>
            </div>
            <input value={sm.url || ""} placeholder="Profile URL (e.g. instagram.com/felix)" onChange={e => setSocial(i, "url", e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "5px 8px", fontSize: 12.5, background: S.surface, color: S.text }} />
          </div>; }) : <div style={{ fontSize: 12.5, color: S.textH, padding: "4px 0" }}>No social links yet. Use + Add.</div>)
            : ((c.socials && c.socials.filter(x => x && x.url).length) ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 2 }}>{c.socials.filter(x => x && x.url).map((sm, i) => { const meta = socialMeta(sm.platform); const Ic = meta.Ic; return <a key={i} href={sm.url.startsWith("http") ? sm.url : "https://" + sm.url} target="_blank" rel="noreferrer" title={sm.platform} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 20, fontSize: 12, fontWeight: 500, textDecoration: "none", border: `1px solid ${meta.color}40`, background: `${meta.color}12`, color: meta.color }}><Ic size={14} color={meta.color} />{sm.platform}</a>; })}</div> : <div style={{ fontSize: 12.5, color: S.textH, padding: "4px 0" }}>{"\u2014"}</div>)}
        </>)}
      </div>

      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: "16px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: S.navy }}>Addresses</span>
          {editing && <button onClick={addAddr} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}>+ Add other address</button>}
        </div>
        {editing ? <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: S.textS, marginBottom: 5 }}>Physical address</div>
              <textarea value={ed.physicalAddress || ""} placeholder="Street, city, country" rows={3} onChange={e => setEditData(prev => ({ ...prev, physicalAddress: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "6px 9px", fontSize: 12.5, background: S.surface, color: S.text, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: S.textS }}>Billing address</span>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: S.textS, cursor: "pointer" }}><input type="checkbox" checked={!!ed.billingSameAsPhysical} onChange={e => setEditData(prev => ({ ...prev, billingSameAsPhysical: e.target.checked }))} style={{ cursor: "pointer" }} /> Same as physical</label>
              </div>
              {ed.billingSameAsPhysical ? <div style={{ fontSize: 12.5, color: S.textH, padding: "6px 9px", border: `1px dashed ${S.border}`, borderRadius: 4, background: S.bg }}>Billing uses the physical address.</div>
                : <textarea value={ed.billingAddress || ""} placeholder="Street, city, country" rows={3} onChange={e => setEditData(prev => ({ ...prev, billingAddress: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "6px 9px", fontSize: 12.5, background: S.surface, color: S.text, resize: "vertical", fontFamily: "inherit" }} />}
            </div>
          </div>
          {(ed.addresses && ed.addresses.length > 0) && <div style={{ fontSize: 12, fontWeight: 600, color: S.textS, marginBottom: 4, paddingTop: 8, borderTop: `1px solid ${S.borderL}` }}>Other addresses</div>}
          {(ed.addresses || []).map((a, i) => <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5, padding: "8px 0", borderBottom: i === ed.addresses.length - 1 ? "none" : `1px solid ${S.borderL}` }}>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={a.label || ""} placeholder="Label (e.g. Warehouse)" onChange={e => setAddr(i, "label", e.target.value)} style={{ width: 160, border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "4px 8px", fontSize: 12.5, background: S.surface, color: S.text }} />
              <button onClick={() => rmAddr(i)} style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: 5, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Remove</button>
            </div>
            <textarea value={a.text || ""} placeholder="Full address" rows={2} onChange={e => setAddr(i, "text", e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "5px 8px", fontSize: 12.5, background: S.surface, color: S.text, resize: "vertical", fontFamily: "inherit" }} />
          </div>)}
        </> : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><div style={{ fontSize: 12, fontWeight: 600, color: S.textS, marginBottom: 4 }}>Physical address</div><div style={{ fontSize: 13, color: c.physicalAddress ? S.text : S.textH, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{c.physicalAddress || "\u2014"}</div></div>
          <div><div style={{ fontSize: 12, fontWeight: 600, color: S.textS, marginBottom: 4 }}>Billing address</div><div style={{ fontSize: 13, color: (c.billingSameAsPhysical || c.billingAddress) ? S.text : S.textH, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{c.billingSameAsPhysical ? "Same as physical address" : (c.billingAddress || "\u2014")}</div></div>
          {addrList.length > 0 && <div style={{ gridColumn: "1 / -1", paddingTop: 10, borderTop: `1px solid ${S.borderL}` }}>{addrList.map((a, i) => <div key={i} style={{ padding: "7px 0", borderBottom: i === addrList.length - 1 ? "none" : `1px solid ${S.borderL}`, fontSize: 13 }}>{a.label && <span style={{ fontWeight: 500, color: S.text }}>{a.label}: </span>}<span style={{ color: S.textS, overflowWrap: "anywhere" }}>{a.text || "\u2014"}</span></div>)}</div>}
        </div>}
      </div>

      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: "16px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: S.navy }}>Documents <span style={{ fontSize: 11.5, fontWeight: 400, color: S.textH }}>· saved automatically</span></span>
          <button onClick={addDoc} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}>+ Add document</button>
        </div>
        {docList.length ? docList.map((d, i) => { const other = !DOC_TYPES.includes(d.docType); return <div key={i} style={{ padding: "10px 0", borderBottom: i === docList.length - 1 ? "none" : `1px solid ${S.borderL}` }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <select value={other ? "Other" : d.docType} onChange={e => setDoc(i, "docType", e.target.value === "Other" ? "" : e.target.value)} style={{ border: `1px solid ${S.border}`, borderRadius: 4, padding: "4px 6px", fontSize: 12, background: S.surface, color: S.text }}>
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="Other">Other / name it</option>
            </select>
            {other && <input value={d.docType || ""} placeholder="Name this document" onChange={e => setDoc(i, "docType", e.target.value)} style={{ width: 200, border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "4px 8px", fontSize: 12, background: S.surface, color: S.text }} />}
            <button onClick={() => rmDoc(i)} style={{ marginLeft: "auto", padding: "2px 9px", borderRadius: 5, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Remove</button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}><Upload size={13} /> {d.fileName ? "Replace file" : "Upload file"}<input type="file" accept="image/*,application/pdf" onChange={e => onDocFile(i, e)} style={{ display: "none" }} /></label>
            {d.fileData && <a href={d.fileData} download={d.fileName || (d.docType || "document")} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: S.brand, textDecoration: "none", fontWeight: 500 }}><Download size={13} /> {d.fileName || "View / Download"}</a>}
            {d.fileData && <button onClick={() => { const arr = [...docList]; arr[i] = { ...arr[i], fileData: "", fileName: "" }; saveDocs(arr); }} style={{ padding: "1px 7px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Clear file</button>}
            <input value={d.url || ""} placeholder="or paste document link (Drive / SharePoint / URL)" onChange={e => setDoc(i, "url", e.target.value)} style={{ flex: 1, minWidth: 160, border: `1px solid ${S.brand}40`, borderRadius: 4, padding: "5px 8px", fontSize: 12, background: S.surface, color: S.text }} />
            {d.url && <a href={d.url.startsWith("http") ? d.url : "https://" + d.url} target="_blank" rel="noreferrer" title="Open link" style={{ display: "inline-flex", alignItems: "center", color: S.brand }}><ExternalLink size={15} /></a>}
          </div>
        </div>; }) : <div style={{ fontSize: 12.5, color: S.textH, padding: "4px 0" }}>No documents yet. Use + Add document to upload a file or paste a link.</div>}
      </div>

      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: "16px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: (linkedPersons.length || linking) ? 12 : 6 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: S.navy }}>Contacts ({linkedPersons.length})</span>
          <button onClick={() => setLinking(v => !v)} style={{ padding: "6px 13px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: linking ? S.brand : "transparent", color: linking ? "#fff" : S.brand }}>{linking ? "Done" : "+ Link person"}</button>
        </div>
        {linking && <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${S.borderL}` }}>
          <div style={{ flex: 1, maxWidth: 320 }}><SearchSelect value="" options={persons.filter(p => !contactIds.includes(p.id)).map(p => p.fullName)} placeholder="Search Person DB to link..." width="100%" onChange={(name) => { const p = persons.find(x => x.fullName === name); if (p && linkContact) linkContact(c.id, p.id); }} /></div>
          <span style={{ fontSize: 11, color: S.textH }}>Pick a person to link them to this company.</span>
        </div>}
        {linkedPersons.length > 0 ? linkedPersons.map((p, i) => <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i === linkedPersons.length - 1 ? "none" : `1px solid ${S.borderL}`, fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: S.brandL, color: S.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{p.fullName.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("")}</div>
            <div><div style={{ fontWeight: 500 }}>{p.fullName}</div><div style={{ fontSize: 11, color: S.textH }}>{[p.rank, p.nationality].filter(Boolean).join("  \u00b7  ")}</div></div>
          </div>
          <button onClick={() => unlinkContact && unlinkContact(c.id, p.id)} style={{ padding: "4px 11px", borderRadius: 5, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Unlink</button>
        </div>) : (!linking && <div style={{ fontSize: 12.5, color: S.textH }}>No contacts linked. Link people from the Person DB \u2014 the relationship shows on their profile too.</div>)}
      </div>

      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: "16px 22px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: S.navy, marginBottom: 12 }}>Linked Yachts ({cYachts.length})</div>
        {cYachts.length > 0 ? <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead><tr style={{ textAlign: "left", color: S.textS }}>
              {["Yacht", "Type", "LOA", "GT", "Year", "Flag"].map(h => <th key={h} style={{ padding: "8px 14px 8px 0", fontWeight: 500, fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", borderBottom: `1px solid ${S.border}`, whiteSpace: "nowrap" }}>{h}</th>)}
            </tr></thead>
            <tbody>{cYachts.map(y => <tr key={y.id} onClick={() => openYacht && openYacht(y.id, { mod: "companies", type: "company", id: c.id })} style={{ cursor: openYacht ? "pointer" : "default" }} onMouseEnter={e => e.currentTarget.style.background = S.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "9px 14px 9px 0", borderBottom: `1px solid ${S.borderL}`, fontWeight: 500, color: S.brand, whiteSpace: "nowrap" }}>{(y.name || "").toUpperCase()} <ChevronRight size={12} style={{ verticalAlign: "middle", opacity: 0.5 }} /></td>
              <td style={{ padding: "9px 14px 9px 0", borderBottom: `1px solid ${S.borderL}` }}>{y.type || "\u2014"}</td>
              <td style={{ padding: "9px 14px 9px 0", borderBottom: `1px solid ${S.borderL}` }}>{y.loa ? y.loa + "m" : "\u2014"}</td>
              <td style={{ padding: "9px 14px 9px 0", borderBottom: `1px solid ${S.borderL}` }}>{y.gt || "\u2014"}</td>
              <td style={{ padding: "9px 14px 9px 0", borderBottom: `1px solid ${S.borderL}` }}>{y.yearBuilt || "\u2014"}</td>
              <td style={{ padding: "9px 14px 9px 0", borderBottom: `1px solid ${S.borderL}` }}>{y.flag || "\u2014"}</td>
            </tr>)}</tbody>
          </table>
        </div> : <div style={{ fontSize: 12.5, color: S.textH }}>No yachts linked to this company.</div>}
      </div>
    </>;
  }

  return <>
    <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 24, marginBottom: 14, flexWrap: "wrap" }}>
        <div><div style={{ fontSize: 11, color: S.textS, marginBottom: 3 }}>Total companies</div><div style={{ fontSize: 26, fontWeight: 600, color: S.text, lineHeight: 1 }}>{companies.length.toLocaleString()}</div></div>
        <div style={{ width: 1, background: S.borderL, alignSelf: "stretch" }} />
        <div><div style={{ fontSize: 11, color: S.textS, marginBottom: 3 }}>Categories</div><div style={{ fontSize: 26, fontWeight: 600, color: S.text, lineHeight: 1 }}>{typeBreakdown.length}</div></div>
      </div>
      <div style={{ display: "flex", height: 18, borderRadius: 5, overflow: "hidden", marginBottom: 12, background: S.borderL }}>
        {typeBreakdown.map(b => <div key={b.type} title={`${b.type}: ${b.count.toLocaleString()} (${(b.count / Math.max(companies.length, 1) * 100).toFixed(1)}%)`} style={{ width: `${(b.count / Math.max(companies.length, 1) * 100).toFixed(3)}%`, minWidth: 2, background: typeColors[b.type] || S.textS }} />)}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 16px", fontSize: 11.5 }}>
        {typeBreakdown.map(b => <span key={b.type} style={{ display: "inline-flex", alignItems: "center", gap: 5, color: S.textS }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: typeColors[b.type] || S.textS, flexShrink: 0 }} />
          {b.type} <span style={{ fontWeight: 600, color: S.text }}>{b.count.toLocaleString()}</span>
        </span>)}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 4, padding: "6px 10px", minWidth: 180 }}><Search size={14} color={S.textH} /><input value={s} onChange={e => setS(e.target.value)} placeholder="Search..." style={{ border: "none", outline: "none", fontSize: 12, background: "transparent", width: "100%" }} /></div>
      {compTypes.slice(0, 20).map(t => <button key={t} onClick={() => setTf(t)} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${tf === t ? (typeColors[t] || S.brand) : S.border}`, background: tf === t ? (typeColors[t] || S.brand) : "transparent", color: tf === t ? "#fff" : S.text }}>{t === "Government Authority" ? "Gov. Auth." : t}</button>)}
      <button onClick={() => setVw(vw === "cards" ? "table" : "cards")} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text, marginLeft: "auto" }}>{vw === "cards" ? "Table view" : "Cards view"}</button>
      <button onClick={() => { if (!allC.length) { alert("No companies to export with the current filter."); return; } exportRegistryToExcel(allC, COMPANY_XLSX_SPEC, "Companies", "Felix_Companies", getCompanySerial, () => {}); }} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📤 Export Excel</button>
      <label style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📥 Import Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={e => { const f = e.target.files[0]; if (f) importRegistryFromExcel(f, COMPANY_XLSX_SPEC, rows => { if (!rows.length) { alert("No valid rows found. Ensure the sheet has a 'Name' column."); return; } importCompanies && importCompanies(rows); }, () => alert("Could not read the spreadsheet. Save it as .xlsx or .csv and try again.")); e.target.value = ""; }} style={{ display: "none" }} /></label>
      <button onClick={() => setAdding(!adding)} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: adding ? "transparent" : S.brand, color: adding ? S.brand : "#fff" }}>{adding ? "Cancel" : "+ Add"}</button>
    </div>
    {compTagsInUse.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}><span style={{ fontSize: 10, color: S.textH, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 2 }}>Filter by tag</span>{compTagsInUse.map(t => { const tc = tagColor(t); const on = tagFilter === t; return <button key={t} onClick={() => setTagFilter(on ? null : t)} style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${on ? tc.fg : S.border}`, background: on ? tc.fg : tc.bg, color: on ? "#fff" : tc.fg }}>{t}</button>; })}{tagFilter && <button onClick={() => setTagFilter(null)} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Clear</button>}</div>}
    {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 6, padding: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>New company</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 2 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Name *</div><input value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 6px", fontSize: 11, background: S.surface }} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Arabic name</div><input value={nc.nameAr} onChange={e => setNc({ ...nc, nameAr: e.target.value })} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 6px", fontSize: 11, background: S.surface, direction: "rtl" }} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Type</div><SearchSelect value={nc.type} options={["Management", "Builder", "Broker", "Marina", "Supplier", "Government Authority", "Agent", "Exterior Designer", "Interior Designer", "Naval Architect", "Classification Society", "Owner / Principal"]} placeholder="Select..." width="100%" onChange={v => setNc({ ...nc, type: v })} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Country</div><input value={nc.country} onChange={e => setNc({ ...nc, country: e.target.value })} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 3, padding: "4px 6px", fontSize: 11, background: S.surface }} /></div>
      </div>
      <button onClick={handleAdd} disabled={!nc.name} style={{ padding: "5px 16px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: nc.name ? "pointer" : "default", border: "none", background: nc.name ? S.brand : S.border, color: nc.name ? "#fff" : S.textH }}>Save company</button>
    </div>}
{vw === "cards" ? <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
      {allC.slice(0, 500).map(c => { const cc = typeColors[c.type] || S.textS; const cinit = (c.name || "?").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase(); const cEmail = c.email || ((c.emails || []).find(e => e && e.address) || {}).address; return <div key={c.id} onClick={() => setSel(c.id)} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          {c.logo ? <img src={c.logo} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: `1px solid ${S.border}`, flexShrink: 0 }} /> : <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${cc}1A`, color: cc, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{cinit}</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
              {c.nameAr && <span style={{ fontSize: 11, color: S.textH, direction: "rtl" }}>{c.nameAr}</span>}
            </div>
            <div style={{ fontSize: 11, color: S.textS, marginTop: 1 }}>{[c.country, (c.founded && c.founded > 0) ? `Founded ${c.founded}` : null].filter(Boolean).join("  ·  ") || "—"}</div>
          </div>
          <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, background: `${cc}18`, color: cc, fontWeight: 500, flexShrink: 0, whiteSpace: "nowrap" }}>{c.type}</span>
        </div>
        <div style={{ fontSize: 10, fontFamily: "monospace", color: S.textH, marginBottom: 6 }}>{getCompanySerial(c)}</div>
        <div style={{ fontSize: 11, color: S.textH }}>
          {cEmail && <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span style={{ color: S.textS }}>Email:</span> <span style={{ color: S.brand }}>{cEmail}</span></div>}
          {c.website && <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><span style={{ color: S.textS }}>Web:</span> <span style={{ color: S.brand }}>{c.website}</span></div>}
        </div>
        {(c.tags && c.tags.length) ? <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 6 }}><TagChips tags={c.tags} onClick={(t) => setTagFilter(t === tagFilter ? null : t)} active={tagFilter} /></div> : null}
      </div>; })}
    </div> : <Table columns={[
      { key: "id", label: "Company ID", render: (_, r) => <span style={{ fontFamily: "monospace", fontSize: 11, color: S.textS }}>{getCompanySerial(r)}</span> },
      { key: "name", label: "Company", render: (v, r) => <div onClick={() => setSel(r.id)} style={{ cursor: "pointer" }}><span style={{ fontWeight: 500, color: S.brand }}>{v}</span>{r.nameAr && <span style={{ fontSize: 10, color: S.textH, marginLeft: 6 }}>{r.nameAr}</span>}</div> },
      { key: "type", label: "Type", render: v => { const cc = typeColors[v] || S.textS; return <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: `${cc}18`, color: cc, fontWeight: 500 }}>{v}</span>; } },
      { key: "country", label: "Country" },
      { key: "founded", label: "Founded", render: v => v && v > 0 ? v : "—" },
      { key: "tags", label: "Tags", render: (v, r) => <TagChips tags={r.tags} onClick={(t) => setTagFilter(t === tagFilter ? null : t)} active={tagFilter} /> },
    ]} data={allC.slice(0, 500)} />}
    {allC.length > 500 && <div style={{ fontSize: 11, color: S.textS, padding: "8px 4px" }}>Showing first 500 of {allC.length} companies — refine the search or choose a type filter to narrow.</div>}
  </>;
};

const PersonsView = ({ allPersons, addPerson, importPersons, allCompanies, companyContacts, updPerson, allTags, allYachts, allOps, nav, openYacht, deletePerson, linkContact, unlinkContact }) => {
  const liveOps = allOps || OPERATIONS;
  const persons = allPersons || PERSONS;
  const [s, setS] = useState("");
  const [tagFilter, setTagFilter] = useState(null);
  const [adding, setAdding] = useState(false);
  const [np, setNp] = useState({ fullName: "", nationality: "", rank: "Captain", passportNumber: "", passportExpiry: "" });
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [editD, setEditD] = useState({});
  const [docDraft, setDocDraft] = useState({ type: "", ref: "", dateIssued: "", dateExpiry: "", notes: "" });
  const [svcDraft, setSvcDraft] = useState({ yacht: "", role: "", port: "", dateFrom: "", dateTo: "", notes: "" });
  const [noteDraft, setNoteDraft] = useState("");
  const [svcOpen, setSvcOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [sortKey, setSortKey] = useState("fullName");
  const [sortDir, setSortDir] = useState("asc");
  const [vw, setVw] = useState("cards");
  const filtered = persons.filter(p => (s === "" || p.fullName.toLowerCase().includes(s.toLowerCase()) || (p.nationality || "").toLowerCase().includes(s.toLowerCase()) || (p.rank || "").toLowerCase().includes(s.toLowerCase()) || (p.passportNumber || "").includes(s)) && (!tagFilter || (p.tags || []).includes(tagFilter)));
  const personTagsInUse = [...new Set(persons.flatMap(p => p.tags || []))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const handleAdd = () => { if (!np.fullName) return; addPerson({ ...np }); setNp({ fullName: "", nationality: "", rank: "Captain", passportNumber: "", passportExpiry: "" }); setAdding(false); };
  const personSerialById = useMemo(() => { const m = {}; persons.forEach((x, i) => { m[x.id] = personSerial(x, i); }); return m; }, [persons]);
  const getPersonSerial = (x) => (x && (x.serial || personSerialById[x.id])) || personSerial(x);
  const p = sel ? persons.find(x => x.id === sel) : null;
  if (p) {
    const isOwner = p.rank === "Owner";
    const init = (p.fullName || "?").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
    const pYachts = (allYachts || []).filter(y => y.ownerId === p.id);
    const pOps = liveOps.filter(op => pYachts.some(y => y.id === op.yachtId)).sort((a, b) => (b.eta || b.created || "").localeCompare(a.eta || a.created || ""));
    const svc = [...(p.serviceHistory || [])].map((e, i) => ({ ...e, _i: i })).sort((a, b) => (b.dateFrom || b.date || "").localeCompare(a.dateFrom || a.date || ""));
    const svcVessels = [...new Set(svc.map(e => e.yacht).filter(Boolean))];
    const ownsCount = pYachts.length;
    const recCount = svc.length;
    const vesselCount = isOwner ? ownsCount : svcVessels.length;
    const restricted = RESTRICTED_NATS[p.nationality];
    const linkedCompanies = (allCompanies || COMPANIES).filter(c => ((companyContacts || {})[c.id] || []).includes(p.id));
    const unlinkedCompanies = (allCompanies || COMPANIES).filter(c => !((companyContacts || {})[c.id] || []).includes(p.id));
    const crm = p.crm || {};
    const docs = [...(p.documents || [])];
    const oRevenue = pOps.reduce((a, op) => a + (op.totalRevenue || 0), 0);
    const oCost = pOps.reduce((a, op) => a + (op.totalCost || 0), 0);
    const oActive = pOps.filter(op => ["Active", "Upcoming"].includes(op.status)).length;
    const oMargin = oRevenue > 0 ? Math.round((oRevenue - oCost) / oRevenue * 100) : 0;
    const lastActive = p.lastActive || (svc.length ? (svc[0].dateTo || svc[0].dateFrom || svc[0].date || "") : (isOwner && pOps.length ? (pOps[0].eta || pOps[0].created || "") : ""));
    const money = (n) => "$" + (n || 0).toLocaleString();
    const ppDays = p.passportExpiry ? Math.round((new Date(p.passportExpiry) - new Date()) / 86400000) : null;
    const ppColor = ppDays == null ? S.textS : ppDays < 0 ? S.red : ppDays < 90 ? S.orange : S.green;
    const tcr = crm.tier ? tagColor(crm.tier) : null;
    const yByName = (nm) => (allYachts || []).find(y => (y.name || "").toLowerCase() === (nm || "").toLowerCase());
    const consentC = crm.consent === "Opted In" ? { bg: S.greenBg, fg: S.green } : crm.consent === "Opted Out" ? { bg: "#FDECEC", fg: S.red } : null;

    const lblS = { fontSize: 10.5, color: S.textH, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 };
    const inp = { width: "100%", border: `1px solid ${S.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 13, background: S.surface, outline: "none", boxSizing: "border-box", color: S.text };
    const sectT = { fontSize: 15, fontWeight: 700, color: S.navy, marginBottom: 16 };
    const cardW = { background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: "20px 22px", marginBottom: 14 };
    const hdrPill = { padding: "3px 13px", borderRadius: 999, fontSize: 12, fontWeight: 600, display: "inline-block" };
    const btnW = { padding: "9px 20px", borderRadius: 7, fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "#fff" };
    const btnDel = { padding: "9px 20px", borderRadius: 7, fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(255,150,150,0.55)", background: "transparent", color: "#FF9D9D" };
    const btnGhost = { padding: "7px 15px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.surface, color: S.brand };
    const btnGreen = { padding: "7px 15px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1px solid ${S.green}`, background: S.surface, color: S.green };
    const btnPrimary = { padding: "9px 22px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: S.navy, color: "#fff" };
    const btnOutline = { padding: "9px 22px", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: S.surface, color: S.textS };
    const dPill = { fontSize: 12.5, fontWeight: 500, padding: "6px 14px", borderRadius: 8, border: `1px dashed ${S.border}`, background: S.surface, display: "inline-block" };

    const startEdit = () => { setEditD({ fullName: p.fullName || "", nationality: p.nationality || "", rank: p.rank || "", profession: p.profession || "", passportNumber: p.passportNumber || "", passportExpiry: p.passportExpiry || "", dob: p.dob || "", seamanBook: p.seamanBook || "", phone: p.phone || "", email: p.email || "", emergencyContact: p.emergencyContact || "", referredBy: p.referredBy || "", socialMedia: p.socialMedia || "", tier: crm.tier || "", role: crm.role || "", channel: crm.channel || "", language: crm.language || "", dietary: crm.dietary || "", consent: crm.consent || "" }); setEditing(true); };
    const saveEdit = () => { const { tier, role, channel, language, dietary, consent, ...rest } = editD; updPerson(p.id, { ...rest, crm: { ...crm, tier, role, channel, language, dietary, consent } }); setEditing(false); };
    const onPhoto = (file) => { if (!file) return; fileToDataUrl(file, d => updPerson(p.id, { photo: d })); };
    const addSvc = () => { if (!svcDraft.yacht) return; updPerson(p.id, { serviceHistory: [...(p.serviceHistory || []), { ...svcDraft, id: "sv" + Date.now(), manual: true }] }); setSvcDraft({ yacht: "", role: "", port: "", dateFrom: "", dateTo: "", notes: "" }); setSvcOpen(false); };
    const rmSvc = (id) => updPerson(p.id, { serviceHistory: (p.serviceHistory || []).filter(e => e.id !== id) });
    const docStatus = (d) => (d.dateExpiry && new Date(d.dateExpiry) < new Date()) ? "Expired" : (d.status || "Current");
    const addDoc = () => { if (!docDraft.type) return; const today = new Date().toISOString().slice(0, 10); const same = (p.documents || []).filter(d => d.type === docDraft.type && d.status === "Current"); const bumped = (p.documents || []).map(d => (d.type === docDraft.type && d.status === "Current") ? { ...d, status: "Superseded" } : d); const ver = same.length ? Math.max(...same.map(d => d.version || 1)) + 1 : 1; updPerson(p.id, { documents: [...bumped, { id: "doc" + Date.now(), type: docDraft.type, ref: docDraft.ref, dateIssued: docDraft.dateIssued, dateExpiry: docDraft.dateExpiry, notes: docDraft.notes, status: "Current", version: ver, addedDate: today }] }); setDocDraft({ type: "", ref: "", dateIssued: "", dateExpiry: "", notes: "" }); setDocOpen(false); };
    const rmDoc = (id) => updPerson(p.id, { documents: (p.documents || []).filter(d => d.id !== id) });
    const docBg = (st) => st === "Current" ? S.greenBg : st === "Expired" ? "#FDECEC" : S.bg;
    const docFg = (st) => st === "Current" ? S.green : st === "Expired" ? S.red : S.textH;

    const tabs = [["overview", "Overview", null], ["history", "Service history", recCount], ["documents", "Documents", docs.length], ["crm", "CRM & Marketing", null]];
    const at = tabs.some(tt => tt[0] === tab) ? tab : "overview";

    return (<>
      <div style={{ fontSize: 13, color: S.textS, marginBottom: 14 }}>
        <span onClick={() => { setSel(null); setEditing(false); setTab("overview"); }} style={{ color: S.brand, cursor: "pointer" }}>Persons DB</span>
        <span style={{ margin: "0 7px", color: S.textH }}>{"›"}</span>
        <span style={{ fontWeight: 600, color: S.text }}>{p.fullName}</span>
      </div>

      {restricted && <div style={{ background: S.orangeBg, border: `1px solid ${S.orange}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12.5, color: S.orange, display: "flex", alignItems: "center", gap: 8 }}><AlertCircle size={15} /><span><b>Restricted nationality ({p.nationality}):</b> {restricted}. Verify visa / guarantee requirements before arrival.</span></div>}

      <div style={{ background: "linear-gradient(120deg, #0F3A5A 0%, #1B5C8F 55%, #2C7AB5 100%)", borderRadius: "12px 12px 0 0", padding: "22px 26px", display: "flex", alignItems: "center", gap: 22 }}>
        <label style={{ width: 86, height: 86, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.45)", backgroundImage: p.photo ? `url(${p.photo})` : "none", backgroundColor: p.photo ? "transparent" : "rgba(255,255,255,0.08)", backgroundSize: "cover", backgroundPosition: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "#fff", overflow: "hidden", textAlign: "center" }}>
          {!p.photo && <><span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{init}</span><span style={{ fontSize: 9.5, opacity: 0.85, marginTop: 5, display: "inline-flex", alignItems: "center", gap: 3 }}><Upload size={10} />Add photo</span></>}
          <input type="file" accept="image/*" onChange={e => onPhoto(e.target.files[0])} style={{ display: "none" }} />
        </label>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 25, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>{p.fullName}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{p.rank || "Guest"} {"·"} {p.nationality || "—"} {"·"} {vesselCount} {vesselCount === 1 ? "vessel" : "vessels"}</div>
          <div style={{ fontSize: 11.5, fontFamily: "monospace", color: "rgba(255,255,255,0.7)", marginTop: 5, letterSpacing: 0.5 }}>Person ID {getPersonSerial(p)}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 11, flexWrap: "wrap" }}>
            {crm.tier && <span style={{ ...hdrPill, background: tcr.bg, color: tcr.fg }}>{crm.tier}</span>}
            {crm.role && <span style={{ ...hdrPill, background: "rgba(255,255,255,0.18)", color: "#fff" }}>{crm.role}</span>}
            {crm.channel && <span style={{ ...hdrPill, background: "rgba(255,255,255,0.18)", color: "#fff" }}>{crm.channel}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0, alignSelf: "flex-start" }}>
          <button onClick={() => editing ? setEditing(false) : startEdit()} style={btnW}>{editing ? "Cancel" : "Edit"}</button>
          <button onClick={() => { if (pYachts.length) { deletePerson(p.id); return; } if (window.confirm("Delete " + p.fullName + "? This cannot be undone.")) { deletePerson(p.id); setSel(null); } }} style={btnDel}>Delete</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1.15fr 1.6fr 0.65fr 0.65fr", background: S.surface, border: `1px solid ${S.border}`, borderTop: "none" }}>
        {[["PASSPORT", p.passportNumber || "—", S.text, "left"], ["PP EXPIRY", p.passportExpiry || "—", ppColor, "left"], ["PHONE", p.phone || "—", S.text, "left"], ["EMAIL", p.email || "—", S.text, "left"], ["OWNS", String(ownsCount), S.text, "center"], ["RECORDS", String(recCount), S.text, "center"]].map((cell, i) => (
          <div key={cell[0]} style={{ padding: "14px 16px", borderLeft: i ? `1px solid ${S.borderL}` : "none", textAlign: cell[3], minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: cell[2], wordBreak: "break-word", lineHeight: 1.3 }}>{cell[1]}</div>
            <div style={{ fontSize: 10, color: S.textH, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>{cell[0]}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, background: S.surface, borderLeft: `1px solid ${S.border}`, borderRight: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, padding: "0 12px", marginBottom: 20 }}>
        {tabs.map(tt => { const on = at === tt[0]; return <div key={tt[0]} onClick={() => setTab(tt[0])} style={{ padding: "13px 16px", fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? S.navy : S.textS, cursor: "pointer", borderBottom: on ? `2px solid ${S.navy}` : "2px solid transparent", marginBottom: -1 }}>{tt[1]}{tt[2] != null && <span style={{ color: on ? S.navy : S.textH }}> ({tt[2]})</span>}</div>; })}
      </div>

      {at === "overview" && <>
        <div style={cardW}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ ...sectT, marginBottom: 0 }}>Identity</div>
          </div>
          {editing ? <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div><div style={lblS}>Full name</div><input style={inp} value={editD.fullName} onChange={e => setEditD({ ...editD, fullName: e.target.value })} /></div>
              <div><div style={lblS}>Nationality</div><input style={inp} value={editD.nationality} onChange={e => setEditD({ ...editD, nationality: e.target.value })} /></div>
              <div><div style={lblS}>Rank</div><SearchSelect value={editD.rank} options={["Guest", ...CREW_RANKS]} placeholder="Rank..." width="100%" onChange={v => setEditD({ ...editD, rank: v })} /></div>
              <div><div style={lblS}>Profession</div><SearchSelect value={editD.profession} options={["Crew", "Guest", "Owner", "Captain", "Officer", "Engineer", "Shore Staff", "Agent", "Surveyor", "Broker", "Other"]} placeholder="Profession..." width="100%" onChange={v => setEditD({ ...editD, profession: v })} /></div>
              <div><div style={lblS}>Date of birth</div><input type="date" style={inp} value={editD.dob} onChange={e => setEditD({ ...editD, dob: e.target.value })} /></div>
              <div><div style={lblS}>Seaman book</div><input style={inp} value={editD.seamanBook} onChange={e => setEditD({ ...editD, seamanBook: e.target.value })} placeholder="Book no." /></div>
              <div><div style={lblS}>Passport no.</div><input style={inp} value={editD.passportNumber} onChange={e => setEditD({ ...editD, passportNumber: e.target.value })} /></div>
              <div><div style={lblS}>Passport expiry</div><input type="date" style={inp} value={editD.passportExpiry} onChange={e => setEditD({ ...editD, passportExpiry: e.target.value })} /></div>
              <div><div style={lblS}>Phone</div><input style={inp} value={editD.phone} onChange={e => setEditD({ ...editD, phone: e.target.value })} /></div>
              <div><div style={lblS}>Email</div><input style={inp} value={editD.email} onChange={e => setEditD({ ...editD, email: e.target.value })} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}><button onClick={saveEdit} style={btnPrimary}>Save changes</button><button onClick={() => setEditing(false)} style={btnOutline}>Cancel</button></div>
          </> : <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px 16px" }}>
            {[["Full name", p.fullName || "—"], ["Nationality", p.nationality || "—"], ["Rank", p.rank || "Guest"], ["Profession", p.profession || "—"], ["Date of birth", p.dob || "—"], ["Seaman book", p.seamanBook || "Not provided"], ["Last active", lastActive || "—"]].map(f => (
              <div key={f[0]}><div style={{ fontSize: 12, color: S.textH, marginBottom: 5 }}>{f[0]}</div><div style={{ fontSize: 14, color: (f[1] === "Not provided" || f[1] === "—") ? S.textH : S.text }}>{f[1]}</div></div>
            ))}
          </div>}
        </div>

        {isOwner && <div style={cardW}>
          <div style={sectT}>Fleet & operations</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: pOps.length ? 18 : 0 }}>
            {[["Revenue", money(oRevenue), S.green], ["Cost", money(oCost), S.text], ["Margin", oMargin + "%", oMargin >= 0 ? S.green : S.red], ["Operations", String(pOps.length), S.text], ["Active / upcoming", String(oActive), S.brand]].map(t => <div key={t[0]} style={{ background: S.bg, borderRadius: 8, padding: "13px 15px" }}><div style={{ fontSize: 18, fontWeight: 700, color: t[2] }}>{t[1]}</div><div style={{ fontSize: 10.5, color: S.textH, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 4 }}>{t[0]}</div></div>)}
          </div>
          {pOps.length > 0 && <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}><thead><tr style={{ borderBottom: `1px solid ${S.border}` }}>{["OPERATION", "VESSEL", "STATUS", "PORTS", "REVENUE"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 8px", fontSize: 10, color: S.textH, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}>{h}</th>)}</tr></thead><tbody>{pOps.slice(0, 8).map(op => <tr key={op.id} style={{ borderBottom: `1px solid ${S.borderL}` }}><td style={{ padding: "9px 8px" }}><span onClick={() => nav("operation", op.id)} style={{ color: S.brand, cursor: "pointer", fontWeight: 600 }}>{op.opNumber}</span></td><td style={{ padding: "9px 8px" }}>{op.vesselName}</td><td style={{ padding: "9px 8px" }}><Status value={op.status} /></td><td style={{ padding: "9px 8px", color: S.textS }}>{(op.ports || []).join(" → ") || "—"}</td><td style={{ padding: "9px 8px", fontWeight: 600 }}>{money(op.totalRevenue)}</td></tr>)}</tbody></table>}
        </div>}

        <div style={cardW}>
          <div style={sectT}>{isOwner ? "Vessels owned" : "Vessels served"}</div>
          {(isOwner ? pYachts.map(y => y.name) : svcVessels).length === 0 ? <div style={{ fontSize: 13, color: S.textH }}>{isOwner ? "No vessels on record." : "No service history yet."}</div> : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{(isOwner ? pYachts.map(y => y.name) : svcVessels).map(nm => { const y = yByName(nm); return <span key={nm} onClick={() => y && openYacht(y.id)} style={{ ...dPill, color: y ? S.brand : S.text, cursor: y ? "pointer" : "default" }}>{nm}</span>; })}</div>}
        </div>

        <div style={cardW}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ ...sectT, marginBottom: 0 }}>Affiliations</div>
            <button onClick={() => setLinkOpen(!linkOpen)} style={btnGhost}>+ Link company</button>
          </div>
          {linkOpen && <div style={{ marginBottom: 14 }}><SearchSelect value="" options={unlinkedCompanies.map(c => c.name)} placeholder="Select a company to link..." width="340px" onChange={nm => { const c = unlinkedCompanies.find(x => x.name === nm); if (c) { linkContact(c.id, p.id); setLinkOpen(false); } }} /></div>}
          {linkedCompanies.length === 0 ? <div style={{ fontSize: 13, color: S.textH }}>Not linked to any company. Links show on the company profile too.</div> : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{linkedCompanies.map(c => <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: `1px solid ${S.borderL}`, borderRadius: 8 }}><div><div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>{c.type && <div style={{ fontSize: 11, color: S.textH, marginTop: 1 }}>{c.type}</div>}</div><span onClick={() => unlinkContact(c.id, p.id)} style={{ fontSize: 11.5, color: S.red, cursor: "pointer", fontWeight: 500 }}>Unlink</span></div>)}</div>}
        </div>

        <div style={{ background: "#FDF6E9", border: "1px solid #F0E0C0", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.orange, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7 }}>Emergency contact</div>
          <div style={{ fontSize: 14, color: S.text }}>{p.emergencyContact || <span style={{ color: S.textH }}>Not provided.</span>}</div>
        </div>
      </>}

      {at === "history" && <div style={cardW}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ ...sectT, marginBottom: 0 }}>Service timeline {"—"} {recCount} {recCount === 1 ? "record" : "records"}</div>
          <button onClick={() => setSvcOpen(!svcOpen)} style={btnGreen}>{svcOpen ? "Close" : "+ Add record"}</button>
        </div>
        {svcOpen && <div style={{ background: S.bg, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div><div style={lblS}>Vessel</div><input style={inp} value={svcDraft.yacht} onChange={e => setSvcDraft({ ...svcDraft, yacht: e.target.value })} placeholder="Vessel name" /></div>
            <div><div style={lblS}>Role</div><input style={inp} value={svcDraft.role} onChange={e => setSvcDraft({ ...svcDraft, role: e.target.value })} placeholder="e.g. Captain, Guest" /></div>
            <div><div style={lblS}>Port</div><input style={inp} value={svcDraft.port} onChange={e => setSvcDraft({ ...svcDraft, port: e.target.value })} /></div>
            <div><div style={lblS}>From</div><input type="date" style={inp} value={svcDraft.dateFrom} onChange={e => setSvcDraft({ ...svcDraft, dateFrom: e.target.value })} /></div>
            <div><div style={lblS}>To</div><input type="date" style={inp} value={svcDraft.dateTo} onChange={e => setSvcDraft({ ...svcDraft, dateTo: e.target.value })} /></div>
            <div><div style={lblS}>Notes</div><input style={inp} value={svcDraft.notes} onChange={e => setSvcDraft({ ...svcDraft, notes: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}><button onClick={addSvc} disabled={!svcDraft.yacht} style={{ ...btnPrimary, background: svcDraft.yacht ? S.navy : S.border, color: svcDraft.yacht ? "#fff" : S.textH, cursor: svcDraft.yacht ? "pointer" : "default" }}>Save record</button></div>
        </div>}
        {recCount === 0 ? <div style={{ fontSize: 13, color: S.textH }}>No service records yet. Stints logged here, or added automatically when this person appears on an operation.</div> : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `1px solid ${S.border}` }}>{["#", "VESSEL", "ROLE", "FROM", "TO", "PORT", "OPERATION", "ENTRY"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 10px", fontSize: 10, color: S.textH, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}>{h}</th>)}</tr></thead><tbody>{svc.map((e, idx) => { const num = recCount - idx; const y = yByName(e.yacht); return <tr key={e.id || e._i} style={{ borderBottom: `1px solid ${S.borderL}` }}><td style={{ padding: "11px 10px", color: S.textH }}>{num}</td><td style={{ padding: "11px 10px", fontWeight: 600, color: y ? S.brand : S.text, cursor: y ? "pointer" : "default" }} onClick={() => y && openYacht(y.id)}>{e.yacht || "—"}</td><td style={{ padding: "11px 10px" }}>{e.role || "—"}</td><td style={{ padding: "11px 10px" }}>{e.dateFrom || e.date || "—"}</td><td style={{ padding: "11px 10px" }}>{e.dateTo || "—"}</td><td style={{ padding: "11px 10px" }}>{e.port || "—"}</td><td style={{ padding: "11px 10px" }}>{e.opId ? <span onClick={() => nav("operation", e.opId)} style={{ color: S.brand, cursor: "pointer" }}>{e.opNumber || e.opId}</span> : <span style={{ color: S.textH }}>{"–"}</span>}</td><td style={{ padding: "11px 10px" }}>{e.manual ? <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}><span style={{ fontSize: 11, color: S.textH }}>Manual</span><span onClick={() => rmSvc(e.id)} style={{ color: S.red, cursor: "pointer", fontSize: 15, lineHeight: 1 }}>{"×"}</span></span> : <span style={{ fontSize: 11, color: S.textH }}>{"—"}</span>}</td></tr>; })}</tbody></table>}
      </div>}

      {at === "documents" && <div style={cardW}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ ...sectT, marginBottom: 0 }}>Document register {"—"} {docs.length}</div>
          <button onClick={() => setDocOpen(!docOpen)} style={docOpen ? btnGreen : btnGhost}>{docOpen ? "Cancel" : "+ Add document"}</button>
        </div>
        {docOpen && <div style={{ background: S.bg, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div><div style={lblS}>Type</div><select value={docDraft.type} onChange={e => setDocDraft({ ...docDraft, type: e.target.value })} style={inp}><option value="">-- Select --</option>{PERSON_DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><div style={lblS}>Reference / Number</div><input style={inp} value={docDraft.ref} onChange={e => setDocDraft({ ...docDraft, ref: e.target.value })} placeholder="Certificate no." /></div>
            <div><div style={lblS}>Notes</div><input style={inp} value={docDraft.notes} onChange={e => setDocDraft({ ...docDraft, notes: e.target.value })} /></div>
            <div><div style={lblS}>Date issued</div><input type="date" style={inp} value={docDraft.dateIssued} onChange={e => setDocDraft({ ...docDraft, dateIssued: e.target.value })} /></div>
            <div><div style={lblS}>Date expiry</div><input type="date" style={inp} value={docDraft.dateExpiry} onChange={e => setDocDraft({ ...docDraft, dateExpiry: e.target.value })} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><button onClick={addDoc} disabled={!docDraft.type} style={{ ...btnPrimary, width: "100%", background: docDraft.type ? S.navy : S.border, color: docDraft.type ? "#fff" : S.textH, cursor: docDraft.type ? "pointer" : "default" }}>Save document</button></div>
          </div>
          <div style={{ fontSize: 11, color: S.textH, marginTop: 11 }}>If a current document of the same type exists, it will be automatically marked as Superseded.</div>
        </div>}
        {docs.length === 0 ? <div style={{ fontSize: 13, color: S.textH }}>No documents on record.</div> : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `1px solid ${S.border}` }}>{["TYPE", "REFERENCE", "ISSUED", "EXPIRY", "STATUS", "VER", ""].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 10px", fontSize: 10, color: S.textH, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}>{h}</th>)}</tr></thead><tbody>{docs.map(d => { const st = docStatus(d); return <tr key={d.id} style={{ borderBottom: `1px solid ${S.borderL}` }}><td style={{ padding: "11px 10px", fontWeight: 600 }}>{d.type}</td><td style={{ padding: "11px 10px", color: S.textS }}>{d.ref || "—"}</td><td style={{ padding: "11px 10px" }}>{d.dateIssued || "—"}</td><td style={{ padding: "11px 10px" }}>{d.dateExpiry || "—"}</td><td style={{ padding: "11px 10px" }}><span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: docBg(st), color: docFg(st) }}>{st}</span></td><td style={{ padding: "11px 10px", color: S.textH }}>v{d.version || 1}</td><td style={{ padding: "11px 10px" }}><span onClick={() => rmDoc(d.id)} style={{ color: S.red, cursor: "pointer", fontSize: 15, lineHeight: 1 }}>{"×"}</span></td></tr>; })}</tbody></table>}
      </div>}

      {at === "crm" && <div style={cardW}>
        {editing ? <>
          <div style={sectT}>Edit CRM & marketing</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <div><div style={lblS}>Tier</div><select value={editD.tier} onChange={e => setEditD({ ...editD, tier: e.target.value })} style={inp}><option value="">--</option>{PERSON_TAGS.tier.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div><div style={lblS}>Marketing role</div><select value={editD.role} onChange={e => setEditD({ ...editD, role: e.target.value })} style={inp}><option value="">--</option>{PERSON_TAGS.role.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div><div style={lblS}>Channel</div><select value={editD.channel} onChange={e => setEditD({ ...editD, channel: e.target.value })} style={inp}><option value="">--</option>{PERSON_TAGS.channel.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div><div style={lblS}>Language</div><select value={editD.language} onChange={e => setEditD({ ...editD, language: e.target.value })} style={inp}><option value="">--</option>{PERSON_TAGS.language.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div><div style={lblS}>Dietary</div><select value={editD.dietary} onChange={e => setEditD({ ...editD, dietary: e.target.value })} style={inp}><option value="">--</option>{PERSON_TAGS.dietary.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div><div style={lblS}>Consent</div><select value={editD.consent} onChange={e => setEditD({ ...editD, consent: e.target.value })} style={inp}><option value="">--</option>{PERSON_TAGS.consent.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div><div style={lblS}>Referred by</div><input style={inp} value={editD.referredBy} onChange={e => setEditD({ ...editD, referredBy: e.target.value })} /></div>
            <div><div style={lblS}>Social / IG</div><input style={inp} value={editD.socialMedia} onChange={e => setEditD({ ...editD, socialMedia: e.target.value })} placeholder="@handle" /></div>
          </div>
          <div style={{ marginTop: 16 }}><div style={lblS}>Emergency contact</div><input style={inp} value={editD.emergencyContact} onChange={e => setEditD({ ...editD, emergencyContact: e.target.value })} placeholder="Name + phone" /></div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}><button onClick={saveEdit} style={btnPrimary}>Save changes</button><button onClick={() => setEditing(false)} style={btnOutline}>Cancel</button></div>
        </> : <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ ...sectT, marginBottom: 0 }}>CRM & marketing</div><button onClick={startEdit} style={btnGhost}>Edit</button></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px 16px" }}>
            <div><div style={lblS}>Tier</div>{crm.tier ? <span style={{ padding: "2px 11px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: tcr.bg, color: tcr.fg }}>{crm.tier}</span> : <span style={{ color: S.textH, fontSize: 14 }}>{"—"}</span>}</div>
            <div><div style={lblS}>Marketing role</div><div style={{ fontSize: 14, color: crm.role ? S.text : S.textH }}>{crm.role || "—"}</div></div>
            <div><div style={lblS}>Channel</div><div style={{ fontSize: 14, color: crm.channel ? S.text : S.textH }}>{crm.channel || "—"}</div></div>
            <div><div style={lblS}>Language</div><div style={{ fontSize: 14, color: crm.language ? S.text : S.textH }}>{crm.language || "—"}</div></div>
            <div><div style={lblS}>Dietary</div><div style={{ fontSize: 14, color: crm.dietary ? S.text : S.textH }}>{crm.dietary || "—"}</div></div>
            <div><div style={lblS}>Consent</div>{crm.consent ? <span style={{ padding: "2px 11px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, background: consentC.bg, color: consentC.fg }}>{crm.consent}</span> : <span style={{ color: S.textH, fontSize: 14 }}>{"—"}</span>}</div>
            <div><div style={lblS}>Referred by</div><div style={{ fontSize: 14, color: p.referredBy ? S.text : S.textH }}>{p.referredBy || "—"}</div></div>
            <div><div style={lblS}>Social / IG</div><div style={{ fontSize: 14, color: p.socialMedia ? S.text : S.textH }}>{p.socialMedia || "—"}</div></div>
          </div>
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${S.borderL}` }}><div style={lblS}>Tags</div><TagBox tags={p.tags} allTags={allTags} onChange={t => updPerson(p.id, { tags: t })} /></div>
        </>}
      </div>}
    </>);
  }
  return <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
      <Tile title="Total persons" value={persons.length} icon={Users} accent={S.brand} />
      <Tile title="Crew" value={persons.filter(x => x.rank && x.rank !== "Guest" && x.rank !== "Owner").length} icon={UserCircle} accent={S.navy} />
      <Tile title="Owners" value={persons.filter(x => x.rank === "Owner").length} icon={Anchor} accent={S.gold} />
      <Tile title="Passport alerts" value={persons.filter(x => { if (!x.passportExpiry) return false; const days = Math.round((new Date(x.passportExpiry) - new Date()) / 86400000); return days < 90; }).length} icon={AlertCircle} accent={S.orange} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 6, padding: "7px 11px", flex: 1 }}><Search size={14} color={S.textH} /><input value={s} onChange={e => setS(e.target.value)} placeholder="Search by name, nationality, rank, passport..." style={{ border: "none", outline: "none", fontSize: 12.5, background: "transparent", width: "100%" }} /></div>
      <button onClick={() => setVw(vw === "cards" ? "table" : "cards")} style={{ padding: "7px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>{vw === "cards" ? "Table view" : "Cards view"}</button>
      <button onClick={() => { if (!filtered.length) { alert("No persons to export with the current filter."); return; } exportRegistryToExcel(filtered, PERSON_XLSX_SPEC, "Persons", "Felix_Persons", getPersonSerial, () => {}); }} style={{ padding: "7px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📤 Export Excel</button>
      <label style={{ padding: "7px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>📥 Import Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={e => { const f = e.target.files[0]; if (f) importRegistryFromExcel(f, PERSON_XLSX_SPEC, rows => { if (!rows.length) { alert("No valid rows found. Ensure the sheet has a 'Full Name' column."); return; } importPersons && importPersons(rows); }, () => alert("Could not read the spreadsheet. Save it as .xlsx or .csv and try again.")); e.target.value = ""; }} style={{ display: "none" }} /></label>
      <button onClick={() => setAdding(!adding)} style={{ padding: "7px 14px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1px solid ${S.brand}`, background: adding ? "transparent" : S.brand, color: adding ? S.brand : "#fff" }}>{adding ? "Cancel" : "+ Add person"}</button>
    </div>
    {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>New person</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 160 }}><div style={{ fontSize: 10.5, color: S.textS, marginBottom: 3 }}>Full name *</div><input value={np.fullName} onChange={e => setNp({ ...np, fullName: e.target.value })} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 5, padding: "7px 9px", fontSize: 12.5, background: S.surface, boxSizing: "border-box" }} /></div>
        <div style={{ flex: 1, minWidth: 110 }}><div style={{ fontSize: 10.5, color: S.textS, marginBottom: 3 }}>Nationality</div><input value={np.nationality} onChange={e => setNp({ ...np, nationality: e.target.value })} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 5, padding: "7px 9px", fontSize: 12.5, background: S.surface, boxSizing: "border-box" }} /></div>
        <div style={{ flex: 1, minWidth: 130 }}><div style={{ fontSize: 10.5, color: S.textS, marginBottom: 3 }}>Rank</div><SearchSelect value={np.rank} options={["Guest", ...CREW_RANKS]} placeholder="Select..." width="100%" onChange={v => setNp({ ...np, rank: v })} /></div>
        <div style={{ flex: 1, minWidth: 110 }}><div style={{ fontSize: 10.5, color: S.textS, marginBottom: 3 }}>Passport #</div><input value={np.passportNumber} onChange={e => setNp({ ...np, passportNumber: e.target.value })} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 5, padding: "7px 9px", fontSize: 12.5, background: S.surface, boxSizing: "border-box" }} /></div>
        <div style={{ flex: 1, minWidth: 130 }}><div style={{ fontSize: 10.5, color: S.textS, marginBottom: 3 }}>Passport expiry</div><input type="date" value={np.passportExpiry} onChange={e => setNp({ ...np, passportExpiry: e.target.value })} style={{ width: "100%", border: `1px solid ${S.border}`, borderRadius: 5, padding: "7px 9px", fontSize: 12.5, background: S.surface, boxSizing: "border-box" }} /></div>
      </div>
      <button onClick={handleAdd} disabled={!np.fullName} style={{ padding: "8px 18px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: np.fullName ? "pointer" : "default", border: "none", background: np.fullName ? S.brand : S.border, color: np.fullName ? "#fff" : S.textH }}>Save person</button>
    </div>}
    {personTagsInUse.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}><span style={{ fontSize: 10, color: S.textH, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 2 }}>Filter by tag</span>{personTagsInUse.map(t => { const tc = tagColor(t); const on = tagFilter === t; return <button key={t} onClick={() => setTagFilter(on ? null : t)} style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${on ? tc.fg : S.border}`, background: on ? tc.fg : tc.bg, color: on ? "#fff" : tc.fg }}>{t}</button>; })}{tagFilter && <button onClick={() => setTagFilter(null)} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textS }}>Clear</button>}</div>}
    {(() => {
      const yByNameL = (nm) => (allYachts || []).find(y => (y.name || "").toLowerCase() === (nm || "").toLowerCase());
      const svColOf = (x) => [...new Set([...(x.serviceHistory || [])].map(e => e.yacht).filter(Boolean))];
      const recOf = (x) => (x.serviceHistory || []).length;
      const lastOf = (x) => { const sv = [...(x.serviceHistory || [])].sort((a, b) => (b.dateTo || b.dateFrom || b.date || "").localeCompare(a.dateTo || a.dateFrom || a.date || "")); return x.lastActive || (sv.length ? (sv[0].dateTo || sv[0].dateFrom || sv[0].date || "") : ""); };
      const sortVal = (x) => { const c = x.crm || {}; switch (sortKey) { case "rank": return (x.rank || "").toLowerCase(); case "nationality": return (x.nationality || "").toLowerCase(); case "tier": return (c.tier || "~").toLowerCase(); case "records": return recOf(x); case "lastActivity": return lastOf(x) || ""; default: return (x.fullName || "").toLowerCase(); } };
      const sorted = [...filtered].sort((a, b) => { const va = sortVal(a), vb = sortVal(b); let r = (typeof va === "number" && typeof vb === "number") ? va - vb : String(va).localeCompare(String(vb)); return sortDir === "asc" ? r : -r; });
      const SortH = (key, label, align) => { const on = sortKey === key; return <th onClick={() => { if (on) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } }} style={{ textAlign: align || "left", padding: "11px 12px", fontSize: 10.5, color: on ? S.navy : S.textH, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{label}{on ? <span> {sortDir === "asc" ? "▲" : "▼"}</span> : <span style={{ opacity: 0.3 }}> {"▲"}</span>}</th>; };
      const PlainH = (label, align) => <th style={{ textAlign: align || "left", padding: "11px 12px", fontSize: 10.5, color: S.textH, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</th>;
      if (vw === "cards") return <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {sorted.length === 0 ? <div style={{ gridColumn: "1 / -1", padding: 26, textAlign: "center", color: S.textH, fontSize: 13, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10 }}>No people match your search.</div> : sorted.map(x => {
          const c = x.crm || {}; const init = (x.fullName || "?").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
          const isCrew = x.rank && x.rank !== "Guest"; const sv = svColOf(x);
          const ppDays = x.passportExpiry ? Math.round((new Date(x.passportExpiry) - new Date()) / 86400000) : null;
          const ppCol = ppDays == null ? S.textH : ppDays < 0 ? S.red : ppDays < 90 ? S.orange : S.green;
          return <div key={x.id} onClick={() => setSel(x.id)} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14, cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 8 }}>
              {x.photo ? <img src={x.photo} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `1px solid ${S.border}` }} /> : <div style={{ width: 40, height: 40, borderRadius: "50%", background: S.brandL, color: S.brandD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{init}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: S.brand, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.fullName}</div>
                <div style={{ fontSize: 11, color: S.textS }}>{x.nationality || "—"}</div>
              </div>
              {isCrew ? <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 600, background: S.greenBg, color: S.green, whiteSpace: "nowrap" }}>{x.rank}</span> : <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 500, background: S.bg, color: S.textS, whiteSpace: "nowrap" }}>{x.rank || "Guest"}</span>}
            </div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: S.textH, marginBottom: 6 }}>{getPersonSerial(x)}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: S.textH, flexWrap: "wrap" }}>
              {x.passportNumber && <span>Passport: <span style={{ color: S.text }}>{x.passportNumber}</span></span>}
              {x.passportExpiry && <span style={{ color: ppCol }}>Exp {x.passportExpiry}</span>}
            </div>
            {sv.length > 0 && <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>{sv.slice(0, 4).map(nm => { const y = yByNameL(nm); return <span key={nm} onClick={() => y && openYacht(y.id)} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: S.brandL, color: S.brandD, fontWeight: 500, cursor: y ? "pointer" : "default" }}>{nm}</span>; })}</div>}
            {(x.tags && x.tags.length) ? <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 6 }}><TagChips tags={x.tags} onClick={(t) => setTagFilter(t === tagFilter ? null : t)} active={tagFilter} /></div> : null}
          </div>;
        })}
      </div>;
      return <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: `2px solid ${S.border}`, background: S.bg }}>{PlainH("Person ID")}{SortH("fullName", "Name")}{SortH("rank", "Rank")}{SortH("nationality", "Nationality")}{PlainH("Passport")}{SortH("tier", "Tier")}{PlainH("Vessels served")}{SortH("records", "Records", "center")}{SortH("lastActivity", "Last activity")}</tr></thead>
            <tbody>{sorted.length === 0 ? <tr><td colSpan={9} style={{ padding: "26px", textAlign: "center", color: S.textH, fontSize: 13 }}>No people match your search.</td></tr> : sorted.map(x => {
              const c = x.crm || {}; const init = (x.fullName || "?").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase(); const sv = svColOf(x); const rec = recOf(x); const la = lastOf(x); const isCrew = x.rank && x.rank !== "Guest"; const tc = c.tier ? tagColor(c.tier) : null; const rc = c.role ? tagColor(c.role) : null;
              const ppDays = x.passportExpiry ? Math.round((new Date(x.passportExpiry) - new Date()) / 86400000) : null; const ppCol = ppDays == null ? S.textH : ppDays < 0 ? S.red : ppDays < 90 ? S.orange : S.textH;
              return <tr key={x.id} style={{ borderBottom: `1px solid ${S.borderL}` }}>
                <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: 11.5, color: S.textS, whiteSpace: "nowrap" }}>{getPersonSerial(x)}</td>
                <td style={{ padding: "11px 12px" }}><div style={{ display: "flex", alignItems: "center", gap: 11 }}><div style={{ width: 34, height: 34, borderRadius: "50%", background: S.brandL, color: S.brandD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{init}</div><div style={{ minWidth: 0 }}><div onClick={() => setSel(x.id)} style={{ fontWeight: 600, color: S.brand, cursor: "pointer" }}>{x.fullName}</div>{x.phone && <div style={{ fontSize: 11.5, color: S.textH, marginTop: 1 }}>{x.phone}</div>}</div></div></td>
                <td style={{ padding: "11px 12px" }}>{isCrew ? <span style={{ padding: "3px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: S.greenBg, color: S.green, whiteSpace: "nowrap" }}>{x.rank}</span> : <span style={{ color: S.textS }}>{x.rank || "Guest"}</span>}</td>
                <td style={{ padding: "11px 12px" }}>{x.nationality || "—"}</td>
                <td style={{ padding: "11px 12px" }}>{x.passportNumber ? <><div style={{ fontWeight: 500 }}>{x.passportNumber}</div>{x.passportExpiry && <div style={{ fontSize: 11.5, color: ppCol, marginTop: 1 }}>Exp: {x.passportExpiry}</div>}</> : <span style={{ color: S.textH }}>{"—"}</span>}</td>
                <td style={{ padding: "11px 12px" }}><div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>{c.tier && <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: tc.bg, color: tc.fg }}>{c.tier}</span>}{c.role && <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: rc.bg, color: rc.fg }}>{c.role}</span>}{!c.tier && !c.role && <span style={{ color: S.textH }}>{"—"}</span>}</div></td>
                <td style={{ padding: "11px 12px" }}>{sv.length ? <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxWidth: 210 }}>{sv.map(nm => { const y = yByNameL(nm); return <span key={nm} onClick={() => y && openYacht(y.id)} style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 6, border: `1px dashed ${S.border}`, color: y ? S.brand : S.textS, cursor: y ? "pointer" : "default", whiteSpace: "nowrap" }}>{nm}</span>; })}</div> : <span style={{ color: S.textH }}>{"—"}</span>}</td>
                <td style={{ padding: "11px 12px", textAlign: "center", fontWeight: 600 }}>{rec}</td>
                <td style={{ padding: "11px 12px", color: la ? S.text : S.textH, whiteSpace: "nowrap" }}>{la || "—"}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </div>;
    })()}
  </>;
};

// SUEZ CANAL TRANSIT (Section 15)
const TransitView = () => {
  const [rows, setRows] = useState(TRANSITS);
  const [adding, setAdding] = useState(false);
  const blank = { bookingRef: "", yacht: "", direction: "Northbound", transitDay: "", convoy: "", status: "Planned" };
  const [nt, setNt] = useState(blank);
  const ok = nt.bookingRef && nt.yacht;
  const save = () => { if (!ok) return; setRows(p => [{ id: "tr" + Date.now(), anchorage: "—", ismailiaStop: "—", ...nt }, ...p]); setNt(blank); setAdding(false); };
  return <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
      <Tile title="Active transits" value={rows.filter(t => ["Underway", "At Anchorage", "Cleared"].includes(t.status)).length} icon={Compass} accent={S.brand} />
      <Tile title="Planned" value={rows.filter(t => t.status === "Planned").length} icon={Calendar} accent={S.orange} />
      <Tile title="Completed" value={rows.filter(t => t.status === "Completed").length} icon={Check} accent={S.green} />
      <Tile title="Ismailia stops" value={rows.filter(t => t.ismailiaStop?.startsWith("Yes")).length} icon={MapPin} accent={S.purple} />
    </div>
    <Toolbar title="Suez Canal transit — list report (Section 15)" onCreate={() => setAdding(!adding)} />
    {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 6, padding: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>New transit booking</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <FField label="Booking Ref *" val={nt.bookingRef} set={v => setNt({ ...nt, bookingRef: v })} ph="SCT-2026-..." />
        <FField label="Vessel *" val={nt.yacht} set={v => setNt({ ...nt, yacht: v })} w={2} />
        <FSelect label="Direction" val={nt.direction} set={v => setNt({ ...nt, direction: v })} opts={["Northbound", "Southbound"]} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <FField label="Transit day" val={nt.transitDay} set={v => setNt({ ...nt, transitDay: v })} type="date" />
        <FField label="Convoy" val={nt.convoy} set={v => setNt({ ...nt, convoy: v })} ph="Convoy 1" />
        <FSelect label="Status" val={nt.status} set={v => setNt({ ...nt, status: v })} opts={["Planned", "At Anchorage", "Cleared", "Underway", "Completed", "Cancelled"]} />
      </div>
      <SaveBtn ok={ok} onClick={save} label="Save transit" />
    </div>}
    <Table columns={[
      { key: "bookingRef", label: "Booking Ref", render: v => <ObjLink>{v}</ObjLink> },
      { key: "yacht", label: "Vessel", render: v => <span style={{ fontWeight: 500 }}>{v}</span> },
      { key: "direction", label: "Direction", render: v => <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: v === "Northbound" ? S.blueBg : S.greenBg, color: v === "Northbound" ? S.blue : S.green }}>{v}</span> },
      { key: "transitDay", label: "Transit Day" },
      { key: "convoy", label: "Convoy" },
      { key: "anchorage", label: "Anchorage" },
      { key: "ismailiaStop", label: "Ismailia Stop" },
      { key: "status", label: "Status", render: v => <Status value={v} /> },
    ]} data={rows} />
    <InfoStrip type="warning"><strong>Event → status mapping (audit B11):</strong> each logged event advances the status — anchorage arrival → At Anchorage · inspection passed → Cleared · pilot boarded → Underway · Ismailia berthing (branch: only when Ismailia stop = Yes) → At Ismailia · departure → Underway (2nd) · exit pilot off → Completed. Southbound and Northbound follow the same chain with mirrored entry points (Port Said vs Suez). Only Cancelled is manual. <strong>Status reflects the last logged event</strong> — not live vessel position (AIS feed is Phase 2).</InfoStrip>
    <InfoStrip type="info"><strong>Ismailia default:</strong> GT &gt; 300 → No stop. GT ≤ 300 + crew change → Yes. Ismailia ETA/ETD editable only by Ismailia office (s6) and admin (s1).</InfoStrip>
  </>;
};

// CREW CHANGE (Section 11)
const CrewChangeView = () => {
  const [rows, setRows] = useState(CREW_CHANGES);
  const [f, setF] = useState(["All"]);
  const [adding, setAdding] = useState(false);
  const blank = { agency: "FMA", yacht: "", type: "Embark", crewName: "", role: "", nationality: "", port: PORTS_EG[0].name, date: "", visaMethod: VISA_METHODS[0] };
  const [nc, setNc] = useState(blank);
  const ok = nc.yacht && nc.crewName;
  // Entity-namespaced refs (audit B15: {ENTITY}-{TYPE}-{YEAR}-{SEQ}); restricted flag derived from the nationality list (audit B06) — never defaulted off.
  const save = () => {
    if (!ok) return;
    setRows(p => [{ id: `${nc.agency}-CC-${new Date().getFullYear()}-${String(p.length + 1).padStart(3, "0")}`, phase: 1, glStatus: isRestricted(nc.nationality) ? "Drafted" : "", visa: "Pending", status: "Upcoming", ...nc, restricted: isRestricted(nc.nationality) }, ...p]);
    setNc(blank); setAdding(false);
  };
  const types = ["All", "Embark", "Disembark"];
  const filtered = rows.filter(c => f.includes("All") || f.includes(c.type));
  const toggle = v => { if (v === "All") return setF(["All"]); const n = f.filter(s => s !== "All"); setF(n.includes(v) ? (n.length === 1 ? ["All"] : n.filter(s => s !== v)) : [...n, v]); };
  return <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 14 }}>
      <Tile title="Total movements" value={rows.length} icon={ArrowLeftRight} accent={S.brand} />
      <Tile title="Embark" value={rows.filter(c => c.type === "Embark").length} icon={TrendingUp} accent={S.green} />
      <Tile title="Disembark" value={rows.filter(c => c.type === "Disembark").length} icon={TrendingDown} accent={S.red} />
      <Tile title="Restricted nationality" value={rows.filter(c => c.restricted).length} icon={AlertTriangle} accent={S.red} />
      <Tile title="Pending GL" value={rows.filter(c => c.glStatus === "Drafted").length} icon={FileText} accent={S.orange} />
    </div>
    <FilterBar filters={types} active={f} onToggle={toggle} count={filtered.length} />
    <Toolbar title="Crew change operations — 11-phase workflow (Section 11)" onCreate={() => setAdding(!adding)} />
    {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 6, padding: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>New crew change</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <FSelect label="Agency" val={nc.agency} set={v => setNc({ ...nc, agency: v })} opts={["FMA", "GRA", "CRA"]} />
        <FField label="Vessel *" val={nc.yacht} set={v => setNc({ ...nc, yacht: v })} w={2} />
        <FSelect label="Type" val={nc.type} set={v => setNc({ ...nc, type: v })} opts={["Embark", "Disembark"]} />
        <FField label="Crew member *" val={nc.crewName} set={v => setNc({ ...nc, crewName: v })} w={2} />
        <FField label="Rank" val={nc.role} set={v => setNc({ ...nc, role: v })} ph="Captain, Deckhand..." />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <FField label="Nationality" val={nc.nationality} set={v => setNc({ ...nc, nationality: v })} />
        <FSelect label="Port" val={nc.port} set={v => setNc({ ...nc, port: v })} opts={PORTS_EG.map(p => p.name)} w={2} />
        <FField label="Date" val={nc.date} set={v => setNc({ ...nc, date: v })} type="date" />
        <FSelect label="Visa method" val={nc.visaMethod} set={v => setNc({ ...nc, visaMethod: v })} opts={VISA_METHODS} w={2} />
      </div>
      <SaveBtn ok={ok} onClick={save} label="Save crew change" />
    </div>}
    <Table columns={[
      { key: "id", label: "Ref", render: v => <ObjLink>{v}</ObjLink> },
      { key: "yacht", label: "Vessel", render: v => <span style={{ fontWeight: 500 }}>{v}</span> },
      { key: "type", label: "Type", render: v => <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: v === "Embark" ? S.greenBg : S.redBg, color: v === "Embark" ? S.green : S.red }}>{v}</span> },
      { key: "crewName", label: "Crew Member" },
      { key: "role", label: "Rank" },
      { key: "nationality", label: "Nationality", render: (v, r) => <span>{v}{r.restricted ? <span style={{ color: S.red, marginLeft: 4, fontWeight: 500 }}>⚠ RESTRICTED</span> : ""}</span> },
      { key: "port", label: "Port" },
      { key: "date", label: "Date" },
      { key: "phase", label: "Phase", render: v => <span style={{ color: S.brand, fontWeight: 500 }}>{v}/11</span> },
      { key: "visaMethod", label: "Visa Method" },
      { key: "glStatus", label: "GL Status", render: v => v ? <Status value={v} /> : <span style={{ color: S.textH }}>—</span> },
      { key: "visa", label: "Visa", render: v => <Status value={v} /> },
      { key: "status", label: "Status", render: v => <Status value={v} /> },
    ]} data={filtered} />
    <InfoStrip type="warning"><strong>Foreign-flagged rule:</strong> Captain (owner POA) tied to vessel. If captain departs → vessel immobilized. Replacement must be foreign. No Egyptian captain permitted.</InfoStrip>
  </>;
};

// VISA INVENTORY (Section 12)
const VisaView = () => {
  const [rows, setRows] = useState(VISA_BATCHES);
  const [adding, setAdding] = useState(false);
  const blank = { batchRef: "", type: "Tourist Visa", code: "", totalStickers: "", costPerSticker: "", dateReceived: "", expiry: "" };
  const [nb, setNb] = useState(blank);
  const ok = nb.batchRef && nb.type;
  const save = () => { if (!ok) return; const tot = Number(nb.totalStickers) || 0; setRows(p => [{ id: "vb" + Date.now(), batchRef: nb.batchRef, type: nb.type, code: nb.code, totalStickers: tot, available: tot, assigned: 0, used: 0, costPerSticker: Number(nb.costPerSticker) || 0, dateReceived: nb.dateReceived, expiry: nb.expiry, status: "Active" }, ...p]); setNb(blank); setAdding(false); };
  // Batch status (audit B06): derived when absent — Expired past expiry, Depleted at 0 available, else Active.
  const batchStatus = (b) => b.status === "Archived" ? "Archived" : (b.expiry && new Date(b.expiry) < new Date()) ? "Expired" : b.available === 0 ? "Depleted" : "Active";
  return <>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
    {rows.map(b => {
      const isLow = b.available < 15;
      return <Tile key={b.id} title={b.type} value={b.available} icon={Stamp} accent={isLow ? S.orange : S.green} footer={`${b.assigned} assigned · ${b.used} used`} />;
    })}
  </div>
  <Toolbar title="Visa sticker inventory — batch tracking (Section 12)" onCreate={() => setAdding(!adding)} />
  {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 6, padding: 12, marginBottom: 10 }}>
    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>New visa batch</div>
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <FField label="Batch Ref *" val={nb.batchRef} set={v => setNb({ ...nb, batchRef: v })} ph="VB-2026-..." />
      <FField label="Type *" val={nb.type} set={v => setNb({ ...nb, type: v })} w={2} />
      <FField label="Code" val={nb.code} set={v => setNb({ ...nb, code: v })} />
    </div>
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <FField label="Total stickers" val={nb.totalStickers} set={v => setNb({ ...nb, totalStickers: v })} type="number" />
      <FField label="Cost / unit ($)" val={nb.costPerSticker} set={v => setNb({ ...nb, costPerSticker: v })} type="number" />
      <FField label="Date received" val={nb.dateReceived} set={v => setNb({ ...nb, dateReceived: v })} type="date" />
      <FField label="Expiry" val={nb.expiry} set={v => setNb({ ...nb, expiry: v })} type="date" />
    </div>
    <SaveBtn ok={ok} onClick={save} label="Save batch" />
  </div>}
  <Table columns={[
    { key: "batchRef", label: "Batch Ref", render: v => <ObjLink>{v}</ObjLink> },
    { key: "type", label: "Type", render: v => <span style={{ fontWeight: 500 }}>{v}</span> },
    { key: "code", label: "Code" },
    { key: "totalStickers", label: "Total" },
    { key: "available", label: "Available", render: (v) => <span style={{ fontWeight: 600, color: v < 15 ? S.orange : S.green }}>{v}</span> },
    { key: "assigned", label: "Assigned", render: v => <span style={{ color: S.blue }}>{v}</span> },
    { key: "used", label: "Used" },
    { key: "costPerSticker", label: "Cost/Unit", render: v => `$${v}` },
    { key: "dateReceived", label: "Received" },
    { key: "expiry", label: "Expiry", render: v => { const d = new Date(v); const soon = d < new Date("2026-09-01"); return <span style={{ color: soon ? S.orange : S.text }}>{v}</span>; } },
    { key: "status", label: "Status", render: (v, r) => { const s = batchStatus(r); const c = s === "Active" ? [S.greenBg, S.green] : s === "Depleted" ? [S.goldBg, S.gold] : [S.redBg, S.red]; return <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10.5, fontWeight: 500, background: c[0], color: c[1] }}>{s}</span>; } },
  ]} data={rows} />
  <InfoStrip type="info"><strong>Sticker lifecycle:</strong> Available → Assigned (on selection) → Used (on immigration completion). De-allocation returns to Available with reason.</InfoStrip>
  </>;
};

// LOGISTICS / PROVISIONS / BUNKER
const LogisticsView = ({ initialTab }) => {
  const [rows, setRows] = useState(LOGISTICS);
  const [tab, setTab] = useState(initialTab || "all");
  const [adding, setAdding] = useState(false);
  const blank = { agency: "FMA", yacht: "", type: initialTab === "bunker" ? "Bunker" : "Provision", code: "", desc: "", port: "", supplier: "", value: "", currency: "USD", bunkerGrade: "", qtyOrdered: "", customsEntryNo: "" };
  const [nl, setNl] = useState(blank);
  const ok = nl.yacht && nl.desc;
  // Entity-namespaced order IDs (audit B15) + bunker/customs fields the rules depend on (audit B06).
  const save = () => {
    if (!ok) return;
    setRows(p => [{ id: `${nl.agency}-LOG-${new Date().getFullYear()}-${String(p.length + 1).padStart(3, "0")}`, yacht: nl.yacht, type: nl.type, code: nl.code, desc: nl.desc, port: nl.port, supplier: nl.supplier, date: new Date().toISOString().slice(0, 10), value: Number(nl.value) || 0, currency: nl.currency, status: "Requested",
      ...(nl.type === "Bunker" ? { bunkerGrade: nl.bunkerGrade, qtyOrdered: Number(nl.qtyOrdered) || 0, bunkerStatus: "Request Received" } : {}),
      ...(nl.customsEntryNo ? { customsEntryNo: nl.customsEntryNo } : {}) }, ...p]);
    setNl(blank); setAdding(false);
  };
  const tabs = [{ key: "all", label: "All orders", count: rows.length }, { key: "provision", label: "Provisions", count: rows.filter(l => l.type === "Provision").length }, { key: "bunker", label: "Bunker", count: rows.filter(l => l.type === "Bunker").length }, { key: "parts", label: "Parts & Technical", count: rows.filter(l => l.type === "Spare Parts" || l.type === "Technical").length }];
  const filtered = tab === "all" ? rows : rows.filter(l => tab === "provision" ? l.type === "Provision" : tab === "bunker" ? l.type === "Bunker" : l.type === "Spare Parts" || l.type === "Technical");
  return <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
      <Tile title="Active orders" value={rows.length} icon={Truck} accent={S.brand} />
      <Tile title="Total value" value={`$${(rows.reduce((a, l) => a + l.value, 0) / 1000).toFixed(1)}k`} icon={DollarSign} accent={S.green} />
      <Tile title="In customs" value={rows.filter(l => l.status === "Customs").length} icon={FileText} accent={S.purple} />
      <Tile title="Bunker orders" value={rows.filter(l => l.type === "Bunker").length} icon={Fuel} accent={S.navy} />
    </div>
    <Tabs tabs={tabs} active={tab} onChange={setTab} />
    <Toolbar title="Supply chain — list report (Sections 13-14)" onCreate={() => setAdding(!adding)} />
    {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 6, padding: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>New supply request</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <FSelect label="Agency" val={nl.agency} set={v => setNl({ ...nl, agency: v })} opts={["FMA", "GRA", "CRA"]} />
        <FField label="Vessel *" val={nl.yacht} set={v => setNl({ ...nl, yacht: v })} w={2} />
        <FSelect label="Type" val={nl.type} set={v => setNl({ ...nl, type: v })} opts={["Provision", "Bunker", "Spare Parts", "Technical"]} />
        <FField label="Code" val={nl.code} set={v => setNl({ ...nl, code: v })} ph="SUP-0.." />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <FField label="Description *" val={nl.desc} set={v => setNl({ ...nl, desc: v })} w={2} />
        <FField label="Port" val={nl.port} set={v => setNl({ ...nl, port: v })} />
        <FField label="Supplier" val={nl.supplier} set={v => setNl({ ...nl, supplier: v })} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <FField label="Value" val={nl.value} set={v => setNl({ ...nl, value: v })} type="number" />
        <FSelect label="Currency" val={nl.currency} set={v => setNl({ ...nl, currency: v })} opts={["USD", "EUR", "EGP"]} />
        {nl.type === "Bunker" ? <>
          <FSelect label="Fuel grade" val={nl.bunkerGrade} set={v => setNl({ ...nl, bunkerGrade: v })} opts={["", "MGO", "MDO", "IFO 180", "IFO 380", "LSFO"]} />
          <FField label="Qty ordered (L)" val={nl.qtyOrdered} set={v => setNl({ ...nl, qtyOrdered: v })} type="number" />
        </> : <FField label="Customs entry no." val={nl.customsEntryNo} set={v => setNl({ ...nl, customsEntryNo: v })} ph="optional" />}
        <div style={{ flex: 1 }} />
      </div>
      <SaveBtn ok={ok} onClick={save} label="Save supply request" />
    </div>}
    <Table columns={[
      { key: "id", label: "Order ID", render: v => <ObjLink>{v}</ObjLink> },
      { key: "yacht", label: "Vessel", render: v => <span style={{ fontWeight: 500 }}>{v}</span> },
      { key: "type", label: "Type", render: v => { const c = { Provision: S.green, Bunker: S.blue, "Spare Parts": S.orange, Technical: S.purple }; return <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: (c[v] || S.textS) + "18", color: c[v] || S.textS }}>{v}</span>; } },
      { key: "code", label: "Code" },
      { key: "desc", label: "Description" },
      { key: "port", label: "Port" },
      { key: "supplier", label: "Supplier" },
      { key: "date", label: "Date" },
      { key: "value", label: "Value", render: (v, r) => <span style={{ fontWeight: 600, color: S.gold }}>{r.currency === "EUR" ? "€" : "$"}{v.toLocaleString()}</span> },
      { key: "status", label: "Status", render: v => <Status value={v} /> },
    ]} data={filtered} />
    {tab === "bunker" && <InfoStrip type="info"><strong>Bunker pipeline (Section 14):</strong> Request Received → Vendor Assigned → In Progress → Awaiting BDN → Completed. <strong>VAT</strong> is determined by service type <em>and</em> vessel status — not flag alone (audit B13): foreign-flag <em>private</em> vessels in transit = exempt; Egyptian-flag or <em>commercial-charter</em> operation = 14%. Pending confirmation with the Egyptian tax advisor.</InfoStrip>}
  </>;
};

// FINANCE (Sections 16-18)
const FinanceView = ({ activeEntity, allOps }) => {
  const aeCode = activeEntity === "German Agency" ? "GRA" : activeEntity === "Cruising Agency" ? "CRA" : "FMA";
  const live = computeFinance(allOps || OPERATIONS);   // live ERP figures (FDAs + op rollups)
  const [tab, setTab] = useState("sales");
  const [entFilter, setEntFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2026-05-19");
  const tabs = [{ key: "sales", label: "Sales invoice analysis" }, { key: "bs", label: "Balance sheet" }, { key: "coa", label: "Chart of accounts" }];

  const INV = {
    FMA: { count: 50, usd: 2132344, egp: 562200, eur: 0, paid: 38, unpaid: 11, cancelled: 1,
      topYachts: [["KRI Prabu Siliwangi", 571350], ["Renaissance", 266893], ["KRI Brawijaya", 232705], ["Alaiya", 220750], ["Golden Odyssey", 128444], ["LIVA", 123596], ["Genesis", 160617], ["KRI Diponegoro", 71724]],
      cancelledList: [{ id: "FMA-I-2025-10-0002", vessel: "Khalidah", desc: "RIB rental", amt: "EGP 2,500" }],
      svcMix: [
        { svc: "SVC-01", name: "Transit", lines: 25, usd: 1683558 }, { svc: "SVC-18", name: "Port call", lines: 22, usd: 240298 },
        { svc: "SVC-04", name: "Bunkering", lines: 2, usd: 93100 }, { svc: "SVC-21", name: "Berthing", lines: 11, usd: 51993 },
        { svc: "SVC-05", name: "Provisions", lines: 2, usd: 25632 }, { svc: "SVC-06", name: "Land trips", lines: 3, usd: 15635 },
        { svc: "SVC-07", name: "Spare parts", lines: 6, usd: 11188 }, { svc: "SVC-03", name: "Disembarking", lines: 4, usd: 6720 },
        { svc: "SVC-02", name: "Embarking", lines: 2, usd: 2440 }, { svc: "SVC-19", name: "Certificates", lines: 3, usd: 1780 },
      ],
      bs: { cashUsd: 142500, cashEgp: 285000, cashEur: 0, ar: 86400, ap: 22100, equity: 180000, interco: -2300 },
    },
    GRA: { count: 203, usd: 4091503, egp: 0, eur: 0, paid: 159, unpaid: 42, cancelled: 2,
      topYachts: [["Nora", 489583], ["Yue Yu Feng Yong", 357469], ["Buccara Sea Falcon", 246320], ["Trident", 175293], ["Khalidah", 164118], ["Tai Chang 108", 132237], ["Pete Maverick Mitchell", 118853], ["Vector", 101834]],
      cancelledList: [{ id: "GRA-I-2025-03-0002", vessel: "My Brother Brancusi", desc: "Hurghada services", amt: "EGP 1,003" }, { id: "GRA-I-2025-05-0007", vessel: "Grace", desc: "Marassi check in & out", amt: "EGP 9,235" }],
      svcMix: [
        { svc: "SVC-01", name: "Transit", lines: 87, usd: 2763009 }, { svc: "SVC-04", name: "Bunkering", lines: 15, usd: 500808 },
        { svc: "SVC-18", name: "Port call", lines: 74, usd: 356783 }, { svc: "SVC-21", name: "Berthing", lines: 17, usd: 145243 },
        { svc: "SVC-05", name: "Provisions", lines: 22, usd: 108871 }, { svc: "SVC-06", name: "Land trips", lines: 9, usd: 55188 },
        { svc: "SVC-16", name: "Chartering", lines: 3, usd: 31063 }, { svc: "SVC-11", name: "Oil", lines: 6, usd: 30122 },
        { svc: "SVC-07", name: "Spare parts", lines: 6, usd: 19640 }, { svc: "SVC-13", name: "Shipment clr.", lines: 8, usd: 14902 },
      ],
      bs: { cashUsd: 387200, cashEgp: 0, cashEur: 0, ar: 312100, ap: 48300, equity: 450000, interco: 1500 },
    },
    CRA: { count: 214, usd: 582041, egp: 162899, eur: 9325, paid: 150, unpaid: 64, cancelled: 0,
      topYachts: [["JYC", 80374], ["Olah Two", 64160], ["Salida IV", 24394], ["Tatami", 22378], ["Nomad", 22702], ["Imladris", 41569], ["Eldamar", 30117], ["Kamar", 27085]],
      cancelledList: [],
      svcMix: [
        { svc: "SVC-01", name: "Transit", lines: 150, usd: 244384 }, { svc: "SVC-18", name: "Port call", lines: 44, usd: 171008 },
        { svc: "SVC-04", name: "Bunkering", lines: 14, usd: 98574 }, { svc: "SVC-16", name: "Chartering", lines: 1, usd: 25000 },
        { svc: "SVC-11", name: "Oil", lines: 2, usd: 11100 }, { svc: "SVC-19", name: "Certificates", lines: 8, usd: 9613 },
        { svc: "SVC-14", name: "Cash to master", lines: 1, usd: 6819 }, { svc: "SVC-21", name: "Berthing", lines: 4, usd: 5751 },
      ],
      bs: { cashUsd: 48300, cashEgp: 82000, cashEur: 4200, ar: 34700, ap: 8200, equity: 85000, interco: 800 },
    },
  };
  const SVC_MIX_BY_ENT = {
    ALL: [
      { svc: "SVC-01", name: "Transit", lines: 262, usd: 4690951 }, { svc: "SVC-18", name: "Port call", lines: 140, usd: 768089 },
      { svc: "SVC-04", name: "Bunkering", lines: 31, usd: 692482 }, { svc: "SVC-21", name: "Berthing", lines: 32, usd: 202987 },
      { svc: "SVC-05", name: "Provisions", lines: 26, usd: 135320 }, { svc: "SVC-06", name: "Land trips", lines: 14, usd: 71965 },
      { svc: "SVC-16", name: "Chartering", lines: 4, usd: 56063 }, { svc: "SVC-11", name: "Oil", lines: 8, usd: 41222 },
      { svc: "SVC-07", name: "Spare parts", lines: 13, usd: 33028 }, { svc: "SVC-19", name: "Certificates", lines: 14, usd: 24492 },
      { svc: "SVC-03", name: "Disembarking", lines: 18, usd: 18310 }, { svc: "SVC-13", name: "Shipment clr.", lines: 13, usd: 16710 },
      { svc: "SVC-02", name: "Embarking", lines: 15, usd: 12250 }, { svc: "SVC-20", name: "Meet & assist", lines: 9, usd: 10200 },
      { svc: "SVC-14", name: "Cash to master", lines: 3, usd: 10919 }, { svc: "SVC-22", name: "Diving", lines: 4, usd: 8937 },
      { svc: "SVC-10", name: "Fresh water", lines: 3, usd: 6630 }, { svc: "SVC-15", name: "Cruising permits", lines: 2, usd: 5536 },
      { svc: "SVC-12", name: "Garbage", lines: 5, usd: 2422 }, { svc: "SVC-17", name: "Customs clr.", lines: 2, usd: 1655 },
      { svc: "SVC-23", name: "Visa", lines: 1, usd: 695 },
    ],
    FMA: [
      { svc: "SVC-01", name: "Transit", lines: 25, usd: 1683558 }, { svc: "SVC-18", name: "Port call", lines: 22, usd: 240298 },
      { svc: "SVC-04", name: "Bunkering", lines: 2, usd: 93100 }, { svc: "SVC-21", name: "Berthing", lines: 11, usd: 51993 },
      { svc: "SVC-05", name: "Provisions", lines: 2, usd: 25632 }, { svc: "SVC-06", name: "Land trips", lines: 3, usd: 15635 },
      { svc: "SVC-07", name: "Spare parts", lines: 6, usd: 11188 }, { svc: "SVC-03", name: "Disembarking", lines: 4, usd: 6720 },
      { svc: "SVC-02", name: "Embarking", lines: 2, usd: 2440 }, { svc: "SVC-19", name: "Certificates", lines: 3, usd: 1780 },
    ],
    GRA: [
      { svc: "SVC-01", name: "Transit", lines: 87, usd: 2763009 }, { svc: "SVC-04", name: "Bunkering", lines: 15, usd: 500808 },
      { svc: "SVC-18", name: "Port call", lines: 74, usd: 356783 }, { svc: "SVC-21", name: "Berthing", lines: 17, usd: 145243 },
      { svc: "SVC-05", name: "Provisions", lines: 22, usd: 108871 }, { svc: "SVC-06", name: "Land trips", lines: 9, usd: 55188 },
      { svc: "SVC-16", name: "Chartering", lines: 3, usd: 31063 }, { svc: "SVC-11", name: "Oil", lines: 6, usd: 30122 },
      { svc: "SVC-07", name: "Spare parts", lines: 6, usd: 19640 }, { svc: "SVC-13", name: "Shipment clr.", lines: 8, usd: 14902 },
      { svc: "SVC-19", name: "Certificates", lines: 3, usd: 13099 }, { svc: "SVC-03", name: "Disembarking", lines: 14, usd: 11590 },
      { svc: "SVC-02", name: "Embarking", lines: 10, usd: 9190 }, { svc: "SVC-20", name: "Meet & assist", lines: 8, usd: 9810 },
      { svc: "SVC-10", name: "Fresh water", lines: 2, usd: 5540 }, { svc: "SVC-15", name: "Cruising permits", lines: 2, usd: 5536 },
      { svc: "SVC-22", name: "Diving", lines: 2, usd: 7312 }, { svc: "SVC-14", name: "Cash to master", lines: 2, usd: 4100 },
      { svc: "SVC-12", name: "Garbage", lines: 4, usd: 2160 }, { svc: "SVC-23", name: "Visa", lines: 1, usd: 695 },
    ],
    CRA: [
      { svc: "SVC-01", name: "Transit", lines: 150, usd: 244384 }, { svc: "SVC-18", name: "Port call", lines: 44, usd: 171008 },
      { svc: "SVC-04", name: "Bunkering", lines: 14, usd: 98574 }, { svc: "SVC-16", name: "Chartering", lines: 1, usd: 25000 },
      { svc: "SVC-11", name: "Oil", lines: 2, usd: 11100 }, { svc: "SVC-19", name: "Certificates", lines: 8, usd: 9613 },
      { svc: "SVC-14", name: "Cash to master", lines: 1, usd: 6819 }, { svc: "SVC-21", name: "Berthing", lines: 4, usd: 5751 },
      { svc: "SVC-07", name: "Spare parts", lines: 1, usd: 2200 }, { svc: "SVC-13", name: "Shipment clr.", lines: 5, usd: 1808 },
      { svc: "SVC-17", name: "Customs clr.", lines: 2, usd: 1655 }, { svc: "SVC-06", name: "Land trips", lines: 2, usd: 1142 },
      { svc: "SVC-02", name: "Embarking", lines: 3, usd: 688 }, { svc: "SVC-22", name: "Diving", lines: 2, usd: 1625 },
    ],
  };
  const activeSvcMix = SVC_MIX_BY_ENT[entFilter === "all" ? "ALL" : entFilter] || SVC_MIX_BY_ENT.ALL;

  const filtEnts = entFilter === "all" ? ["FMA", "GRA", "CRA"] : [entFilter];
  const totals = filtEnts.reduce((a, e) => ({ count: a.count + INV[e].count + live.per[e].inv, usd: a.usd + INV[e].usd + live.per[e].usd, egp: a.egp + INV[e].egp, eur: a.eur + INV[e].eur, paid: a.paid + INV[e].paid + live.per[e].paid, unpaid: a.unpaid + INV[e].unpaid + live.per[e].unpaid, cancelled: a.cancelled + INV[e].cancelled }), { count: 0, usd: 0, egp: 0, eur: 0, paid: 0, unpaid: 0, cancelled: 0 });
  const collRate = totals.count > 0 ? Math.round(totals.paid / totals.count * 1000) / 10 : 0;
  const allCancelled = filtEnts.flatMap(e => INV[e].cancelledList.map(c => ({ ...c, entity: e })));
  const fmt = v => v >= 1000000 ? `$${(v / 1000000).toFixed(2)}M` : v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`;

  const filtSvcMix = (() => {
    if (filtEnts.length === 1) return INV[filtEnts[0]].svcMix;
    const merged = {};
    filtEnts.forEach(e => INV[e].svcMix.forEach(s => {
      if (!merged[s.svc]) merged[s.svc] = { svc: s.svc, name: s.name, lines: 0, usd: 0 };
      merged[s.svc].lines += s.lines; merged[s.svc].usd += s.usd;
    }));
    return Object.values(merged).sort((a, b) => b.usd - a.usd);
  })();
  const svcMax = filtSvcMix.length > 0 ? filtSvcMix[0].usd : 1;

  const entNames = { FMA: "Felix Maritime", GRA: "German Agency", CRA: "Cruising Agency" };
  const entColors = { FMA: S.blue, GRA: S.navy, CRA: "#1D9E75" };
  const entBgs = { FMA: S.blueBg, GRA: "#E6F1FB", CRA: "#E1F5EE" };
  const entTextColors = { FMA: S.blue, GRA: "#0C447C", CRA: "#085041" };

  // Balances derive from the per-agency balance sheets (historical) + live ERP figures —
  // AR adds unpaid live FDAs + unbilled op revenue; VAT comes from released live FDAs.
  const bsSum = (k) => ["FMA", "GRA", "CRA"].reduce((a, e) => a + (INV[e].bs[k] || 0), 0);
  const coa = [
    { code: "1010", name: "Cash — EGP", type: "Asset", balance: bsSum("cashEgp") },
    { code: "1020", name: "Cash — USD", type: "Asset", balance: bsSum("cashUsd") },
    { code: "1030", name: "Cash — EUR", type: "Asset", balance: bsSum("cashEur") },
    { code: "1210", name: "Accounts Receivable", type: "Asset", balance: bsSum("ar") + live.gl.arBalance + live.gl.unbilled },
    { code: "1220", name: "VAT Receivable (input VAT)", type: "Asset", balance: 0 },
    { code: "1310", name: "Prepaid Expenses", type: "Asset", balance: 0 },
    { code: "2010", name: "Accounts Payable", type: "Liability", balance: bsSum("ap") },
    { code: "2020", name: "VAT Payable", type: "Liability", balance: live.gl.vatPayable },
    { code: "2030", name: "Accrued Liabilities", type: "Liability", balance: 0 },
    // Client float held for onward payment to SCA/ports/government — pass-through money, never revenue (audit B01/B03).
    { code: "2040", name: "Advances from Principals (client funds)", type: "Liability", balance: live.gl.passThroughBilled },
    { code: "3010", name: "Owner's Equity / Capital", type: "Equity", balance: 0 },
    { code: "3020", name: "Retained Earnings", type: "Equity", balance: 0 },
    { code: "3030", name: "Cumulative Translation Adjustment (CTA)", type: "Equity", balance: 0 },
    { code: "4010", name: "Agency Fee Revenue", type: "Revenue", balance: 12400 },
    { code: "4020", name: "Transit Revenue", type: "Revenue", balance: 18600 },
    { code: "4030", name: "Port Call Revenue", type: "Revenue", balance: 6200 },
    { code: "4040", name: "Bunkering Revenue", type: "Revenue", balance: 6500 },
    { code: "4050", name: "Crew Service Revenue", type: "Revenue", balance: 3200 },
    { code: "4060", name: "Supply & Logistics Revenue", type: "Revenue", balance: 2800 },
    { code: "4070", name: "Chartering Revenue", type: "Revenue", balance: 1500 },
    { code: "4099", name: "Other Revenue", type: "Revenue", balance: 800 },
    { code: "4910", name: "FX Gain / (Loss) — realised", type: "Revenue", balance: 0 },
    { code: "5010", name: "Cost of Services — Port & Canal", type: "Expense", balance: 14200 },
    { code: "5020", name: "Cost of Services — Bunkering", type: "Expense", balance: 4800 },
    { code: "5030", name: "Cost of Services — Crew", type: "Expense", balance: 2400 },
    { code: "5040", name: "Cost of Services — Supplies", type: "Expense", balance: 1800 },
    { code: "6010", name: "Salaries & Wages", type: "G&A Expense", balance: 2200 },
    { code: "6020", name: "Office & Admin Expenses", type: "G&A Expense", balance: 1000 },
    { code: "6030", name: "Travel & Transportation", type: "G&A Expense", balance: 600 },
    { code: "6040", name: "Depreciation", type: "G&A Expense", balance: 0 },
    { code: "7010", name: "Intercompany Receivable", type: "Intercompany", balance: 0 },
    { code: "7020", name: "Intercompany Payable", type: "Intercompany", balance: 0 },
    { code: "7030", name: "Intercompany Revenue Allocation", type: "Intercompany", balance: 0 },
  ];

  const PaymentBar = ({ ent }) => {
    const d = INV[ent]; const t = d.paid + d.unpaid + d.cancelled;
    return <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}><span style={{ fontWeight: 500 }}>{ent}</span><span style={{ color: S.textS }}>{d.paid} paid / {d.unpaid} unpaid{d.cancelled > 0 ? ` / ${d.cancelled} canc.` : ""}</span></div>
      <div style={{ display: "flex", height: 12, borderRadius: 3, overflow: "hidden", gap: 1 }}>
        <div style={{ width: `${d.paid / t * 100}%`, background: S.green, borderRadius: "3px 0 0 3px" }}></div>
        <div style={{ width: `${d.unpaid / t * 100}%`, background: S.orange }}></div>
        {d.cancelled > 0 && <div style={{ width: `${d.cancelled / t * 100}%`, background: S.red, borderRadius: "0 3px 3px 0" }}></div>}
      </div>
    </div>;
  };

  const TopYachts = ({ ent }) => <div style={{ border: `1px solid ${S.borderL}`, borderRadius: 6, overflow: "hidden" }}>
    <div style={{ padding: "5px 10px", background: entBgs[ent], fontSize: 11, fontWeight: 500, color: entColors[ent] }}>{entNames[ent]}</div>
    {INV[ent].topYachts.slice(0, 5).map(([v, a], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 10px", borderTop: `1px solid ${S.borderL}`, fontSize: 11 }}>
      <span>{v}</span><span style={{ fontWeight: 500 }}>{fmt(a)}</span>
    </div>)}
  </div>;

  const SvcRow = ({ s, maxUsd }) => <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
    <span style={{ fontFamily: "monospace", fontSize: 10, color: S.brand, width: 46, flexShrink: 0 }}>{s.svc}</span>
    <span style={{ fontSize: 11, width: 80, flexShrink: 0 }}>{s.name}</span>
    <div style={{ flex: 1, height: 10, background: S.borderL, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${Math.max(s.usd / maxUsd * 100, 1)}%`, height: "100%", background: S.brand, borderRadius: 3 }}></div>
    </div>
    <span style={{ fontSize: 11, fontWeight: 500, minWidth: 55, textAlign: "right" }}>{fmt(s.usd)}</span>
    <span style={{ fontSize: 10, color: S.textH, minWidth: 30, textAlign: "right" }}>{s.lines}L</span>
  </div>;

  return <>
    <Tabs tabs={tabs} active={tab} onChange={setTab} />
    {tab === "sales" && <>
      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: S.bg, borderBottom: `1px solid ${S.borderL}`, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: S.textS }}>Entity:</span>
        {[["all", "All entities"], ["FMA", "Felix"], ["GRA", "German"], ["CRA", "Cruising"]].map(([k, l]) => (
          <button key={k} onClick={() => setEntFilter(k)} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${entFilter === k ? S.brand : S.border}`, background: entFilter === k ? S.brand : "transparent", color: entFilter === k ? "#fff" : S.text }}>{l}</button>
        ))}
        <div style={{ flex: 1 }}></div>
        <span style={{ fontSize: 11, color: S.textS }}>From:</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ border: `1px solid ${S.border}`, borderRadius: 4, padding: "2px 6px", fontSize: 11, background: S.surface, color: S.text }} />
        <span style={{ fontSize: 11, color: S.textS }}>To:</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ border: `1px solid ${S.border}`, borderRadius: 4, padding: "2px 6px", fontSize: 11, background: S.surface, color: S.text }} />
      </div>

      {/* KPI tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: 12 }}>
        <Tile title="Total invoices" value={totals.count} icon={FileText} accent={S.navy} footer={`${filtEnts.length} ${filtEnts.length === 1 ? "entity" : "entities"}`} />
        <Tile title="Revenue (USD)" value={`$${(totals.usd / 1000000).toFixed(2)}M`} icon={DollarSign} accent={S.green} footer={`${totals.egp > 0 ? `+ EGP ${Math.round(totals.egp / 1000)}K` : ""}${totals.eur > 0 ? ` · EUR ${totals.eur.toLocaleString()}` : ""}`} />
        <Tile title="Collection rate" value={`${collRate}%`} icon={TrendingUp} accent={collRate >= 70 ? S.green : S.orange} footer={`${totals.paid} paid / ${totals.unpaid} unpaid`} footerType={collRate >= 70 ? "up" : "down"} />
        <Tile title="Cancelled" value={totals.cancelled} icon={AlertCircle} accent={totals.cancelled > 0 ? S.red : S.green} footer={filtEnts.map(e => `${e}: ${INV[e].cancelled}`).join(" · ")} />
      </div>

      {/* Revenue by agency */}
      {entFilter === "all" && <div style={{ padding: "0 12px 12px" }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><DollarSign size={13} /> Revenue by agency</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, border: `1px solid ${S.borderL}`, borderRadius: 6 }}>
          <thead><tr style={{ background: S.bg }}>
            {["Entity", "Invoices", "USD", "EGP", "EUR", "Share"].map(h => <th key={h} style={{ textAlign: h === "Entity" ? "left" : "right", padding: "5px 8px", fontSize: 10, color: S.textS, fontWeight: 500, borderBottom: `1px solid ${S.border}` }}>{h}</th>)}
          </tr></thead>
          <tbody>{["GRA", "FMA", "CRA"].map(e => {
            const d = INV[e]; const share = Math.round(d.usd / totals.usd * 1000) / 10;
            return <tr key={e}>
              <td style={{ padding: "5px 8px", borderTop: `1px solid ${S.borderL}` }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: entColors[e], marginRight: 6, verticalAlign: "middle" }}></span>{entNames[e]}</td>
              <td style={{ textAlign: "right", padding: "5px 8px", borderTop: `1px solid ${S.borderL}` }}>{d.count}</td>
              <td style={{ textAlign: "right", padding: "5px 8px", borderTop: `1px solid ${S.borderL}`, fontWeight: 500 }}>${d.usd.toLocaleString()}</td>
              <td style={{ textAlign: "right", padding: "5px 8px", borderTop: `1px solid ${S.borderL}`, color: d.egp > 0 ? S.text : S.textH }}>{d.egp > 0 ? `EGP ${d.egp.toLocaleString()}` : "—"}</td>
              <td style={{ textAlign: "right", padding: "5px 8px", borderTop: `1px solid ${S.borderL}`, color: d.eur > 0 ? S.text : S.textH }}>{d.eur > 0 ? `EUR ${d.eur.toLocaleString()}` : "—"}</td>
              <td style={{ textAlign: "right", padding: "5px 8px", borderTop: `1px solid ${S.borderL}` }}><div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}><div style={{ width: 50, height: 5, background: S.borderL, borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${share}%`, height: "100%", background: entColors[e], borderRadius: 3 }}></div></div>{share}%</div></td>
            </tr>;
          })}</tbody>
        </table>
      </div>}

      {/* Payment status + Service mix */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 12px 12px" }}>
        <div style={{ border: `1px solid ${S.borderL}`, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}><Receipt size={13} /> Payment status</div>
          {filtEnts.map(e => <PaymentBar key={e} ent={e} />)}
          <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: S.textH }}>
            <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: S.green, marginRight: 4, verticalAlign: "middle" }}></span>Paid</span>
            <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: S.orange, marginRight: 4, verticalAlign: "middle" }}></span>Unpaid</span>
            <span><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: S.red, marginRight: 4, verticalAlign: "middle" }}></span>Canc.</span>
          </div>
        </div>
        <div style={{ border: `1px solid ${S.borderL}`, borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><BarChart3 size={13} /> Service mix{entFilter !== "all" ? ` — ${entNames[entFilter]}` : ""} (USD)</div>
          <div style={{ maxHeight: 210, overflowY: "auto" }}>
            {activeSvcMix.filter(s => s.usd > 0).map(s => <SvcRow key={s.svc} s={s} maxUsd={activeSvcMix[0].usd} />)}
          </div>
        </div>
      </div>

      {/* Top yachts */}
      <div style={{ padding: "0 12px 12px" }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Ship size={13} /> Top yachts by revenue (USD)</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${filtEnts.length > 2 ? 3 : filtEnts.length}, 1fr)`, gap: 8 }}>
          {filtEnts.map(e => <TopYachts key={e} ent={e} />)}
        </div>
      </div>

      {/* Cancelled invoices */}
      {allCancelled.length > 0 && <div style={{ padding: "0 12px 12px" }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 4, color: S.red }}><AlertCircle size={13} /> Cancelled invoices</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, border: `1px solid ${S.borderL}`, borderRadius: 6 }}>
          <thead><tr style={{ background: S.redBg }}>
            {["Doc ID", "Entity", "Vessel", "Description", "Amount"].map(h => <th key={h} style={{ textAlign: h === "Amount" ? "right" : "left", padding: "4px 8px", fontSize: 10, color: S.red, fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>{allCancelled.map((c, i) => <tr key={i} style={{ borderTop: `1px solid ${S.borderL}` }}>
            <td style={{ padding: "4px 8px", fontFamily: "monospace", color: S.brand }}>{c.id}</td>
            <td style={{ padding: "4px 8px" }}>{c.entity}</td>
            <td style={{ padding: "4px 8px" }}>{c.vessel}</td>
            <td style={{ padding: "4px 8px", color: S.textS }}>{c.desc}</td>
            <td style={{ padding: "4px 8px", textAlign: "right" }}>{c.amt}</td>
          </tr>)}</tbody>
        </table>
      </div>}

      <InfoStrip type="info"><strong>Data source:</strong> {totals.count} invoices, {activeSvcMix.reduce((a, s) => a + s.lines, 0)} line items across {filtEnts.length} entities. Period: {dateFrom} to {dateTo}. All amounts at invoice-level precision.</InfoStrip>
      <InfoStrip type="gold"><strong>Revenue basis (audit B01 — pending finance sign-off):</strong> gross billings above include pass-through disbursements (canal dues, port &amp; government fees) which are client money, not income. Live ERP split: <strong>net agency income ${live.gl.netAgencyIncome.toLocaleString()}</strong> (fee/commission lines) vs <strong>${live.gl.passThroughBilled.toLocaleString()} pass-through</strong> (held as "Advances from Principals", acct 2040). Line classification defaults by service name and can be overridden per line. <strong>The FDA is the authoritative invoice</strong> — its status and payment state are the single source of truth (audit B12).</InfoStrip>
    </>}

    {tab === "bs" && <>
      {/* Entity filter bar for BS */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: S.bg, borderBottom: `1px solid ${S.borderL}` }}>
        <span style={{ fontSize: 11, color: S.textS }}>Entity:</span>
        {[["all", "All entities"], ["FMA", "Felix"], ["GRA", "German"], ["CRA", "Cruising"]].map(([k, l]) => (
          <button key={k} onClick={() => setEntFilter(k)} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${entFilter === k ? S.brand : S.border}`, background: entFilter === k ? S.brand : "transparent", color: entFilter === k ? "#fff" : S.text }}>{l}</button>
        ))}
      </div>
      {(() => {
        const bsTotals = filtEnts.reduce((a, e) => {
          const b = INV[e].bs;
          return { cashUsd: a.cashUsd + b.cashUsd, cashEgp: a.cashEgp + b.cashEgp, cashEur: a.cashEur + b.cashEur, ar: a.ar + b.ar, ap: a.ap + b.ap, equity: a.equity + b.equity, interco: a.interco + b.interco };
        }, { cashUsd: 0, cashEgp: 0, cashEur: 0, ar: 0, ap: 0, equity: 0, interco: 0 });
        const bsRows = [
          { code: "1010", name: "Cash — EGP", type: "Asset", fma: INV.FMA.bs.cashEgp, gra: INV.GRA.bs.cashEgp, cra: INV.CRA.bs.cashEgp },
          { code: "1020", name: "Cash — USD", type: "Asset", fma: INV.FMA.bs.cashUsd, gra: INV.GRA.bs.cashUsd, cra: INV.CRA.bs.cashUsd },
          { code: "1030", name: "Cash — EUR", type: "Asset", fma: INV.FMA.bs.cashEur, gra: INV.GRA.bs.cashEur, cra: INV.CRA.bs.cashEur },
          { code: "1210", name: "Accounts Receivable", type: "Asset", fma: INV.FMA.bs.ar, gra: INV.GRA.bs.ar, cra: INV.CRA.bs.ar },
          { code: "2010", name: "Accounts Payable", type: "Liability", fma: INV.FMA.bs.ap, gra: INV.GRA.bs.ap, cra: INV.CRA.bs.ap },
          { code: "2020", name: "VAT Payable", type: "Liability", fma: 3200, gra: 0, cra: 1800 },
          { code: "3010", name: "Retained Earnings", type: "Equity", fma: INV.FMA.bs.equity, gra: INV.GRA.bs.equity, cra: INV.CRA.bs.equity },
          { code: "7010", name: "Intercompany", type: "Intercompany", fma: INV.FMA.bs.interco, gra: INV.GRA.bs.interco, cra: INV.CRA.bs.interco },
        ];
        const tc = { Asset: [S.blueBg, S.blue], Liability: [S.orangeBg, S.orange], Equity: [S.goldBg, S.gold], Intercompany: ["#EEEDFE", "#534AB7"] };
        return <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: 12 }}>
            <Tile title="Total assets" value={`$${Math.round((bsTotals.cashUsd + bsTotals.cashEgp / CURRENCIES.EGP + bsTotals.ar) / 1000)}K`} icon={TrendingUp} accent={S.blue} footer={filtEnts.join(" + ")} />
            <Tile title="Total liabilities" value={`$${Math.round(bsTotals.ap / 1000)}K`} icon={TrendingDown} accent={S.orange} />
            <Tile title="Equity" value={`$${Math.round(bsTotals.equity / 1000)}K`} icon={DollarSign} accent={S.navy} />
            <Tile title="Intercompany (net)" value={entFilter === "all" ? "$0" : `$${bsTotals.interco.toLocaleString()}`} icon={ArrowUpDown} accent={S.purple} footer={entFilter === "all" ? "Eliminated on consolidation" : ""} />
          </div>
          <div style={{ padding: "0 12px 12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, border: `1px solid ${S.borderL}` }}>
              <thead><tr style={{ background: S.bg }}>
                <th style={{ textAlign: "left", padding: "5px 8px", fontSize: 10, color: S.textS, fontWeight: 500 }}>Account</th>
                {filtEnts.map(e => <th key={e} style={{ textAlign: "right", padding: "5px 8px", fontSize: 10, color: entTextColors[e] || S.textS, fontWeight: 500 }}>{e}</th>)}
                {entFilter === "all" && <th style={{ textAlign: "right", padding: "5px 8px", fontSize: 10, color: S.textS, fontWeight: 500 }}>Consolidated</th>}
              </tr></thead>
              <tbody>{bsRows.map((a, i) => {
                const vals = filtEnts.map(e => a[e.toLowerCase()]);
                const consol = vals.reduce((s, v) => s + v, 0);
                const isIC = a.type === "Intercompany";
                const prevType = i > 0 ? bsRows[i - 1].type : "";
                return <tr key={i} style={{ borderTop: prevType !== a.type ? `2px solid ${S.border}` : `1px solid ${S.borderL}` }}>
                  <td style={{ padding: "5px 8px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: S.brand, marginRight: 6 }}>{a.code}</span>{a.name}
                    <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, marginLeft: 6, background: (tc[a.type] || ["#eee"])[0], color: (tc[a.type] || ["", "#666"])[1] }}>{a.type}</span>
                  </td>
                  {filtEnts.map(e => <td key={e} style={{ textAlign: "right", padding: "5px 8px", fontWeight: 500, color: a[e.toLowerCase()] < 0 ? S.red : S.text }}>{a[e.toLowerCase()] !== 0 ? `$${a[e.toLowerCase()].toLocaleString()}` : "—"}</td>)}
                  {entFilter === "all" && <td style={{ textAlign: "right", padding: "5px 8px", fontWeight: 500, color: isIC ? S.textH : S.text }}>{isIC && Math.abs(consol) === 0 ? "Eliminated" : consol !== 0 ? `$${consol.toLocaleString()}` : "—"}</td>}
                </tr>;
              })}</tbody>
            </table>
          </div>
          <InfoStrip type="info"><strong>SAP company code model:</strong> Each entity maintains its own ledger. Intercompany accounts (7xxx) net to zero on consolidation. Shared chart of accounts across all three entities.</InfoStrip>
          <InfoStrip type="gold"><strong>FX consolidation policy (audit B10 — pending finance sign-off):</strong> monetary balance-sheet items translate at the <strong>closing rate</strong>; P&amp;L at the <strong>period-average rate</strong>. Translation residual posts to CTA (acct 3030, equity); realised differences post to FX Gain/(Loss) (acct 4910).</InfoStrip>
        </>;
      })()}
    </>}

    {tab === "coa" && <>
      <Toolbar title={`Chart of accounts — ${coa.length} accounts · Shared across FMA, GRA, CRA`} />
      <Table columns={[
        { key: "code", label: "Code", render: v => <span style={{ fontFamily: "monospace", fontWeight: 500, color: S.brand }}>{v}</span> },
        { key: "name", label: "Account Name", render: v => <span style={{ fontWeight: 500 }}>{v}</span> },
        { key: "type", label: "Type", render: v => <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 11, background: { Asset: S.blueBg, Liability: S.orangeBg, Revenue: S.greenBg, Expense: S.redBg, "G&A Expense": S.purpleBg, Equity: S.goldBg, Intercompany: "#EEEDFE" }[v] || S.borderL, color: { Asset: S.blue, Liability: S.orange, Revenue: S.green, Expense: S.red, "G&A Expense": S.purple, Equity: S.gold, Intercompany: "#534AB7" }[v] || S.textS }}>{v}</span> },
        { key: "balance", label: "Balance", render: v => <span style={{ fontFamily: "monospace", fontWeight: 500, color: v ? S.text : S.textH }}>{v ? Number(v).toLocaleString() : "—"}</span> },
      ]} data={coa} />
      <InfoStrip type="info"><strong>Shared chart:</strong> All three entities (FMA, GRA, CRA) use the same account structure. Each posts independently to its own ledger. The 7xxx Intercompany range handles cross-entity transactions.</InfoStrip>
    </>}
  </>;
};

// TARIFF MANAGEMENT (Section 22)
const TariffView = () => {
  const [tTab, setTTab] = useState("toll");
  const [sdrHistory, setSdrHistory] = useState([
    { date: "2026-05-19", rate: 1.3682, source: "IMF", fetchedBy: "System" },
    { date: "2026-04-03", rate: 1.3594, source: "IMF", fetchedBy: "System" },
    { date: "2026-01-15", rate: 1.3450, source: "IMF", fetchedBy: "Manual" },
  ]);
  const [sdrFetching, setSdrFetching] = useState(false);
  const [sdrError, setSdrError] = useState(null);
  const SDR_RATE = sdrHistory.length > 0 ? sdrHistory[0].rate : 1.3682;
  const lastFetched = sdrHistory.length > 0 ? sdrHistory[0] : null;

  const fetchSDR = () => {
    setSdrFetching(true); setSdrError(null);
    setTimeout(() => {
      setSdrError("Browser cannot reach IMF directly (CORS). In production, a backend cron job fetches from imf.org/external/np/fin/data/rms_sdrv.aspx daily. Enter the rate manually below.");
      setSdrFetching(false);
    }, 1200);
  };

  const [manualRate, setManualRate] = useState("");
  const addManualSDR = () => {
    const r = parseFloat(manualRate);
    if (!r || r <= 0) return;
    setSdrHistory(prev => [{ date: new Date().toISOString().slice(0, 10), rate: r, source: "Manual", fetchedBy: "Sarah A." }, ...prev]);
    setManualRate(""); setSdrError(null);
  };
  const [slabs, setSlabs] = useState([
    { from: 0, to: 5000, rate: 11.98 }, { from: 5001, to: 10000, rate: 7.94 }, { from: 10001, to: 20000, rate: 7.14 },
    { from: 20001, to: 40000, rate: 5.06 }, { from: 40001, to: 70000, rate: 4.76 }, { from: 70001, to: 120000, rate: 4.31 },
    { from: 120001, to: 999999, rate: 4.16 },
  ]);
  const [tariffMeta, setTariffMeta] = useState({ circularRef: "SCA Circular 1/2024", lastUpdated: "2026-01-15", updatedBy: "System" });
  const [circulars, setCirculars] = useState([
    { id: "cir1", ref: "SCA Circular 1/2024", date: "2024-01-15", effectiveDate: "2024-01-15", type: "SCA Toll Table", status: "Active", notes: "Current slab-based toll rates for vessels 300+ SCNT", hasFile: true, fileType: "pdf" },
    { id: "cir2", ref: "SCA Art. 103", date: "2015-06-08", effectiveDate: "2015-06-08", type: "Sea Trial", status: "Active", notes: "Sea trial charges — $340 for 300–900 GT, $2,000 for >900 GT", hasFile: true, fileType: "pdf" },
    { id: "cir3", ref: "PM Decree 2721/2022", date: "2022-09-01", effectiveDate: "2022-10-01", type: "Port Clearance", status: "Active", notes: "Prime Minister decree regulating port clearance fees", hasFile: true, fileType: "pdf" },
    { id: "cir4", ref: "SCA Circular 3/2023", date: "2023-03-15", effectiveDate: "2023-04-01", type: "Mooring & Lights", status: "Superseded", notes: "Old mooring rates — superseded by 1/2024", hasFile: true, fileType: "image" },
  ]);
  const [showCirculars, setShowCirculars] = useState(false);
  const [addingCircular, setAddingCircular] = useState(false);
  const [newCirc, setNewCirc] = useState({ ref: "", date: "", effectiveDate: "", type: "SCA Toll Table", notes: "" });
  const [scRates, setScRates] = useState({ foreign: 6.65, egyptian: 3.30 });
  const [mooringTiers, setMooringTiers] = useState([
    { maxGT: 1500, rate: 2500, label: "<1,500 GT (mooring)" },
    { maxGT: 99999, rate: 3500, label: "\u22651,500 GT (mooring + lighting)" },
  ]);
  const [pilotageBrackets, setPilotageBrackets] = useState([
    { maxGT: 999, waiting: 97, shifting: 167, label: "\u2264999 GT" },
    { maxGT: 4999, waiting: 178, shifting: 273, label: "1,000\u20134,999 GT" },
  ]);
  const [portClearanceTiers, setPortClearanceTiers] = useState([
    { maxLOA: 15, rate: 70, label: "10m\u201315m" },
    { maxLOA: 99999, rate: 140, label: "16m+" },
  ]);
  const [fixedRates, setFixedRates] = useState({ etrRate: 500, etrExempt: 300, envRate: 200, envExempt: 300, immigrationRate: 42, immigrationNote: "Per movement at Ismailia Marina", nsDefault: 40, seaTrialExempt: 300 });
  const [nsTariff, setNsTariff] = useState([
    { code: "transit", label: "\u0639\u0628\u0648\u0631 Transit", rate: 350 },
    { code: "interport", label: "\u062A\u0635\u0631\u064A\u062D Inter-port", rate: 1000 },
    { code: "mooring", label: "\u062A\u0631\u0627\u0643\u064A Mooring", rate: 1000 },
    { code: "inquiry", label: "\u0627\u0633\u062A\u0639\u0644\u0627\u0645 Security inquiry", rate: 220 },
    { code: "departure", label: "\u0631\u0641\u062A Departure", rate: 1000 },
    { code: "assignment", label: "\u062A\u0639\u064A\u064A\u0646 Assignment", rate: 1000 },
  ]);
  const [seaTrial, setSeaTrial] = useState({ smallRate: 340, largeRate: 2000, thresholdGT: 900 });

  const calcToll = (scnt) => {
    let total = 0, remaining = scnt, bd = [];
    for (const s of [...slabs].sort((a, b) => a.from - b.from)) {
      if (remaining <= 0) break;
      const slabSize = s.to - s.from + 1;
      const tons = Math.min(remaining, slabSize);
      const sub = Math.round(tons * s.rate * 10) / 10;
      bd.push({ tons, rate: s.rate, sub });
      total += sub; remaining -= tons;
    }
    return { totalSDR: Math.round(total * 10) / 10, totalUSD: Math.round(total * SDR_RATE * 100) / 100, bd };
  };

  const updSlab = (idx, field, val) => setSlabs(p => p.map((s, i) => i === idx ? { ...s, [field]: parseFloat(val) || 0 } : s));
  const addSlab = () => { const last = [...slabs].sort((a, b) => b.from - a.from)[0]; setSlabs(p => [...p, { from: (last?.to || 0) + 1, to: (last?.to || 0) + 50000, rate: 4.00 }]); };
  const removeSlab = idx => setSlabs(p => p.filter((_, i) => i !== idx));

  const inp = { border: `1px solid ${S.border}`, borderRadius: 4, padding: "4px 8px", fontSize: 12, textAlign: "right", background: S.surface, width: 80 };
  // Includes cross-boundary profiles (audit B08/B19): 7,500 spans slabs 1–2; 24,000 spans slabs 1–4.
  const examples = [{ label: "300 SCNT", scnt: 300 }, { label: "880 SCNT (BELLA VITA)", scnt: 880 }, { label: "2,940 SCNT (SERENITY STAR)", scnt: 2940 }, { label: "7,500 SCNT — crosses the 5,000 boundary", scnt: 7500 }, { label: "24,000 SCNT — crosses three boundaries", scnt: 24000 }];

  return <>
    <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${S.border}`, marginBottom: 12 }}>
      {[["toll", "SCA Toll Table"], ["tariffs", "Canal & Port Tariffs"]].map(([k, l]) => (
        <button key={k} onClick={() => setTTab(k)} style={{ padding: "8px 16px", fontSize: 12, cursor: "pointer", border: "none", background: "transparent", color: tTab === k ? S.brand : S.textS, fontWeight: tTab === k ? 500 : 400, borderBottom: `2px solid ${tTab === k ? S.brand : "transparent"}`, marginBottom: -1 }}>{l}</button>
      ))}
    </div>

    {tTab === "toll" && <>
      <SmallVesselCanalCalc sdr={SDR_RATE} />
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: S.navy }}>SCA Transit Dues — Special Floating Units toll table</div>
            <div style={{ fontSize: 11, color: S.textS, marginTop: 4, lineHeight: 1.5 }}>Slab-based tariff for vessels 300 SCNT and above. Rates in SDR per ton. Effective 15 January 2024.<br /><strong>Marginal (progressive) calculation</strong> — each slab is charged at its own rate, like tax brackets; only the tons falling <em>inside</em> a slab pay that slab's rate. The basis is <strong>Suez Canal Net Tonnage (SCNT)</strong> — never SCGT or GT (resolver falls back SCNT → SCGT → GT only when SCNT is missing, flagged on the vessel).</div>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 6, background: S.blueBg, flexShrink: 0, minWidth: 220 }}>
            <div style={{ fontSize: 10, color: S.textS, fontWeight: 500 }}>CURRENT SDR RATE</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: S.navy }}>1 SDR = ${SDR_RATE.toFixed(4)} USD</div>
            {lastFetched && <div style={{ fontSize: 10, color: S.textH, marginTop: 2 }}>Last: {lastFetched.date} · {lastFetched.source} · {lastFetched.fetchedBy}</div>}
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              <button onClick={fetchSDR} disabled={sdrFetching} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 500, cursor: sdrFetching ? "default" : "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}>{sdrFetching ? "Fetching..." : "Fetch from IMF"}</button>
            </div>
            {sdrError && <div style={{ marginTop: 6, padding: "5px 8px", borderRadius: 4, background: S.orangeBg, fontSize: 10, color: S.orange, lineHeight: 1.4 }}>{sdrError}</div>}
            {sdrError && <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <input type="number" step="0.0001" value={manualRate} onChange={e => setManualRate(e.target.value)} placeholder="e.g. 1.3720" style={{ width: 100, border: `1px solid ${S.border}`, borderRadius: 3, padding: "3px 6px", fontSize: 11 }} />
              <button onClick={addManualSDR} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 10, cursor: "pointer", border: `1px solid ${S.green}`, background: S.green, color: "#fff" }}>Save</button>
            </div>}
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: S.bg }}>
            {["Slab", "From (SCNT)", "To (SCNT)", "Rate (SDR/ton)", "Tons in slab", ""].map((h, i) => <th key={i} style={{ textAlign: i >= 3 ? "right" : "left", padding: "8px 10px", fontSize: 10, fontWeight: 500, color: S.textS, textTransform: "uppercase", borderBottom: `2px solid ${S.border}` }}>{h}</th>)}
          </tr></thead>
          <tbody>{[...slabs].sort((a, b) => a.from - b.from).map((s, i) => {
            const tons = s.to >= 999999 ? "Unlimited" : (s.to - s.from + 1).toLocaleString();
            return <tr key={i} style={{ borderBottom: `1px solid ${S.borderL}` }}>
              <td style={{ padding: "7px 10px", fontWeight: 500, color: S.navy }}>{i + 1}</td>
              <td style={{ padding: "7px 10px" }}><input type="number" style={inp} value={s.from} onChange={e => updSlab(i, "from", e.target.value)} /></td>
              <td style={{ padding: "7px 10px" }}><input type="number" style={inp} value={s.to} onChange={e => updSlab(i, "to", e.target.value)} /></td>
              <td style={{ padding: "7px 10px", textAlign: "right" }}><span style={{ padding: "4px 12px", borderRadius: 4, fontSize: 13, fontWeight: 500, color: S.navy, background: S.blueBg }}>{s.rate}</span></td>
              <td style={{ padding: "7px 10px", textAlign: "right", color: S.textS }}>{tons}</td>
              <td style={{ padding: "7px 10px" }}><button onClick={() => removeSlab(i)} style={{ color: S.red, fontSize: 11, cursor: "pointer", border: "none", background: "none" }}>Remove</button></td>
            </tr>;
          })}</tbody>
        </table>
        <button onClick={addSlab} style={{ marginTop: 10, padding: "6px 14px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.brand}`, background: "transparent", color: S.brand }}>+ Add slab</button>
      </div>

      {/* SDR Rate History */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>SDR rate history</div>
          <span style={{ fontSize: 10, color: S.textH }}>Source: <a href="https://www.imf.org/external/np/fin/data/rms_sdrv.aspx" target="_blank" rel="noopener" style={{ color: S.brand }}>IMF SDR Valuation</a></span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: S.bg }}>
            {["Date", "1 SDR = USD", "Source", "Fetched by"].map(h => <th key={h} style={{ textAlign: h === "1 SDR = USD" ? "right" : "left", padding: "6px 10px", fontSize: 10, fontWeight: 500, color: S.textS, borderBottom: `1px solid ${S.border}` }}>{h}</th>)}
          </tr></thead>
          <tbody>{sdrHistory.map((r, i) => <tr key={i} style={{ borderBottom: `1px solid ${S.borderL}` }}>
            <td style={{ padding: "5px 10px" }}>{r.date}</td>
            <td style={{ padding: "5px 10px", textAlign: "right", fontWeight: i === 0 ? 500 : 400, color: i === 0 ? S.navy : S.text }}>{r.rate.toFixed(4)}</td>
            <td style={{ padding: "5px 10px" }}><span style={{ padding: "2px 6px", borderRadius: 3, fontSize: 10, background: r.source === "Manual" ? S.orangeBg : S.blueBg, color: r.source === "Manual" ? S.orange : S.blue }}>{r.source}</span></td>
            <td style={{ padding: "5px 10px", fontSize: 11, color: S.textS }}>{r.fetchedBy}</td>
          </tr>)}</tbody>
        </table>
      </div>

      <InfoStrip type="info"><strong>Production architecture:</strong> A backend cron job fetches the SDR rate daily from the IMF website (https://www.imf.org/external/np/fin/data/rms_sdrv.aspx), parses the USD row, calculates 1/SDR_per_USD, and stores it in the database. The frontend reads from the database — no browser-to-IMF request needed. IMF publishes rates every business day around 12:00 EST.</InfoStrip>

      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Example calculations</div>
        {examples.map(ex => {
          const r = calcToll(ex.scnt);
          return <div key={ex.label} style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 6, border: `1px solid ${S.borderL}`, background: S.bg }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: S.navy }}>{ex.label}</span>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: S.green }}>{r.totalSDR.toLocaleString()} SDR</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: S.navy }}>= ${r.totalUSD.toLocaleString()} USD</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {r.bd.map((b, i) => <span key={i} style={{ padding: "3px 10px", borderRadius: 12, background: S.blueBg, fontSize: 11, color: S.navy, fontWeight: 500 }}>{b.tons.toLocaleString()} tons × {b.rate} SDR = {b.sub.toLocaleString()} SDR</span>)}
            </div>
          </div>;
        })}
      </div>
    </>}

    {tTab === "tariffs" && <>
      {/* Header + Circular Management */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: S.navy }}>Canal & Port Tariffs</div>
            <div style={{ fontSize: 11, color: S.textS, marginTop: 2 }}>Editable rates used by PDA auto-calculations. Update when SCA issues new circulars.</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setShowCirculars(!showCirculars)} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: showCirculars ? S.brand : "transparent", color: showCirculars ? "#fff" : S.brand }}>{showCirculars ? "Hide circulars" : "View circulars"} ({circulars.length})</button>
            <button onClick={() => { setAddingCircular(true); setShowCirculars(true); }} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: S.brand, color: "#fff" }}>+ Upload circular</button>
          </div>
        </div>

        {showCirculars && <>
          {addingCircular && <div style={{ background: S.bg, borderRadius: 6, padding: 12, marginBottom: 10, border: `1px dashed ${S.brand}40` }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Upload new circular</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Reference *</div><input value={newCirc.ref} onChange={e => setNewCirc(p => ({ ...p, ref: e.target.value }))} placeholder="SCA Circular 2/2026" style={{ width: "100%", ...inp, textAlign: "left", width: "100%" }} /></div>
              <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Issue date</div><input type="date" value={newCirc.date} onChange={e => setNewCirc(p => ({ ...p, date: e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left", width: "100%" }} /></div>
              <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Effective date</div><input type="date" value={newCirc.effectiveDate} onChange={e => setNewCirc(p => ({ ...p, effectiveDate: e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left", width: "100%" }} /></div>
              <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Type</div><SearchSelect value={newCirc.type} options={["SCA Toll Table", "Mooring & Lights", "Pilotage", "Port Clearance", "Sea Trial", "Environmental", "National Security", "General"]} placeholder="Select..." width="100%" onChange={v => setNewCirc(p => ({ ...p, type: v }))} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, marginBottom: 8 }}>
              <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Notes</div><input value={newCirc.notes} onChange={e => setNewCirc(p => ({ ...p, notes: e.target.value }))} placeholder="Description of what changed..." style={{ width: "100%", ...inp, textAlign: "left", width: "100%" }} /></div>
              <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Attach file (PDF / Image)</div>
                <div style={{ border: `1px dashed ${S.border}`, borderRadius: 4, padding: "6px 10px", textAlign: "center", cursor: "pointer", fontSize: 11, color: S.textH }} onClick={() => alert("File upload: In production, this opens a file picker for PDF or image. The file is stored in the document management system and linked to this circular.")}>
                  Click to upload PDF or image
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => { if (!newCirc.ref) return; setCirculars(p => [{ id: `cir${Date.now()}`, ...newCirc, status: "Active", hasFile: false, fileType: null }, ...p]); setNewCirc({ ref: "", date: "", effectiveDate: "", type: "SCA Toll Table", notes: "" }); setAddingCircular(false); }} disabled={!newCirc.ref} style={{ padding: "4px 14px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: newCirc.ref ? "pointer" : "default", border: "none", background: newCirc.ref ? S.brand : S.border, color: newCirc.ref ? "#fff" : S.textH }}>Save circular</button>
              <button onClick={() => setAddingCircular(false)} style={{ padding: "4px 14px", borderRadius: 4, fontSize: 11, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>Cancel</button>
            </div>
          </div>}

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ background: S.bg }}>
              {["Reference", "Issue date", "Effective", "Type", "Status", "Notes", "File", ""].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: 10, fontWeight: 500, color: S.textS, borderBottom: `1px solid ${S.border}` }}>{h}</th>)}
            </tr></thead>
            <tbody>{circulars.map((c, i) => <tr key={c.id} style={{ borderBottom: `1px solid ${S.borderL}` }}>
              <td style={{ padding: "5px 10px", fontWeight: 500, color: S.brand }}>{c.ref}</td>
              <td style={{ padding: "5px 10px" }}>{c.date}</td>
              <td style={{ padding: "5px 10px" }}>{c.effectiveDate}</td>
              <td style={{ padding: "5px 10px" }}><span style={{ padding: "2px 6px", borderRadius: 3, fontSize: 10, background: S.blueBg, color: S.blue }}>{c.type}</span></td>
              <td style={{ padding: "5px 10px" }}><span style={{ padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 500, background: c.status === "Active" ? S.greenBg : S.bg, color: c.status === "Active" ? S.green : S.textH }}>{c.status}</span></td>
              <td style={{ padding: "5px 10px", fontSize: 11, color: S.textS, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.notes}</td>
              <td style={{ padding: "5px 10px" }}>{c.hasFile ? <button onClick={() => alert("Opening " + c.ref + " (" + c.fileType.toUpperCase() + ").\n\nIn production, this opens the stored PDF/image in a viewer overlay or new tab.")} style={{ padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 500, cursor: "pointer", border: `1px solid ${c.fileType === "pdf" ? S.red : S.blue}`, background: "transparent", color: c.fileType === "pdf" ? S.red : S.blue }}>{c.fileType === "pdf" ? "View PDF" : "View image"}</button> : <span style={{ fontSize: 10, color: S.textH }}>No file</span>}</td>
              <td style={{ padding: "5px 10px" }}><button onClick={() => setCirculars(p => p.map((x, j) => j === i ? { ...x, status: x.status === "Active" ? "Superseded" : "Active" } : x))} style={{ fontSize: 10, color: S.textH, cursor: "pointer", border: "none", background: "none" }}>{c.status === "Active" ? "Archive" : "Reactivate"}</button></td>
            </tr>)}</tbody>
          </table>
        </>}

        {!showCirculars && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2, textTransform: "uppercase" }}>Active circular</div><div style={{ fontSize: 12, fontWeight: 500, color: S.brand }}>{circulars.find(c => c.status === "Active")?.ref || "—"}</div></div>
          <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2, textTransform: "uppercase" }}>Last updated</div><div style={{ fontSize: 12 }}>{tariffMeta.lastUpdated}</div></div>
          <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2, textTransform: "uppercase" }}>Updated by</div><div style={{ fontSize: 12 }}>{tariffMeta.updatedBy}</div></div>
        </div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* SC Transit Rates */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: S.navy, textTransform: "uppercase", marginBottom: 10 }}>SC transit rates (USD per ton) — documented exception</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Foreign vessel (USD/ton)</div><input type="number" step="0.01" value={scRates.foreign} onChange={e => setScRates(p => ({ ...p, foreign: parseFloat(e.target.value) || 0 }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Egyptian vessel (USD/ton)</div><input type="number" step="0.01" value={scRates.egyptian} onChange={e => setScRates(p => ({ ...p, egyptian: parseFloat(e.target.value) || 0 }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
          </div>
          <div style={{ fontSize: 10, color: S.textS, marginTop: 8, lineHeight: 1.5, background: S.goldBg, borderRadius: 4, padding: "6px 8px" }}><strong>Scope (audit B09):</strong> NOT used for &lt;300&nbsp;T canal dues. The authoritative small-vessel method is the SCA formula above — SCNT = (L×W×D)/2.82, dues = SCNT × 5 × SDR. This USD/ton card is kept only for the specific SCA cases that bill per ton.</div>
        </div>
        {/* Mooring & Lights */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: S.navy, textTransform: "uppercase" }}>Mooring & lights</div>
            <button onClick={() => setMooringTiers(p => [...p, { maxGT: 99999, rate: 0, label: "New tier" }])} style={{ padding: "2px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>+ Tier</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr 20px", gap: 6, fontSize: 10, color: S.textS, marginBottom: 4 }}><span>Max GT</span><span>Rate (USD)</span><span>Label</span><span></span></div>
          {mooringTiers.map((t, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr 20px", gap: 6, marginBottom: 4 }}>
            <input type="number" value={t.maxGT} onChange={e => setMooringTiers(p => p.map((x, j) => j === i ? { ...x, maxGT: +e.target.value } : x))} style={inp} />
            <input type="number" value={t.rate} onChange={e => setMooringTiers(p => p.map((x, j) => j === i ? { ...x, rate: +e.target.value } : x))} style={inp} />
            <input value={t.label} onChange={e => setMooringTiers(p => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} style={{ ...inp, textAlign: "left", width: "100%" }} />
            <button onClick={() => setMooringTiers(p => p.filter((_, j) => j !== i))} style={{ color: S.red, fontSize: 11, cursor: "pointer", border: "none", background: "none" }}>x</button>
          </div>)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Pilotage */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: S.navy, textTransform: "uppercase" }}>SCT pilotage</div>
            <button onClick={() => setPilotageBrackets(p => [...p, { maxGT: 99999, waiting: 0, shifting: 0, label: "New" }])} style={{ padding: "2px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>+ Bracket</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "70px 70px 70px 1fr 20px", gap: 6, fontSize: 10, color: S.textS, marginBottom: 4 }}><span>Max GT</span><span>Waiting</span><span>Shifting</span><span>Label</span><span></span></div>
          {pilotageBrackets.map((t, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 70px 70px 1fr 20px", gap: 6, marginBottom: 4 }}>
            <input type="number" value={t.maxGT} onChange={e => setPilotageBrackets(p => p.map((x, j) => j === i ? { ...x, maxGT: +e.target.value } : x))} style={inp} />
            <input type="number" value={t.waiting} onChange={e => setPilotageBrackets(p => p.map((x, j) => j === i ? { ...x, waiting: +e.target.value } : x))} style={inp} />
            <input type="number" value={t.shifting} onChange={e => setPilotageBrackets(p => p.map((x, j) => j === i ? { ...x, shifting: +e.target.value } : x))} style={inp} />
            <input value={t.label} onChange={e => setPilotageBrackets(p => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} style={{ ...inp, textAlign: "left", width: "100%" }} />
            <button onClick={() => setPilotageBrackets(p => p.filter((_, j) => j !== i))} style={{ color: S.red, fontSize: 11, cursor: "pointer", border: "none", background: "none" }}>x</button>
          </div>)}
        </div>
        {/* Port Clearance */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: S.navy, textTransform: "uppercase" }}>SCT port clearance</div>
            <button onClick={() => setPortClearanceTiers(p => [...p, { maxLOA: 99999, rate: 0, label: "New" }])} style={{ padding: "2px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.text }}>+ Tier</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr 20px", gap: 6, fontSize: 10, color: S.textS, marginBottom: 4 }}><span>Max LOA</span><span>Rate (USD)</span><span>Label</span><span></span></div>
          {portClearanceTiers.map((t, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr 20px", gap: 6, marginBottom: 4 }}>
            <input type="number" value={t.maxLOA} onChange={e => setPortClearanceTiers(p => p.map((x, j) => j === i ? { ...x, maxLOA: +e.target.value } : x))} style={inp} />
            <input type="number" value={t.rate} onChange={e => setPortClearanceTiers(p => p.map((x, j) => j === i ? { ...x, rate: +e.target.value } : x))} style={inp} />
            <input value={t.label} onChange={e => setPortClearanceTiers(p => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} style={{ ...inp, textAlign: "left", width: "100%" }} />
            <button onClick={() => setPortClearanceTiers(p => p.filter((_, j) => j !== i))} style={{ color: S.red, fontSize: 11, cursor: "pointer", border: "none", background: "none" }}>x</button>
          </div>)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {/* Fixed Rates */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: S.navy, textTransform: "uppercase", marginBottom: 10 }}>Fixed rates</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>ETR rate (USD)</div><input type="number" value={fixedRates.etrRate} onChange={e => setFixedRates(p => ({ ...p, etrRate: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>ETR exempt below (GT)</div><input type="number" value={fixedRates.etrExempt} onChange={e => setFixedRates(p => ({ ...p, etrExempt: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Environmental rate (USD/CBM)</div><input type="number" value={fixedRates.envRate} onChange={e => setFixedRates(p => ({ ...p, envRate: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Env. exempt below (GT)</div><input type="number" value={fixedRates.envExempt} onChange={e => setFixedRates(p => ({ ...p, envExempt: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Immigration rate (USD)</div><input type="number" value={fixedRates.immigrationRate} onChange={e => setFixedRates(p => ({ ...p, immigrationRate: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Immigration note</div><input value={fixedRates.immigrationNote} onChange={e => setFixedRates(p => ({ ...p, immigrationNote: e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>National security default (USD)</div><input type="number" value={fixedRates.nsDefault} onChange={e => setFixedRates(p => ({ ...p, nsDefault: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
            <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Sea trial exempt below (GT)</div><input type="number" value={fixedRates.seaTrialExempt} onChange={e => setFixedRates(p => ({ ...p, seaTrialExempt: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
          </div>
        </div>
        {/* National Security Tariff */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: S.navy, textTransform: "uppercase", marginBottom: 10 }}>National security tariff</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 20px", gap: 6, fontSize: 10, color: S.textS, marginBottom: 4 }}><span>Service</span><span>Rate (USD)</span><span></span></div>
          {nsTariff.map((t, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 20px", gap: 6, marginBottom: 4 }}>
            <input value={t.label} onChange={e => setNsTariff(p => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} style={{ ...inp, textAlign: "left", width: "100%" }} />
            <input type="number" value={t.rate} onChange={e => setNsTariff(p => p.map((x, j) => j === i ? { ...x, rate: +e.target.value } : x))} style={inp} />
            <button onClick={() => setNsTariff(p => p.filter((_, j) => j !== i))} style={{ color: S.red, fontSize: 11, cursor: "pointer", border: "none", background: "none" }}>x</button>
          </div>)}
        </div>
      </div>

      {/* Sea Trial */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: S.navy, textTransform: "uppercase", marginBottom: 10 }}>Sea trial charge (SCA Art. 103)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Rate (300{"\u2013"}900 GT)</div><input type="number" value={seaTrial.smallRate} onChange={e => setSeaTrial(p => ({ ...p, smallRate: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
          <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Rate (&gt;900 GT)</div><input type="number" value={seaTrial.largeRate} onChange={e => setSeaTrial(p => ({ ...p, largeRate: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
          <div><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Threshold GT</div><input type="number" value={seaTrial.thresholdGT} onChange={e => setSeaTrial(p => ({ ...p, thresholdGT: +e.target.value }))} style={{ width: "100%", ...inp, textAlign: "left" }} /></div>
        </div>
        <div style={{ fontSize: 10, color: S.textH, marginTop: 6 }}>SCA Art. 103, from 06/08/2015</div>
      </div>
    </>}
  </>;
};

// ACCESS CONTROL (Section 23)
const AccessView = () => {
  const [acTab, setAcTab] = useState("users");
  const [adding, setAdding] = useState(false);
  const [nu, setNu] = useState({ name: "", role: "Operations Manager", entity: "FMA", office: "HQ" });
  const ROLE_DEFS = [
    // Full = create/edit + delete + configuration. Write = create/edit only (no delete, no config). Audit B07/OQ6.
    { id: "r1", name: "Administrator", desc: "Full system access — all modules, all entities, all actions incl. delete, configuration and Access Control", level: "Full", color: S.red },
    { id: "r2", name: "Product Manager", desc: "Full access to all business modules (incl. delete/config) — Access Control itself is Administrator-only", level: "Full", color: S.navy },
    { id: "r3", name: "Operations Manager", desc: "Operations, PDA/FDA, transit, crew (create/edit + delete); finance read-only", level: "Write", color: S.brand },
    { id: "r4", name: "Operation Specialist", desc: "Day-to-day operations, PDA/FDA, transit, crew, visa (create/edit, no delete/config) — no finance config", level: "Write", color: S.blue },
    { id: "r5", name: "Finance Manager", desc: "Full finance access, read-only operations", level: "Write", color: S.green },
    { id: "r6", name: "Field Operator", desc: "Service log (write), visa stamps, crew changes — no finance", level: "Limited", color: S.orange },
    { id: "r7", name: "Ismailia Office", desc: "Transit ETA/ETD entry only — all other fields dimmed", level: "Restricted", color: S.purple },
    { id: "r8", name: "View Only", desc: "Read-only access — no create, edit, or delete", level: "Read", color: S.textH },
  ];
  const [users, setUsers] = useState([
    { id: "u1", name: "Sarah Ahmed Salaheldin", role: "Product Manager", entity: "All", office: "HQ", lastLogin: "2026-05-20 08:14", active: true },
    { id: "u2", name: "Amr Khaled", role: "Operations Manager", entity: "GRA", office: "HQ", lastLogin: "2026-05-19 17:22", active: true },
    { id: "u3", name: "Hanan Mostafa", role: "Finance Manager", entity: "All", office: "HQ", lastLogin: "2026-05-20 07:50", active: true },
    { id: "u4", name: "Mahmoud Saeed", role: "Operations Manager", entity: "FMA", office: "HQ", lastLogin: "2026-05-19 14:10", active: true },
    { id: "u5", name: "Menna Tarek", role: "Operation Specialist", entity: "CRA", office: "HQ", lastLogin: "2026-05-20 09:01", active: true },
    { id: "u6", name: "Ahmed Ismailia", role: "Ismailia Office", entity: "All", office: "Ismailia", lastLogin: "2026-05-20 06:30", active: true },
    { id: "u7", name: "Mohamed Ankeb", role: "Field Operator", entity: "FMA", office: "Port Said", lastLogin: "2026-05-19 12:45", active: true },
    { id: "u8", name: "Mohamed Gouda", role: "Field Operator", entity: "FMA", office: "Port Said", lastLogin: "2026-05-18 16:00", active: true },
    { id: "u9", name: "Khaled Sami", role: "Operations Manager", entity: "CRA", office: "Hurghada", lastLogin: "2026-05-20 07:15", active: true },
    { id: "u10", name: "Nour Hassan", role: "Field Operator", entity: "CRA", office: "Sharm El Sheikh", lastLogin: "2026-05-19 09:30", active: true },
    { id: "u11", name: "Omar Farouk", role: "Field Operator", entity: "FMA", office: "Alexandria", lastLogin: "2026-05-17 11:20", active: true },
    { id: "u12", name: "Yasser Medhat", role: "Field Operator", entity: "CRA", office: "Port Ghalib", lastLogin: "2026-05-18 08:45", active: true },
    { id: "u13", name: "Bahi Mohamed Naguib", role: "Operations Manager", entity: "All", office: "Cairo", lastLogin: "2026-05-20 10:00", active: true },
  ]);
  const PERM_LEVELS = ["Full", "Write", "Read", "None"];
  const [matrix, setMatrix] = useState([
    { module: "Dashboard", admin: "Full", prodMgr: "Full", opsMgr: "Read", opSpec: "Read", finMgr: "Read", fieldOp: "Read", ismailia: "None", viewOnly: "Read" },
    { module: "Operations", admin: "Full", prodMgr: "Full", opsMgr: "Full", opSpec: "Full", finMgr: "Read", fieldOp: "Read", ismailia: "None", viewOnly: "Read" },
    // Field Operators write the on-the-ground service log even though the rest of Operations is read-only for them (audit B07).
    { module: "Service Log", admin: "Full", prodMgr: "Full", opsMgr: "Full", opSpec: "Write", finMgr: "Read", fieldOp: "Write", ismailia: "None", viewOnly: "Read" },
    { module: "PDA / FDA", admin: "Full", prodMgr: "Full", opsMgr: "Full", opSpec: "Full", finMgr: "Read", fieldOp: "None", ismailia: "None", viewOnly: "Read" },
    { module: "Transit", admin: "Full", prodMgr: "Full", opsMgr: "Full", opSpec: "Full", finMgr: "Read", fieldOp: "Read", ismailia: "Write", viewOnly: "Read" },
    { module: "Crew Change", admin: "Full", prodMgr: "Full", opsMgr: "Full", opSpec: "Write", finMgr: "None", fieldOp: "Write", ismailia: "None", viewOnly: "Read" },
    { module: "Visa Inventory", admin: "Full", prodMgr: "Full", opsMgr: "Full", opSpec: "Write", finMgr: "None", fieldOp: "Write", ismailia: "None", viewOnly: "Read" },
    { module: "Supply Chain", admin: "Full", prodMgr: "Full", opsMgr: "Full", opSpec: "Write", finMgr: "Read", fieldOp: "Write", ismailia: "None", viewOnly: "Read" },
    { module: "Finance", admin: "Full", prodMgr: "Full", opsMgr: "Read", opSpec: "Read", finMgr: "Full", fieldOp: "None", ismailia: "None", viewOnly: "Read" },
    { module: "Yacht Directory", admin: "Full", prodMgr: "Full", opsMgr: "Write", opSpec: "Write", finMgr: "Read", fieldOp: "Read", ismailia: "None", viewOnly: "Read" },
    { module: "Tariffs", admin: "Full", prodMgr: "Full", opsMgr: "Read", opSpec: "Read", finMgr: "Full", fieldOp: "None", ismailia: "None", viewOnly: "Read" },
    // Access Control is Administrator-only (audit B07): PM keeps full business access but cannot grant/revoke permissions.
    { module: "Access Control", admin: "Full", prodMgr: "None", opsMgr: "None", opSpec: "None", finMgr: "None", fieldOp: "None", ismailia: "None", viewOnly: "None" },
  ]);
  const updUser = (id, field, val) => setUsers(p => p.map(u => u.id === id ? { ...u, [field]: val } : u));
  const addUser = () => { if (!nu.name) return; setUsers(p => [...p, { id: `u${Date.now()}`, ...nu, lastLogin: "—", active: true }]); setNu({ name: "", role: "Operations Manager", entity: "FMA", office: "HQ" }); setAdding(false); };
  const toggleActive = id => setUsers(p => p.map(u => u.id === id ? { ...u, active: !u.active } : u));
  const cyclePermission = (mIdx, roleKey) => {
    if (roleKey === "admin" || roleKey === "prodMgr") return;
    setMatrix(p => p.map((m, i) => {
      if (i !== mIdx) return m;
      const cur = m[roleKey]; const next = PERM_LEVELS[(PERM_LEVELS.indexOf(cur) + 1) % PERM_LEVELS.length];
      return { ...m, [roleKey]: next };
    }));
  };
  const permColor = v => v === "Full" ? S.green : v === "Write" ? S.brand : v === "Read" ? S.textS : S.red;
  const permBg = v => v === "Full" ? S.greenBg : v === "Write" ? S.blueBg : v === "Read" ? S.bg : S.redBg;
  const getRoleDef = name => ROLE_DEFS.find(r => r.name === name) || ROLE_DEFS[1];
  const sel = { border: `1px solid ${S.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11, background: S.surface };

  return <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
      <Tile title="Total users" value={users.length} icon={Users} accent={S.brand} />
      <Tile title="Roles defined" value={ROLE_DEFS.length} icon={Shield} accent={S.navy} />
      <Tile title="Active users" value={users.filter(u => u.active).length} icon={Activity} accent={S.green} />
      <Tile title="Online today" value={users.filter(u => u.lastLogin?.startsWith("2026-05-20")).length} icon={Globe} accent={S.blue} />
    </div>
    <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${S.border}`, marginBottom: 12 }}>
      {[["users", "Users & assignments"], ["roles", "Role definitions"], ["matrix", "Permission matrix"]].map(([k, l]) => (
        <button key={k} onClick={() => setAcTab(k)} style={{ padding: "8px 16px", fontSize: 12, cursor: "pointer", border: "none", background: "transparent", color: acTab === k ? S.brand : S.textS, fontWeight: acTab === k ? 500 : 400, borderBottom: `2px solid ${acTab === k ? S.brand : "transparent"}`, marginBottom: -1 }}>{l}</button>
      ))}
    </div>

    {acTab === "users" && <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button onClick={() => setAdding(!adding)} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: "pointer", border: `1px solid ${S.brand}`, background: adding ? "transparent" : S.brand, color: adding ? S.brand : "#fff" }}>{adding ? "Cancel" : "+ Add user"}</button>
      </div>
      {adding && <div style={{ background: S.surface, border: `1px solid ${S.brand}40`, borderRadius: 6, padding: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>New user</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 2 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Full name *</div><input value={nu.name} onChange={e => setNu({ ...nu, name: e.target.value })} style={{ width: "100%", ...sel }} /></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Role</div><SearchSelect value={nu.role} options={ROLE_DEFS.map(r => r.name)} placeholder="Select..." width="100%" onChange={v => setNu({ ...nu, role: v })} /></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Entity scope</div><select value={nu.entity} onChange={e => setNu({ ...nu, entity: e.target.value })} style={{ width: "100%", ...sel }}><option>All</option><option>FMA</option><option>GRA</option><option>CRA</option></select></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: S.textS, marginBottom: 2 }}>Office</div><SearchSelect value={nu.office} options={["HQ", "Port Said", "Ismailia", "Suez", "Hurghada", "Sharm El Sheikh", "Alexandria", "Port Ghalib", "Cairo"]} placeholder="Select..." width="100%" onChange={v => setNu({ ...nu, office: v })} /></div>
        </div>
        <button onClick={addUser} disabled={!nu.name} style={{ padding: "5px 16px", borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: nu.name ? "pointer" : "default", border: "none", background: nu.name ? S.brand : S.border, color: nu.name ? "#fff" : S.textH }}>Save user</button>
      </div>}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: S.bg }}>
            {["User", "Role", "Entity scope", "Office", "Last login", "Status", ""].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: 10, fontWeight: 500, color: S.textS, borderBottom: `1px solid ${S.border}` }}>{h}</th>)}
          </tr></thead>
          <tbody>{users.map(u => {
            const rd = getRoleDef(u.role);
            return <tr key={u.id} style={{ borderBottom: `1px solid ${S.borderL}`, opacity: u.active ? 1 : 0.5 }}>
              <td style={{ padding: "6px 10px", fontWeight: 500 }}>{u.name}</td>
              <td style={{ padding: "6px 10px" }}><select value={u.role} onChange={e => updUser(u.id, "role", e.target.value)} style={{ ...sel, color: rd.color, fontWeight: 500 }}>{ROLE_DEFS.map(r => <option key={r.id}>{r.name}</option>)}</select></td>
              <td style={{ padding: "6px 10px" }}><select value={u.entity} onChange={e => updUser(u.id, "entity", e.target.value)} style={sel}><option>All</option><option>FMA</option><option>GRA</option><option>CRA</option></select></td>
              <td style={{ padding: "6px 10px" }}><select value={u.office} onChange={e => updUser(u.id, "office", e.target.value)} style={sel}><option>HQ</option><option>Port Said</option><option>Ismailia</option><option>Suez</option><option>Hurghada</option><option>Sharm El Sheikh</option><option>Alexandria</option><option>Port Ghalib</option><option>Cairo</option></select></td>
              <td style={{ padding: "6px 10px", fontSize: 11, color: S.textS }}>{u.lastLogin}</td>
              <td style={{ padding: "6px 10px" }}><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500, background: u.active ? S.greenBg : S.redBg, color: u.active ? S.green : S.red }}>{u.active ? "Active" : "Disabled"}</span></td>
              <td style={{ padding: "6px 10px" }}><button onClick={() => toggleActive(u.id)} style={{ fontSize: 10, color: u.active ? S.red : S.green, cursor: "pointer", border: "none", background: "none" }}>{u.active ? "Disable" : "Enable"}</button></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </>}

    {acTab === "roles" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {ROLE_DEFS.map(r => (
        <div key={r.id} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, padding: 14, borderLeft: `3px solid ${r.color}`, borderRadius: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
            <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, background: `${r.color}18`, color: r.color, fontWeight: 500 }}>{r.level}</span>
          </div>
          <div style={{ fontSize: 11, color: S.textS, marginBottom: 6 }}>{r.desc}</div>
          <div style={{ fontSize: 10, color: S.textH }}>{users.filter(u => u.role === r.name && u.active).length} active user(s) assigned</div>
        </div>
      ))}
    </div>}

    {acTab === "matrix" && <>
      <div style={{ fontSize: 11, color: S.textS, marginBottom: 8 }}>Click any cell to cycle through: Full → Write → Read → None. Admin and Product Manager columns are locked.</div>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead><tr style={{ background: S.bg }}>
            <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: 500, fontSize: 10, color: S.textS, borderBottom: `1px solid ${S.border}` }}>Module</th>
            {[["admin", "Admin", S.red], ["prodMgr", "Prod Mgr", S.navy], ["opsMgr", "Ops Mgr", S.brand], ["opSpec", "Op Spec", S.blue], ["finMgr", "Finance", S.green], ["fieldOp", "Field Op", S.orange], ["ismailia", "Ismailia", S.purple], ["viewOnly", "View Only", S.textH]].map(([k, l, c]) => (
              <th key={k} style={{ textAlign: "center", padding: "6px 8px", fontWeight: 500, fontSize: 10, color: c, borderBottom: `1px solid ${S.border}` }}>{l}</th>
            ))}
          </tr></thead>
          <tbody>{matrix.map((m, mIdx) => (
            <tr key={mIdx} style={{ borderBottom: `1px solid ${S.borderL}` }}>
              <td style={{ padding: "6px 10px", fontWeight: 500 }}>{m.module}</td>
              {["admin", "prodMgr", "opsMgr", "opSpec", "finMgr", "fieldOp", "ismailia", "viewOnly"].map(role => (
                <td key={role} style={{ textAlign: "center", padding: "4px 6px", cursor: role === "admin" || role === "prodMgr" ? "default" : "pointer" }} onClick={() => cyclePermission(mIdx, role)}>
                  <span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 10, fontWeight: 500, background: permBg(m[role]), color: permColor(m[role]), userSelect: "none" }}>{m[role]}</span>
                </td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>}
    <InfoStrip type="info"><strong>SAP authorization model:</strong> Roles map to SAP authorization objects. Entity scope controls company code access (FMA/GRA/CRA). Module permissions map to transaction codes. In production, this integrates with SAP User Management Engine (UME).</InfoStrip>
  </>;
};

// MAIN APPLICATION
function FelixIQ({ currentUser, onSignOut }) {
  const [mod, setMod] = useState("dashboard");
  const [opIntent, setOpIntent] = useState(null);
  const [yachtIntent, setYachtIntent] = useState(null);
  const [ownerIntent, setOwnerIntent] = useState(null);
  const [companyIntent, setCompanyIntent] = useState(null);
  const [navStack, setNavStack] = useState([]); // breadcrumb stack of detail pages to return to: { mod, type, id }
  const goCreateOp = (yacht) => { setOpIntent(yacht && yacht.id ? { create: true, yacht } : "create"); setMod("operations"); };
  const [entity, setEntity] = useState("Felix Maritime Agency");
  const [showEntity, setShowEntity] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const user = currentUser || STAFF[0];
  // Yacht Directory — backed by Supabase. null = still loading (fall back to seed for instant paint).
  const [dbYachts, setDbYachts] = useState(null);
  const [dbPersons, setDbPersons] = useState(null);
  const [dbCompanies, setDbCompanies] = useState(null);
  const [dbOps, setDbOps] = useState(null);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    (async () => {
      try {
        let rows = await listYachts();
        if (rows.length === 0) { await saveYachts(YACHTS); rows = YACHTS; }   // one-time seed on first run
        if (active) setDbYachts(rows);
      } catch (e) { console.error("Yacht load/seed failed:", e.message); }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    (async () => {
      try {
        let rows = await listPersons();
        if (rows.length === 0) { await savePersons(PERSONS); rows = PERSONS; }   // one-time seed
        if (active) setDbPersons(rows);
      } catch (e) { console.error("Persons load/seed failed:", e.message); }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    (async () => {
      try {
        let rows = await listCompanies();
        if (rows.length === 0) { const real = [...BASE_COMPANIES, ...OWNER_COMPANIES]; await saveCompanies(real); rows = real; }  // seed real companies only (not the builder directory)
        if (active) setDbCompanies(rows);
      } catch (e) { console.error("Companies load/seed failed:", e.message); }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    (async () => {
      try {
        let rows = await listOperations();
        if (rows.length === 0) { await saveOperations(OPERATIONS); rows = OPERATIONS; }   // one-time seed
        if (active) setDbOps(rows);
      } catch (e) { console.error("Operations load/seed failed:", e.message); }
    })();
    return () => { active = false; };
  }, []);
  const [customYachts, setCustomYachts] = useState([]);
  const [yachtEdits, setYachtEdits] = useState({});
  const [customOwners, setCustomOwners] = useState([]);
  const [ownerEdits, setOwnerEdits] = useState({});
  const [customCompanies, setCustomCompanies] = useState([]);
  const [companyEdits, setCompanyEdits] = useState({});
  const [deletedCompanyIds, setDeletedCompanyIds] = useState([]);
  const [companyContacts, setCompanyContacts] = useState({});
  const [customPersons, setCustomPersons] = useState([]);
  const [personEdits, setPersonEdits] = useState({});
  const [deletedPersonIds, setDeletedPersonIds] = useState([]);
  const applyEdit = (y) => yachtEdits[y.id] ? { ...y, ...yachtEdits[y.id] } : y;
  const allYachts = dbYachts !== null ? dbYachts : [...YACHTS, ...customYachts].map(applyEdit);
  const applyCompanyEdit = (c) => companyEdits[c.id] ? { ...c, ...companyEdits[c.id] } : c;
  const allCompanies = dbCompanies !== null ? [...DIRECTORY_COMPANIES, ...dbCompanies] : [...COMPANIES, ...customCompanies].map(applyCompanyEdit).filter(c => !deletedCompanyIds.includes(c.id));
  const allPersons = dbPersons !== null ? dbPersons : [...PERSONS, ...customPersons].map(p => personEdits[p.id] ? { ...p, ...personEdits[p.id] } : p).filter(p => !deletedPersonIds.includes(p.id));
  const allOwners = [...allCompanies.filter(c => c.type === "Owner / Principal"), ...allPersons.filter(p => p.rank === "Owner").map(p => ({ ...p, name: p.fullName }))];
  const allOps = dbOps !== null ? dbOps : OPERATIONS;
  const allTags = [...new Set([...allCompanies, ...allYachts, ...allPersons].flatMap(x => x.tags || []))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const [activity, setActivity] = useState([]);
  const logActivity = (kind, action, entity, entityType) => setActivity(a => [{ id: "act" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), who: user.name, kind, action, entity: entity || "", entityType, suffix: "", ts: Date.now(), read: false }, ...a].slice(0, 200));
  const markActivityRead = () => setActivity(a => a.some(x => !x.read) ? a.map(x => x.read ? x : { ...x, read: true }) : a);
  const unreadActivity = activity.filter(a => !a.read).length;
  const addYacht = y => { const ny = { ...y, id: `y${Date.now()}` }; setDbYachts(p => [...(p || []), ny]); saveYacht(ny).catch(e => console.error("saveYacht:", e.message)); logActivity("add", "added vessel", ny.name, "yacht"); return ny; };
  // Operations persistence — create/update route through Supabase (optimistic + rollback on failure).
  const addOp = op => {
    setDbOps(p => [op, ...(p || [])]);
    saveOperation(op).catch(e => { console.error("saveOperation:", e.message); setDbOps(p => (p || []).filter(o => o.id !== op.id)); alert("Operation was NOT saved to the database — " + e.message + "\n\nIf this mentions a missing 'data' column, run supabase/migrations/2026-06-23_operations_data.sql in the Supabase SQL editor."); });
    logActivity("add", "created operation", op.opNumber || op.vesselName, "operation");
  };
  const updOp = (id, changes) => {
    const cur = (dbOps || []).find(o => o.id === id);
    setDbOps(p => (p || []).map(o => o.id === id ? { ...o, ...changes } : o));
    if (cur) saveOperation({ ...cur, ...changes }).catch(e => console.error("saveOperation:", e.message));
  };
  const importYachts = (list) => {
    const existing = dbYachts || [];
    const byKey = new Map();
    existing.forEach(y => { const k = (y.imo || y.name || "").toLowerCase().trim(); if (k) byKey.set(k, y); });
    const out = []; let added = 0, updated = 0;
    (list || []).forEach((y, i) => {
      const k = (y.imo || y.name || "").toLowerCase().trim();
      const match = k ? byKey.get(k) : null;
      if (match) { out.push({ ...match, ...y, id: match.id }); updated++; }       // update existing (merge filled-in fields)
      else { const ny = { ...y, id: `y${Date.now()}_${i}_${Math.floor(Math.random() * 1e6).toString(36)}` }; out.push(ny); if (k) byKey.set(k, ny); added++; }  // add new
    });
    if (out.length) {
      setDbYachts(p => { const m = new Map((p || []).map(y => [y.id, y])); out.forEach(y => m.set(y.id, y)); return [...m.values()]; });
      saveYachts(out).catch(e => console.error("saveYachts:", e.message));
    }
    logActivity("add", "imported", `${added} added, ${updated} updated`, "yacht");
    alert(`Import complete — ${added} added, ${updated} updated.`);
  };
  // Generic add-or-update merge by name key (mirrors importYachts). Returns merged rows + counts.
  const mergeImportRows = (list, existing, keyFn, idPrefix) => {
    const byKey = new Map();
    (existing || []).forEach(o => { const k = keyFn(o); if (k) byKey.set(k, o); });
    const out = []; let added = 0, updated = 0;
    (list || []).forEach((o, i) => {
      const k = keyFn(o);
      const match = k ? byKey.get(k) : null;
      if (match) { out.push({ ...match, ...o, id: match.id }); updated++; }
      else { const no = { ...o, id: `${idPrefix}${Date.now()}_${i}_${Math.floor(Math.random() * 1e6).toString(36)}` }; out.push(no); if (k) byKey.set(k, no); added++; }
    });
    return { out, added, updated };
  };
  const commitPersons = (out, kind) => {
    if (out.length) {
      setDbPersons(prev => { const m = new Map((prev || []).map(p => [p.id, p])); out.forEach(p => m.set(p.id, p)); return [...m.values()]; });
      savePersons(out).catch(e => console.error("savePersons:", e.message));
    }
  };
  const importPersons = (list) => {
    const { out, added, updated } = mergeImportRows(list, dbPersons, p => (p.fullName || "").toLowerCase().trim(), "p");
    commitPersons(out);
    logActivity("add", "imported", `${added} added, ${updated} updated`, "person");
    alert(`Import complete — ${added} added, ${updated} updated.`);
  };
  const importOwners = (list) => {
    const norm = (list || []).map(o => ({ ...o, rank: o.rank || "Owner", fullName: o.fullName || o.name }));
    const { out, added, updated } = mergeImportRows(norm, dbPersons, p => (p.fullName || "").toLowerCase().trim(), "o");
    commitPersons(out);
    logActivity("add", "imported", `${added} added, ${updated} updated`, "owner");
    alert(`Import complete — ${added} added, ${updated} updated.`);
  };
  const importCompanies = (list) => {
    const { out, added, updated } = mergeImportRows(list, dbCompanies, c => (c.name || "").toLowerCase().trim(), "c");
    if (out.length) {
      setDbCompanies(prev => { const m = new Map((prev || []).map(c => [c.id, c])); out.forEach(c => m.set(c.id, c)); return [...m.values()]; });
      saveCompanies(out).catch(e => console.error("saveCompanies:", e.message));
    }
    logActivity("add", "imported", `${added} added, ${updated} updated`, "company");
    alert(`Import complete — ${added} added, ${updated} updated.`);
  };
  const addOwner = o => { const np = { ...o, id: `o${Date.now()}`, rank: o.rank || "Owner", fullName: o.fullName || o.name }; setDbPersons(prev => [...(prev || []), np]); savePerson(np).catch(e => console.error("savePerson:", e.message)); logActivity("add", "added owner", np.fullName, "owner"); };
  const addCompany = c => { const nc = { ...c, id: `c${Date.now()}` }; setDbCompanies(p => [...(p || []), nc]); saveCompany(nc).catch(e => console.error("saveCompany:", e.message)); logActivity("add", "added company", nc.name, "company"); return nc; };
  const addPerson = p => { const np = { ...p, id: `p${Date.now()}` }; setDbPersons(prev => [...(prev || []), np]); savePerson(np).catch(e => console.error("savePerson:", e.message)); logActivity("add", "added person", np.fullName, "person"); };
  // Custom yachts mutate directly; seed yachts persist via the edits overlay.
  const updYacht = (id, changes) => {
    setDbYachts(p => (p || []).map(y => y.id === id ? { ...y, ...changes } : y));
    const cur = (dbYachts || []).find(y => y.id === id);
    if (cur) saveYacht({ ...cur, ...changes }).catch(e => console.error("saveYacht:", e.message));
    const _nm = (cur || {}).name || "vessel"; if ("tags" in changes) logActivity("tag", "updated tags on", _nm, "yacht"); else logActivity("edit", "updated vessel", _nm, "yacht");
  };
  const navToOp = (tab, opId) => { setOpIntent({ openOp: opId, tab: typeof tab === "string" ? tab : undefined }); setMod("operations"); };
  // Cross-module navigation. Pass `from` = { mod, type, id } of the page you're leaving so the
  // user can always return to it via the Back button (breadcrumb stack).
  const openYacht = (id, from) => { if (from) setNavStack(s => [...s, from]); setYachtIntent({ openYacht: id }); setMod("yachts"); };
  const openCompany = (id, from) => { if (from) setNavStack(s => [...s, from]); setCompanyIntent({ openCompany: id }); setMod("companies"); };
  const openOwner = (id, from) => { if (from) setNavStack(s => [...s, from]); setOwnerIntent({ openOwner: id }); setMod("owners"); };
  const goBack = () => {
    setNavStack(s => {
      const top = s[s.length - 1];
      if (!top) return s;
      if (top.type === "company") { setCompanyIntent({ openCompany: top.id }); setMod("companies"); }
      else if (top.type === "owner") { setOwnerIntent({ openOwner: top.id }); setMod("owners"); }
      else { setYachtIntent({ openYacht: top.id }); setMod("yachts"); }
      return s.slice(0, -1);
    });
  };
  const navDepth = navStack.length;
  const _backLoc = navStack[navStack.length - 1] || null;
  const backLabel = _backLoc
    ? (_backLoc.type === "company" ? (allCompanies.find(c => c.id === _backLoc.id) || {}).name
      : _backLoc.type === "owner" ? (allOwners.find(o => o.id === _backLoc.id) || {}).name
      : (allYachts.find(y => y.id === _backLoc.id) || {}).name) || "previous"
    : "";
  const updOwner = (id, changes) => {
    const ch = changes.name ? { ...changes, fullName: changes.name } : changes;
    if ((dbPersons || []).some(p => p.id === id)) {
      setDbPersons(prev => (prev || []).map(p => p.id === id ? { ...p, ...ch } : p));
      const cur = (dbPersons || []).find(p => p.id === id);
      if (cur) savePerson({ ...cur, ...ch }).catch(e => console.error("savePerson:", e.message));
    } else {
      setOwnerEdits(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...changes } }));
    }
  };
  const updCompany = (id, changes) => {
    if ((dbCompanies || []).some(c => c.id === id)) {
      setDbCompanies(p => (p || []).map(c => c.id === id ? { ...c, ...changes } : c));
      const cur = (dbCompanies || []).find(c => c.id === id);
      if (cur) saveCompany({ ...cur, ...changes }).catch(e => console.error("saveCompany:", e.message));
    } else { setCompanyEdits(p => ({ ...p, [id]: { ...(p[id] || {}), ...changes } })); }
    const _nm = (allCompanies.find(c => c.id === id) || {}).name || "company"; if ("tags" in changes) logActivity("tag", "updated tags on", _nm, "company"); else logActivity("edit", "updated company", _nm, "company");
  };
  const deleteCompany = (id) => {
    const _nm = (allCompanies.find(c => c.id === id) || {}).name || "company";
    if ((dbCompanies || []).some(c => c.id === id)) { setDbCompanies(p => (p || []).filter(c => c.id !== id)); deleteCompanyRow(id).catch(e => console.error("deleteCompany:", e.message)); }
    else setDeletedCompanyIds(p => p.includes(id) ? p : [...p, id]);
    setCompanyContacts(p => { const n = { ...p }; delete n[id]; return n; });
    logActivity("delete", "deleted company", _nm, "company");
  };
  const linkContact = (companyId, personId) => setCompanyContacts(p => { const cur = p[companyId] || []; return cur.includes(personId) ? p : { ...p, [companyId]: [...cur, personId] }; });
  const unlinkContact = (companyId, personId) => setCompanyContacts(p => ({ ...p, [companyId]: (p[companyId] || []).filter(x => x !== personId) }));
  const updPerson = (id, changes) => { setDbPersons(prev => (prev || []).map(p => p.id === id ? { ...p, ...changes } : p)); const cur = (dbPersons || []).find(p => p.id === id); if (cur) savePerson({ ...cur, ...changes }).catch(e => console.error("savePerson:", e.message)); const _nm = (cur || {}).fullName || "person"; if ("tags" in changes) logActivity("tag", "updated tags on", _nm, "person"); else logActivity("edit", "updated person", _nm, "person"); };
  const deletePerson = (id) => { const ownsY = (allYachts || []).filter(y => y.ownerId === id); if (ownsY.length) { alert("Cannot delete \u2014 this person owns " + ownsY.length + " vessel(s). Reassign ownership first."); return; } const _nm = (allPersons.find(p => p.id === id) || {}).fullName || "person"; setDbPersons(prev => (prev || []).filter(p => p.id !== id)); deletePersonRow(id).catch(e => console.error("deletePerson:", e.message)); logActivity("delete", "deleted person", _nm, "person"); };
  const current = MODULES.find(m => m.key === mod);
  const groups = { main: "Main", entities: "Entities", operations: "Operations", supply: "Supply Chain", finance: "Finance", settings: "Settings" };

  const render = () => {
    switch (mod) {
      case "dashboard": return <DashboardView setMod={setMod} onCreateOp={goCreateOp} allOps={allOps} user={user} openMyOps={() => { setOpIntent({ mineOnly: true }); setMod("operations"); }} />;
      case "operations": return <OperationsView activeEntity={entity} intent={opIntent} clearIntent={() => setOpIntent(null)} user={user} owners={allOwners} allOps={allOps} addOp={addOp} updOp={updOp} allYachts={allYachts} addYacht={addYacht} updYacht={updYacht} />;
      case "movements": return <MovementsView allYachts={allYachts} allOps={allOps} />;
      case "yachts": return <YachtsView allYachts={allYachts} allOwners={allOwners} allCompanies={allCompanies} allOps={allOps} addYacht={addYacht} addCompany={addCompany} importYachts={importYachts} updYacht={updYacht} nav={navToOp} intent={yachtIntent} clearIntent={() => setYachtIntent(null)} allTags={allTags} openCompany={openCompany} openOwner={openOwner} goBack={goBack} navDepth={navDepth} backLabel={backLabel} onCreateOp={goCreateOp} />;
      case "owners": return <OwnersView allOwners={allOwners} allYachts={allYachts} allOps={allOps} addOwner={addOwner} importOwners={importOwners} nav={navToOp} updOwner={updOwner} intent={ownerIntent} clearIntent={() => setOwnerIntent(null)} openYacht={openYacht} openCompany={openCompany} goBack={goBack} navDepth={navDepth} backLabel={backLabel} />;
      case "companies": return <CompaniesView allCompanies={allCompanies} addCompany={addCompany} importCompanies={importCompanies} updCompany={updCompany} deleteCompany={deleteCompany} allPersons={allPersons} allYachts={allYachts} allOps={allOps} companyContacts={companyContacts} linkContact={linkContact} unlinkContact={unlinkContact} openYacht={openYacht} allTags={allTags} nav={navToOp} intent={companyIntent} clearIntent={() => setCompanyIntent(null)} openOwner={openOwner} goBack={goBack} navDepth={navDepth} backLabel={backLabel} />;
      case "persons": return <PersonsView allPersons={allPersons} addPerson={addPerson} importPersons={importPersons} allCompanies={allCompanies} companyContacts={companyContacts} updPerson={updPerson} allTags={allTags} allYachts={allYachts} allOps={allOps} nav={navToOp} openYacht={openYacht} deletePerson={deletePerson} linkContact={linkContact} unlinkContact={unlinkContact} />;
      case "transit": return <TransitView />;
      case "crewchange": return <CrewChangeView />;
      case "visa": return <VisaView />;
      case "provisions": return <LogisticsView key="provisions" initialTab="provision" />;
      case "bunker": return <LogisticsView key="bunker" initialTab="bunker" />;
      case "logistics": return <LogisticsView key="logistics" initialTab="all" />;
      case "finance": return <FinanceView activeEntity={entity} allOps={allOps} />;
      case "tariffs": return <TariffView />;
      case "access": return <AccessView />;
      default: return <DashboardView setMod={setMod} onCreateOp={goCreateOp} allOps={allOps} user={user} openMyOps={() => { setOpIntent({ mineOnly: true }); setMod("operations"); }} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Mulish', 'Segoe UI', -apple-system, sans-serif", background: S.bg, minHeight: "100vh", color: S.text, display: "flex" }}>
      {/* ═══ SIDEBAR ═══ */}
      <div style={{ width: sideOpen ? 220 : 0, background: S.surface, borderRight: `1px solid ${S.border}`, display: "flex", flexDirection: "column", transition: "width 0.2s", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${S.borderL}`, display: "flex", alignItems: "center", gap: 8 }}>
          <img src={FELIX_LOGO} alt="Felix Maritime" style={{ width: 28, height: 28, borderRadius: 4, objectFit: "contain" }} />
          <div><div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>Felix iQ</div><div style={{ fontSize: 9, color: S.textH, letterSpacing: 1 }}>MARITIME ERP</div></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
          {Object.entries(groups).map(([gk, gl]) => {
            const items = MODULES.filter(m => m.group === gk);
            return (
              <div key={gk} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: S.textH, padding: "8px 8px 3px", letterSpacing: 0.5, textTransform: "uppercase" }}>{gl}</div>
                {items.map(m => {
                  const active = mod === m.key;
                  const Ic = m.icon;
                  return (
                    <button key={m.key} onClick={() => { setMod(m.key); setNavStack([]); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, border: "none", width: "100%", cursor: "pointer", background: active ? S.brandL : "transparent", color: active ? S.brand : S.textS, fontWeight: active ? 500 : 400, fontSize: 12, textAlign: "left", transition: "all 0.1s" }}
                      onMouseEnter={e => !active && (e.currentTarget.style.background = "#F2F2F2")}
                      onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}>
                      <Ic size={15} />{m.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${S.borderL}`, fontSize: 10, color: S.textH }}>
          <div>FMA-DEV-SPEC-2026-002</div>
          <div>v2.0 · {MODULES.length} modules</div>
        </div>
      </div>

      {/* ═══ MAIN AREA ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Shell Bar */}
        <div style={{ background: S.shell, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 42, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSideOpen(!sideOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", padding: 2 }}>{sideOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>
            <img src={FELIX_ICON_WHITE} alt="Felix" style={{ width: 26, height: 26, objectFit: "contain" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: -0.2 }}>Felix iQ</span>
            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", borderRadius: 4, padding: "4px 10px", width: 220 }}>
              <Search size={13} color="rgba(255,255,255,0.5)" /><span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Search operations, vessels, crew...</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} EET</span>
            <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
              {[["Felix Maritime Agency","FMA","#0070F2"],["German Agency","GRA","#0C447C"],["Cruising Agency","CRA","#1D9E75"]].map(([full,code,clr]) => (
                <button key={code} onClick={() => setEntity(full)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: entity === full ? 500 : 400, cursor: "pointer", border: "none", background: entity === full ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)", color: entity === full ? "#fff" : "rgba(255,255,255,0.5)", borderRadius: code === "FMA" ? "4px 0 0 4px" : code === "CRA" ? "0 4px 4px 0" : 0 }}>{code}</button>
              ))}
            </div>
            <ActivityBell items={activity} unread={unreadActivity} onOpen={markActivityRead} />
            <Settings size={16} color="rgba(255,255,255,0.7)" style={{ cursor: "pointer" }} />
            <div onClick={() => onSignOut && onSignOut()} title={"Sign out — " + (user?.name || "")} style={{ width: 28, height: 28, borderRadius: "50%", background: S.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#fff", cursor: "pointer" }}>{(user?.name || "?").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase()}</div>
          </div>
        </div>

        {/* Subheader */}
        <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: "8px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: S.textS, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: S.brand, cursor: "pointer" }} onClick={() => setMod("dashboard")}>Home</span>
              <ChevronRight size={10} /><span>{current?.label}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: S.text }}>{entity === "Felix Maritime Agency" ? "FMA" : entity === "German Agency" ? "GRA" : "CRA"} · {entity} — {current?.label?.toLowerCase()}</div>
          </div>
          <div style={{ fontSize: 11, color: S.textH, display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={12} />{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            <span style={{ margin: "0 4px", color: S.borderL }}>|</span>
            <Shield size={12} />{user.name} ({user.role})
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "14px 18px" }}>{render()}</div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${S.border}`, padding: "8px 18px", display: "flex", justifyContent: "space-between", fontSize: 10, color: S.textH }}>
          <span>Felix iQ · FMA-DEV-SPEC-2026-002 v2.0 · {MODULES.length} modules · 30 database tables · 80+ catalogued services</span>
          <span>Palace Tower 1, Palestine & El Salam St, Port Said · Est. 1983</span>
        </div>
      </div>
    </div>
  );
}

// ── Real login (Supabase Auth) ───────────────────────────────────────────────
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!supabase) { setErr("Backend not configured (missing .env)."); return; }
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pw });
    setBusy(false);
    if (error) setErr(error.message);
  };
  const inp = { width: "100%", border: `1px solid ${S.border}`, borderRadius: 6, padding: "10px 12px", fontSize: 14, boxSizing: "border-box", marginTop: 5, outline: "none" };
  const ready = email && pw && !busy;
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: S.bg, fontFamily: "'Mulish','Segoe UI',sans-serif" }}>
      <form onSubmit={submit} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: "32px 30px", width: 360, boxShadow: "0 10px 34px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <img src={FELIX_LOGO} alt="Felix Maritime" style={{ height: 56, marginBottom: 12 }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: S.navy }}>Felix iQ</div>
          <div style={{ fontSize: 11, color: S.textS, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Maritime ERP</div>
        </div>
        <label style={{ fontSize: 12, color: S.textS, fontWeight: 500 }}>Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} autoFocus autoComplete="username" />
        </label>
        <div style={{ height: 14 }} />
        <label style={{ fontSize: 12, color: S.textS, fontWeight: 500 }}>Password
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} style={inp} autoComplete="current-password" />
        </label>
        {err && <div style={{ marginTop: 14, fontSize: 12, color: S.red, background: S.redBg, borderRadius: 6, padding: "9px 11px" }}>{err}</div>}
        <button type="submit" disabled={!ready} style={{ width: "100%", marginTop: 20, padding: "11px", borderRadius: 6, border: "none", background: ready ? S.orange : S.border, color: ready ? "#fff" : S.textH, fontSize: 14, fontWeight: 600, cursor: ready ? "pointer" : "default" }}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!supabase) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s || null));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setProfile(null); return; }
    let active = true;
    supabase.from("staff").select("*").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => { if (active) setProfile(data); });
    return () => { active = false; };
  }, [session]);
  if (!supabase) return <FelixIQ currentUser={STAFF[0]} onSignOut={() => {}} />;  // no backend configured → run as local prototype
  if (session === undefined) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: S.textS, fontFamily: "'Mulish','Segoe UI',sans-serif" }}>Loading…</div>;
  }
  if (!session) return <LoginScreen />;
  const cu = profile
    ? { id: profile.legacy_id || profile.id, authId: profile.id, name: profile.name, role: profile.role, office: profile.office }
    : { id: session.user.id, authId: session.user.id, name: session.user.email, role: "Standard", office: "HQ" };
  return <FelixIQ currentUser={cu} onSignOut={() => supabase.auth.signOut()} />;
}

