// ==UserScript==
// @name         Twill
// @namespace    fallowe.wolvden
// @version      0.35.1
// @description  Twill reads the page you already have open, lets you expand on details you would otherwise need a separate document for, and gives you space to grow your pack in a lore rich environment. It never plays the game for you.
// @author       Fallowe (Society of Fur)
// @homepage     https://discord.gg/ZQDz8ANTUR
// @homepageURL  https://trashgremlinx.github.io/Twill/
// @downloadURL  https://trashgremlinx.github.io/Twill/twill.user.js
// @updateURL    https://trashgremlinx.github.io/Twill/twill.user.js
// @match        https://www.wolvden.com/*
// @match        https://wolvden.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*
  Twill is one script holding a small core (storage, themes, the hub) and a set of
  modules that register with it. Every module stays inside Wolvden's rules: it reads
  the page and changes how it looks, and never clicks, submits, fetches, or reloads.

  It reads the Wolvden page you already have open and tells you more about it: what
  each gene is and where it came from, what the den needs today, what a pairing
  would give you, and what you have already collected.

  Open the hub with the corner button or Alt+K.

  Note on the storage prefix: everything is kept under `denkit:` in localStorage,
  which was this script's old name. It stays that way on purpose. Renaming the keys
  would orphan every note, lore field, pedigree, goal and collection entry anyone
  had already saved, and nobody ever sees a localStorage key.
*/

(function () {
  'use strict';

  // ============================================================== the SoF mark

  /* The Society of Fur logo, with a transparent background, at 192px and cut to
     16 colours so it costs under 4KB. It is a two-tone mark: one half solid,
     one half outline. That means half of it disappears on any panel it happens
     to match, so it is drawn on its own cream chip rather than straight onto
     the theme. (The Twill stag is the opposite: it sits on nothing.) */
  const SOF_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADABAMAAACg8nE0AAABcmlDQ1BJQ0MgUHJvZmlsZQAAeJyVkL9LAgEUxz+nmVGGRQ0NDUdUk4YWSC0NSllgDWqg1qLnnQb+OO6UkNagVSiIWvo11F9Qa9AcBEURRHM0FrWUXFwGSuDQW96H7+P7eO8LlmhOyuttHsgXSlo46Bdj8YRof6EdGzZ66UpKuroQmY3Ssj7uEMx+4zZ38b/qSsu6BEIHMC2pWgmEOSC0VlJN3gb6pWwyDcIp4NJi8QQIt6aeqvOzyZk6f5msRcMBsPQAYqaJU00sZbU8WDzAcD5Xln7vMT9xyIWlCDAEDKITJogfkXlmCODDyxQ+fLgZZwwvtPB7fvyLFBGRKKJSQWOVDFlKuBApoyMjoqAhI5OjYub/N1ddmRivb3f4wfZkGG8jYN+CWtUwPg8No3YE1ke4KDT8xQOYfAdrtaEN74NzA84uG1pqB843YeBBTWrJH8kKWBQFXk+gOw5919C5XM/sd87xPUTXIXQFu3swqoBz5Rv9qGe2Vji6UAAAADBQTFRFAAAAAQEB/f39Wq8jaGhoXl5en5+fICAg+vr6HBwcTk5Onp6eMF0TZMAnTU1N////lQPr9QAAABB0Uk5TAP7+/xP+/qAHZF8X//+NWlHQOTcAAAyvSURBVHja7VxtbBvlHf85fuz4JRm+DVSYhBQyTUIqUiwBXQaechFla6cinGkbL5pEpKKWZkxytQ+Fjg1LpSp0BbwhwTZNw4xqQFut5uUDtGg8jEwrqAwjXtQxrfKktU1Jhw0ljuOc7X2497vn5S5xv3Ff8pzv7vnf//31AnxxrOIg6oYLu/8FxyAdAoMHV4LBdkX5TcBXOaPcG3r/xHZFURQ1yJskfqUoymUh91f3KIqiKF8Ncu/ziqIoSol5bYD3EP0YALBYDoDBNABgD/NihPfUl6L632hDkyKgA8AdpRAYqI8Zi86hooRXCWqsnguDARk2V3eUJAgMpsxVPTiAYsTaNvmxmEZqpGoue43AJKIj1nLxkIREVRuX4Pbg2Lv2uiYG8Fd723ZgJhMn5R4QA3gGANbr60JQALlxx0lUDKAGkKm3L+HJEYfJ2536NQYqMENxYIoC0XNsOWJjkHDpb1awP9GACAXQUQGgFBCAhVdEyQP7BQTKHQAyAID32QLBBnCPucjjb0BU4HooNd+mAwB+y8XmYGTOWJxFd7zWWTfCFdX0e1CM5YYTwOBCMAyyDi15X8QEoiFmrmeZmsACQNJlBy86wH4ujXLXIWeuO0wuswBoXcu43HA1oAo0gWZhWwqVxWWmHuzZa68nq70GVxPIYDySsc4mKgx7x+TBEec7ggiYoCEPAOeNW4FkEBKp0y4xEzBBuw4UwIRu0GMAukEA0KrrHUVMyMYAkIp1q1+MBkRCZLAug3aOvX+ynANwvZPLJTkAzY1mA9RWDM/RQhUgFdOrZBhixCLRL9wEA+EyoRTTEYjA4nI5gJg6JA9AbIjMI36WCUCJZIC69USv4ZdTphS5zpahAW1mCDmIPNCDaU8RY8gpC4BDSsn3jZ2zLAh7QYEGMOn4rRvAml5hi2n3zNnxy+bGa3j/o67/xjdjcfRaiH1i3t0COi0pBi53lsUHQAaIaiwKaUAWsSEOcTkAiGurN6BVQYG2qjIolAehsPdHxq8IfgCaC4CmelyEM/wDxfW2PzDktCYlkVsOKobf2T/rp1AMqKB3Q/1zgdMekOmZKQV+JuyFhiigHULPGSeWpVL0l4TzrLuxhmgT6Dx7pcdmv4mpWrcFANG4uVsTQEuGQYV9SqmXQqDQ1XYTn8KM4FdtMNwKgP2e39upGAgAMjlEXTfKeEA5quhlQgEaloEbh4+7n+hKmVxlvD6AdsXjCpCHCnLca8baAbNMZhjtflGKhh6ruDVNZq4TXnuoGEFz6pTbpseGUPeYdvQa3gjbhwGJ8gx418eCIOUSHwBtiXdry8WEMlRbwdxuTmaLAjEhaQgDCY2BP3RSTd7NeTVIC5BTDsjZXoGhsL93CZEuPz2ZtA3IX6JnKl/cvlQsQmUhEVlR3cyUu47mhFoVVFKEGCzxixLEYsr43TFdHmIyCQmhyehoxLRWGzKb9BQuF7602E7x7v36KQ3pa2/PrNd+mPiIAsAsqfaxdhmlSD16oqxXMX7wKgB0hvtZHL1q/Vd2WvntQXITDfRUCB5sfXink52Hr4E07AwHYMZzfrSu9hcD/3E4e4EB4DUfmTJyAPEwEI4yGDHSRwyAozIqRQRVykAHGfb6TInLlFXQfP6pEZbJTfS1j7HSNgeZ7GmU6XLiEgDBIMaGjgMXX0XNKg6fJgHiItYxqVvR9XVEjnuY7Mlj/S/ceqgoB2Do06tykvuZrFYCYCAQnWkZyWkkIwcwO8S9NCK1RaKO1Qujo6MVAMsqV3EL0jhDU/j7FwDgkTycybH76U/PStPYpGR/fBnAMscGaQNSw6BePsfZPz0LJB86giOpBlDbWGPe9EaGSjA4VhV0Ch75YOpkqTkAAC8KBVgAoMelUAHdfPoobkOqwrdy8pLadQK7WHthzdbRhVKzAAA9dWVRhcCDdNMZACO34SB4ROoWi2IAJFXmbX8kVXp+GsAfF3CLLjGMd7noQYlHU7dP8wCM4uQokrU1ODmKk4ZN9d00/E9JQYrWBPRMl5MfLJRSld9Z5Tzfcf4eCYkSfFOaem5xegHIN4VO79mEEAARRBnvnQKA9EgKKUEJbXCXEIC2QxCA5AFgDZr5LQIMrl4QAlADhMzP8QsnADlcEAKgwjgqWT4I4NSAmeoy/PeytxsYCeWQdfkcRbfGE9PoOU8DeiBULJzCWuAFKxXO8bunnB3Vn4sBfIjI6GjGKgZUmaFou8AHQCVTDt1UE5jGbrsWzqp0PFVi8YBoAPbukUhQ+oomyp/k9ZMplsiNUSB+1i4fuzrTX5uRymh6DR7Jg8dis6+fOGMJfMR8/fQfPtkZLjydovzCw+Z9Zg3cwOCBywthw19eXDFRAYA71LwDA4KflEPH14q4dhLfdbpoYzBZDb0//xG9+Q4M/zpviel06P1j/FfqGMQ5f+dqksAhwbXXDQhxYgVen86FJZDwgf9s+hAAep9bPAiZWXIlyM3owTmLRCEzNSLbXw/erlQtANeWQgG4KVB+EqXUVrTUYIj9pRmKnqbpbXRDipohBJVkJDkSaQDAZr1lYorp4ysm0FpfaLEWABL7VJc1TWzjGgsyhXnKVWEy76WYbozGZjW3ueZygQy7pm68EjpR8fyiW4onbvV6tOY6EUUutk43wVvZdgeQ5BwAzNyq+lzmK2xRjVFYwz0wRn08KVjDx4DNu60AywagzjAlKef27xnGZWdO1KMANu8jlOUymWxQTF4yVUD/2cGFMQrM7HZ0dJ3WtFngl3s0c97IfegTD8vXOIPJx3Y7a+ROAGSPtOTm5UDFW7lTAY3w4iLhRKDK0Fpyzly9pto82nEfN/C6P6RXWOsvv8wC7RYDQEIFQD4GP2umDBxtglll/o4KPKk6MhOjlKDV8MvYdxnWopu0pkwAYMmVIA01/bXNuRY6n/207MUgfeCJ038vC8rpUVYZoHOx3/5FVGDxtxUACVtKEk/OyIz/RIVp6vSfXdoRPQcgfu/Ra4s2gO+8Ja3s1tmFXl3RFAZQxO98uGWQSL1dICl6Oj/hPrWvZvxh/Ov6n/bTmknbmjBqqW2sIfoP6/S/bnsSaQE3e5L3YZ33g3WLyeKyyeHz9XOOd/YMUeRBvFG2pvP+M0uKyC6xPrml31NMm/WVfs3g8S4LgKaFilpecyHcsQyg7Rb0qbIHHcYsmVh5y+C8cUbqw06bjcQZh6Ithgqv3ZJkbtuz5myiFAB2uKKK1aBgRVuGEuq6sbmkOU3FYiguaKIWnb5/cp/mNtebQ9lpVkXDsCU3zAPAti0+l7jurRAAaIbV+skAmDgEAB9d4nM45JV1q+vb5ACq26H4tmcuIQyfm3h052q4XEds6H+N9MMDWze87JwTizhqUalyHSfKK8thew1M/vtde6SAW9b0FowencwGyvLrwEXTCbxMvVWziHcAzu1RUqfSW8oBAExUEDl5aQvi0rIGAG+6Lu/GwuMBeji9CtC89J5gvUzXXP1ii11lc4eQZB7oFVAMJHDFQffEKsYj0jrD9RWgdFcrYDfWRfR3RthJtBuDOpA4UyyyKxf+wuQ7Dh/bOgZEGEF3xGkco03gZy/ToP0DsuQwfPuJ9aEQf/ggByQKwRsUGra5EWxlJZNsFWBHqKGB5p+sZfuQI6tZrzJFIypCgD29v7Hkim/N4tjb7yrGhO63PN7hljA9fbckJU9bYqTrOBkDhqm7kMmZaRZ9xWKna2Oghj/lFNHIvPBzKc6HPjYb/jUrGYRaRrwUejJEw0bT/2j3mZ8VZXi51RJWMnpi5uXthtYRBjUVtg2S1/NnDAgH0BJtEEW8sDIAC1v1N1tUVXEIs7TS6ZzWTh2HE7Qg6ONnxRQS1k0NHAZE31qBorDy+aLxHesALHJbTgCiSKxigOlY65VnpxEXVZ5zIjMh/C7TjGXST7dv1T+8ZFZj68xPGYOPslCVfs80zj3m4wmsCgO9OWhYO4VVyu81VjtERq2bsiwtaKwaA9u2Miq+Y8kD2uoBkME4t6tyUtZeDdKg0BameTM5alHtyzClQf2e93V7f/5c68ukoOlAX/S8bzZdRF8AfJszoklxH/ohRc6KqnPOVK4FQTFoOudM7fVVqPZrWpPp1seod95q5QBOcxq78oGzYDywVM1WN7KWAqKIKxQG2kLJE1lH5ymADukXiYhjVuMlgIzpNbAfafJh6mAAup1tlsB0W62mWaXjf5UbdlqzyOotJGe1PjEZAJ7yRw/3B2ijR1ZRn9h1N/o5Fq15/uXFtm/cDfT3X4iktivWseZgQP4FHyHukqX3vnljFQDiW+I3/5h0u0Df/w1K4iWVrD9avGD/E0UNP4ocCQchkdNmVcYk7hfHKo7/A7C4gJd3wpDnAAAAAElFTkSuQmCC';
  const TWILL_MARK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAADACAMAAABSzFMBAAABcmlDQ1BJQ0MgUHJvZmlsZQAAeJyVkL9LAgEUxz+nRb+MghqCGo6wJg0tOGppMMoCa1ADtRY97zTw9Li7iGgNWoOCqKVfQ/0FtQbNQVAUQTRHY1FLxcWpoAQNveV9+D6+j/e+4IoXZM1sCIBWtIxoOCQmkimx6YUWevEQRErLpj4bm4rzZ33cITj9xu/s4n/VllVMGYRmYFzWDQuEaSCyYukObwPdcj6dBeEU8BmJZAqEW0fPVPjZ4VyFvxw24tEJcHUCYq6OM3Us5w0NXAHAqxWW5eo9zicepTgfA/qBPkyihAkhMsMkE0gEGUNCws8wQwThD3+g7J+jhIhMCZ1VDJbIkcfCh8gyJgoiKgYKCgVWnfx/52qqI8OV7Z4QND7Z9tsANG3B96Ztfx7a9vcRuB/holjzlw5g9B3cmzXNuw8d63B2WdMyO3C+AT0PetpIlyU34FJVeD2B9iR0XUPrQiWz6pzje4ivQeQKdvdgUIWOxR/pKmghzuDsggAAAGBQTFRFAAAAZEYmp4FYZ1gW034kY0UlY0UlcScgpnBaoXxV2oIm/wAAb25s3nsf//8Ap45YpX5WtW4npX5WpYBWpYBW0n0k034k5JMb////66Ra1YAkt5yCfWBCdAB0/39/AHEAfarN9wAAACB0Uk5TAP38EvqgXwYR9fwBAhsBGV4DnWWdY6ESAQOn//8CAgILmk+qAAALDklEQVR42u1ci5ajKBClU+FhfMW8u2dm5///ckHRAKJCoenes2H69Mm0CV6q6tYLDCHv8R7v8R7v8R5rjbyq8okref4WT/ioiLhkl7PwXRPn06UWPwBkQeqdGichuHtFtFcuPwGmOEkk2W53JI2DsoMvF/AD9F0riK0wbaLURGQa5g8Q5rkFkikshYNy93NQnnostY0SyPF55bsHXCZk2SiU2Q9BKXool5o8HJRZdyn7ASh7ilwqSSXzwk9Cqd1NJv2NTRLxk+yy7s3yaKPMa3LRILPmVV6R2EY3YBkEJtVaO5Gn59WlWNvKmuYfL0gBE/BPT6dY2ArvQ8/usrLIROfoPFnDxR+NC9Gb5cUxS+WINLHOa+tVnI+OTJSuu1AtxjoHUvcUP5PPUXzPNiBPTupTd7/Cl9tkR4+MtcJbn16OPpT1FlutaZTS3DN1w9yR5lGnNi5XH8XgLU8PVwNa4dJFiQ3yBiVMe97PkyaBi9IIgkdHAXkvymykm0SrvAz54KfPcTsOseVOb3uZGC85G3y62AKlS1fhdTUqNzsPQZxMZMCS/OJRrYnyNMhS+CxhJMkhhmfuNfF0ox4VpFH8OOH6tIxdURbVNEGOg1WeapFvgvJEamvinlP23XhvCVnmGIORpSsNiE3SG0UFYej17OXH0yHKZeW2usVlADl2XysktDq9qYapq+Yz8xSC8g1i4IeUV23Cry6mKPOtSpinw3wIL3eaypCk5EdtqdsAeV417JjhQmbYddFlRlD0mZkZ5v6Rgjw+kZxA+EFma2dDXeqg5aNmL6DLjnqyPmOLAnu87AanndWiMPKVIf3oSqGt2hSml1Z/yNofU6dHQ6VOxvOcoQPJNygOehtUwM6iNg3sKOSoRV2fLYgaZV5BUdTdB7J+CptU60WfvI/LT62Zr06DkjMT5uki/8kf473tOsUWkrSrgLSRqbbRBvQ2XHg2dessm0Dkir1lG9muC9w8TmsIUhZJsGGrOrc8YS/CbEKMY3zt22SCQZoX9AGyBFHKpjBZO8PwSJM86uOTzoM8PXZquh0d7dv+evXSjYmi9ZC19JRHOc5qyN/ylfqtfp27vx+7cRYvbadWoimEgIZDNPsEVoPriv9BpHgLJd9+NHoAiAptZTpBCB5twPgLjFqDdQPU8H0gkQr38l5GwJQQOFD6MTsYqPfJhUjU3NtYitsfLK/7w/6rJGUeuix574/loWCy9pVEmoizbK6H/X5/OFwDvSwnEIKxhUmeok2CWZHyoFC2MIOUXoSC/KBAjP8kmWZza0FKmPsg2+Rai2HCdESL17gGKWFen/xoymnqhKNkxBQ7TSD47YnyUA7V3zqypBZKCRqwKPcDSinMNrhKrGVZroIS7PcCIEGWJsq9MsyGlF/yZbMCSgnLsQDUuJOrhfIu3Se5HuTYl9OO6CPCMJn9XxTRG8MsFcpr+5dDR/gJJw/Bnki5H27zB6Xy0kLZsvyq3ed1EmWMMIGYMClOliX5slDeBjs9TOcfMTCpnIWly3Jvofwi18Mg1jl/1GZDH4HBfDARnF3meWmj3D8t4DqXc+a9iYLK3hZoDu2iuoiJDOJ7R+MapaL7bPLGufzRr9m8zts3enLOcIq7KAeznPRElleSt1YVBaez3gjSsuCG3B27HFB+lcGzSFHxeafZLqjAyrJ0ZXktD6PMIyzlXHBHCanlp6NxmWJeda65LyP7TLMUSqx6SkvjkjLaEam8I66sXGIQHuJV2p4dIR+3Q5/DlXGTwUI8B2wpIRHdrla2cSs1ymvzGTkdX0o7kFqXJnkwqSPBlR3Kw+0e3cWBgBiE2WxoiWPi7KO4os6drIwSF3fAcULaGOXf4vkdghIbHu8uyttdomxBlvGz8YCMOMcUE1bSptDlqja/lagebUAyh+JPXlpGeZCSJJ9l2cTb5KK/TKh0q47l/RgYg+t206AqCDA6v9+0JG9XfSYMSlwnEwJLSqTTLMvrtSTJgwWWlKihI8xn2STu9AZ34f6ijLP5bJoyedOPBdfna2w7AmoSToJ7hTEoQZUtsrCyR1uZ8HjfG9GTkQEoePrJ5kTbWSaReyORXQRYw9QZ46qSCVlxDlBIncSAlLKs1iFkJ1BYHHFOqAdZrGfrHdBF41aGTcNbW2rSKtyOItqkzq7T8/VH9GBxFp+Tj+8Y0b4SvgMlLbYJuysPiI67QL9D5ST2HMviVmL2e3WVI7KY+f54d4jhm1XeP2MwAvq7Q5f9+rXb/dqtrnLsYQEH5k6j20SW2C0+7goz20kpZh9kC7uUVST26PyYNVKCvyVEsgnLBaoS8Bb72QbaTuoQsv8Aysks+/dm4Qc2rP2+Lfx8E0r+Rvm/QvmfYA9uf5y/Nh2mHJluvA4lQ+/p8tdVQJBwvFHw15EbOP6E/IvoA5B0QjSmycMYRYsy8ZQojYnBWDPmr+mId5aF9gmyP5eGkoc65EK1DP+gdM7yl20vAL55Ixtonbvc2mUOB2YRwtQHHKl8jg7PIhaRKOQYYTJi7OviiAR/wnpGeue4QhDIOIUpZ8E+1MMi+icQL0z7RCvDmianEZ2JIlqYjLhKgQ0JpNs8PJZAjI/jQ45JhllENR2t8/FpPYaiUGDOrk+CRebO1DM58hBHEM+HggDiUK7SZK9kwzXsxsCreJisWKN/UClBhpkmxGdSozPryEKtM7Mg0+zL6agINLF+QDE8BOYggJjN5okVRdaTuqqgHKJazl3errb9YPZgsDTABjxZfuzRUR162LJ8jCeJ1IFkPlQzMJemg9eLxEWgJ72XGUQNAXQIVWWoDjBPf1LtNXdnnFkCyuIpCFgK6LYzBhiKV4BZlHpVNKVlxIx8HN3ngcUmtZMuMCzKRZ3PNfbYcivdMs1It26omS5EyukDDdWUMA2UtgwiW5lgq2FW4SI6r7K2JQCL0rYWOvuwwfDkRNA23BiM1e9JQDlrmfO7NRO5tE0ShtY4m3po1QWZY+onc2nW8xYpKOVxJ4bd3fZmArZdEorcRxs9vsbwR6RhAaUw3hGJ0rV1NgEScDWz8yQyEiW4iQqdTzOittsVSvCfC0tByb3soTxsSl9hwiduF4eSOXHaT9QGXTO7ppKOkk1lDcGnJvORzpkTVSkKJbWdDaTuH8JCLIAVUBb+CEmDz02OnKZrLTiUtrtpJoQZXqWMyifHMHuTiELJ3V0IMiHMHNtotK1loGeEEdmFtS4+aerONp355HDHGFM3F94HQb9pAvZ4Z9tOH8sai5KRP3q11CvMKrilM18tQixKYWqnrxfgr7cNECzMyjmN6ODRVyNQmlH7mfWANzGi2HP2DvP05CwmU/cuOfd69/DVcze15s7TGpHPacOkRiGFQNwJFkm7kGatQsHaiOEeqof3HG2d07StUpjJnX0nnMNPJtqWnYaSW30NV+WeEkhutIXC5DR9J2qMshCeL8diCd1wWOPbdJwExttcGtfYMURgK6ncQMnDvn0qXCrcTIhp0tdRAV24O7hUZ7iuCYcEs+SLNx8ZZ/jGsbmvmvDwnuGIILjiilAeh9TvqbFR0qiaHRA6h4SveWdBBYPNIVphAiVe5YO7XAphdhyKuSFgnoScQMkCjt9TnPeD5ENkAy+WjcZK4FlVxBcDFH+WiOo2EMTuZYTXLMPqsPlbH3rCDM0I+hTjR9ApR0FjVmk4Tr4BRRcmCPa4T5gMkyzgg6T62iuIaAKxeJrnfRxm+OiD9gqI7iM+SHLgmF3LKO/XJ/2JJ0U3tOU+xELCl5Dh5C8POLz0hq8b+Zbfpf4e77Ht+Bc3b4G45Fxf3wAAAABJRU5ErkJggg==';
  // The mark in its three colourways. Which one the corner button wears is a
  // setting, because the button sits on your den photo rather than on a panel
  // Twill controls, and no single colourway reads on every den.
  const TWILL_MARK_DARK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAADACAMAAABSzFMBAAABc2lDQ1BJQ0MgUHJvZmlsZQAAeJyVkM0rBAEYxn8zS+tjtcJBcZi0nNCiFheHla9aDrurLC67szO7amd3mhlJrspVUeLi68BfwFU5K0Wk5CxH4sI2GqN2U3vwXt5fz9vz9r4PiPGcrJlVQdDylhGdCEtziXnJ+0ItbTQhMZiUTX06Nh6nYn3cITj9psfZxf+qPq2YMgg1wIisGxYIk0BkxdId3gZa5GwyDcIp0G3MJeZBuHX0lMvPDmdc/nLYiEdHQWwEpEwZp8pYzhoaiEEgoOWW5d97nE98Sn42BnQA7ZhEmSCMxBRjjBKij2FChOihn176oII/+OOfoYCETAGdVQyWyJDFohuJZUwUJFQMFBRyrDr5/83VVAf63e2+MFQ/2fZbJ3i3oLhp25+Htl08As8jXORL/sIBDL2DZ7OkBfbBvw5nlyUttQPnG9D6oCeN5I/kAURVhdcTaEhA8zXULbiZ/c45vof4GkSuYHcPulTwL34D0zZoFw8tgzQAAABgUExURQAAAMOhfeLVyMqng9N+JPTw7cOhfcmiecOhfbSpb9uDJuDTxt6mmf//AP8AAPt8fOB6HLCuq+DTxn5+frl3d+bksNN+JPz8ftN+JOKRG7VvJn9/BNrJt8WigNSAJcWjgKDKrqcAAAAgdFJOUwD9+/37CaAeXgn8Yg4BAQIVBKECAwedAmEUAwL/Uqiqo1r2KAAADRNJREFUeNrtXQt3q6oSxhAEElGJWpN0d+///y/P4BMUFdCkvXeVtc463UljPuf5zTBYhH7X7/pdv+t3/a5jliCE+L7zu2yLoOvtdCPIIjRCbrfrDxHm9aTWFRVzjO07MvkBsjy1ixSm1GQHH95B5Nv1feuwXFGygPKK0m9HeRqwGBITaMB/+25hkkHhp5sJBd4ZUFYK8zeuYkR5naKUPwYlGYxvapcEVRrK7zXMSkcpl1B+f8jsoUC8KRds4YZ+TCA6kXrJr65vcnGC7F9EMjQKTC5b7LEoC1lJWz5GFVlAXy2YJbx3HW3h0BQpe8HNgiKwhoqsuvgscle300syJEjmer0mC6napjc5RO5TNWGW6eg8ZEZE9lIwa9xooSQW2a/48e0lZjmEjtkXVr3iVmN6av3Q0Sir4e4XUvXcXsmiwjX8h5qlFt/Mb6z7LyQrH7nO8J8WWMhe/ybjzacWD5lbHpFLbiw1UV5R9RIOZn6lRFZxGVq9VWThWioniTegHM3S1FxKqgV5EZLcXiNKlNb2vFuNZjlBOcaaWyXFguvcDs6OI3G4abdP+pcnYZQse7H+zomkL6OK2peSUZS65qQkS/KSulFej2bpumEOfZPhRfAPDXo1FjXGr7dvnU6n08uKXEs5OBJujfIQ+MkAqSHhegx6CbMkZEJwiFYH9lCEkhsxkWTDFRI0ASlf2KYY8szVRiYMjOBVmd6NuZmSfAVJ18IcdKGI/pUE7LL5z4CooBAVOklGZGV84GUgjZRhWTf7q/2awn9VdaPnjL3rVSC3hem+XtoaOgrmlRyavVf42y6MLwWJIPZV1/0YX97zb4L2LdSL2jZ6gd64pIqPzbq6rfd2rWqAlyQ0KctPT0XIQDGm6cExtctBw6oSWFItQgJpWtr3uD3KcrUoY7G+WLsSSmkyvWK2Vw6fKIeFUO78Cfh6+hVHsLC2ImPFtG0CUgBPaRMYdtUyKP97vpzvuStMwMhZNMc1rA51zKFMp1HzezHgLHeJMr9czufL5ePhCJOXaBGgATbmFLEOdwSYyz2i/ACQsADm89PJJpkTSFgMdSgboDzcSQV6nDuUlzty2CYQiMeOIHGsoQSYLHgX4tmLEmCeH/DPFkr+TBfTThK5ooyohhL+GdrtBZc59yhB561hps/V5EjdUTJAibV/k1CUdw3l5aEcWAWlHFw+3atxMMzUvCUWRihz9HcACTDvAOKJ0vvf9se9KJVh6r+s/h3iOyL/0FF+EEABL13gx+VI5IGSG/aBoyBK+dTNUvlPLtQrl9ZG0wUOzJw13sYiPKLkISp/TFEOL1z+PpbiRpHE2D0WcQ2mcvosRJZ3HeX5kn8qdbdiXeIf4OVMy+DrOCmiTZYcUPIwFz8bKHvZrqBs6RBwoCFrrwmz4jVYcndTEarDAtFlAeXHYyVTdDSW00Sxt7X4CQlHpV3J/jU8KSgSWVBeend/rvLcMuG8TyV0FSeFewJGlMEdkd35sUPZo16MlwbWouYlUCQjw1jSZIay9o748Sgfzv0trqfruWkmykIIT5LgBGmiPHdB/qKcJ/cp0FciPcT2ckc98Xw8TLsEbL3z3H1AAr9d0bnyIBoMUhGLp4nyoyObSpReNkTWiJJiluE9gkeeTXLPPe/jUEk9W0dryV15UNiiTdr5a7KN/NGJ8pH6Vc2ZYFu0I0yQYJKXhlecdRZ86WqLHHn2t9h2Qg9374vGgS8ArXntwxfkJsqGHR0RhBpRwmtQ8+begaPeQqlMU4Zp3ASpRAmMCEB+eqPkKN4kcbQs9tVlnTE2yO/5p3+/qUSbBB5MsyBBTEPznMtH9gCiDoEefXpfi6QOhSUOMs1cFTjDuvccKA/o3HH05YAyCkzk986DPj46apHmQd3FGrlUbPgrtHEJlfc9fyK0b0STSyeUgSko70SYP3fto1PHBhdmqU80SoVo+19pTp9PLvSecECDOnMs0QPrHks+DvhQ6Vqh+1W6wJs5NL+hsmJfbFxUpdqS+2/+JP+wcxfB9fIZZ9i64CIKaEm9cgTclk/jKHE19cUIrBrLjDaVjIPmoTaTpSoknTsyqlVYurP/lQv1QKXanuHdqutsWHXzihwiNI1dMeJ/TLhHYL6aJ5otBeagmKQx7Ni559revWsU4uWWHQ3BLzYXtF3+dT/Of3dT29yrHuerBZ+xZTP1rsjyknsvk/t4ZVq4O+WBCzPPDR+RxRh/A0rP3mUhWPRumEDWPatySOKUrRq+n9G5wfRuBAvedEqjuUQ7L1GTC3/w0SoPmBBB7d6seaU/Dbrmf6cTPtQscCzD+kRimi0bGZ7+9GgP1nlgH4ZPu1ADOvwKw2RpKMleCucv8fIwWSZWPqME+gcfH6rUpq4IsczPeBnlC1ZQH7NYoJov0jiwl5DOW+a+132UYZYhxf6bUUYhKNW+cPRelHUIyuR/BOXPt8tsowQ6FiJWJWT2s328qfkCN6bKN9UWUD+rkbwi8CAMw++ySFBd4IEJvrkBMtVacAaveSaCh6U9nFxlTRxM0/d0cROfohfmPUNh0l0zvdLdy9WgZ6AZq438XasmbiihNZFymCYJigmqFM+KXSpnbjb5pXbiufuE6CEbz5qfR27bCwVvCqUAYap954QxjsJPJaROtoajryYFk5BspSYior7fGDoc7PS9uMkdCqa3A4EeRIy7RM4RD9qmIOjLBSVOumrAW5gq73SfgfFwFiZOUlCnja9YfpIgYWImqDY22I4XhTAjF8ftB1lS7udAqr5lky2AkEzEiZMDxclQhmAvhU/2UrEyAR5gmW46p+3Z5KefztVgybRnBqFJ7m8XrTZQisJPmGzex1dxXrwqA9FxMhj7JB5me9X30HjKazfP7cuWxCMDQd1o412gmNTTKsFOhINpDruIJHWnpThOrSgj37nWuDmLwze1qGJKOk+rG00lthATPOtJJUW1gcA8trcFBE2t0bkGEw7MtPkxeBO6I0Vda37LJ1Q8ln1PsdskVafNEhbjNbNU/XvYHJxc3RMlxf0o+aZpGttfsK9LR6NZLR6bFMd2oWS4V+dmHNSuLBqEBUwtyIImiyS13T4peFlOm6Wxz8OdBkcwTzYtaTzRh0qyvnhd5vDjJo8wxzv8ekai11ZzlGlV5yvDIYtTEVgrJmq9avKbyBQ992v8fFXnOJLLBeuCzrHR8GehKLXLY5a1rhQ0G2JPXlhL2EY54oVSH0Ld9HO6kRxsn9FlqedhQEk92gbMNPVlRry+qUSsyQuMRMvXUlMVBNIkbLwTx0QsCnOLxsBQDLbKX5fleHVAyT32+AyUycoY8saWErETFoNIant1XihloZ9eA/6y5OZgDSKgS48NlOV4dTUzKpxpmx5BmhBsDSnqkMFmX8LWwDNRoqKOcQh10+8fgluW2dkgchg9TvlcD5MBAz6oXM0XuVa8fH6Q1qJxdcXS6bw83RiDKAapqC8rQgoecHHtZkOGbMhMEdNhjYoMKN1labq4Oodjc1RMOXGckaWzonZBLD52qbOEhrvZt/WZSF1ZweTzLQu2HJn2OGdqHAZXMyr24dnpV3mMCFs6rN4o0ST/y6URX+raHp036ifJIBVxhxImxALGB2FEJUFP626aOgPhHjXwZL6gtlQwCmUWMAPTctzSSjcmLH3VMqnpf0pDlmrQJ0Nyk0rxxR1UuIXE8RDI5AI4KomNiXrMHRiMqBOXfeQEe8xwm/XNtD1Q9EWr6wUFKmM8c8bUpnSvs05lhNcYfhMG3PllofO90X6stglNmoy43jw17y+zHBUAlDRg1oCRT41gzab5MXbPFUaiVFooJ4ar2jfOdY82XaKCrNDe4LOZXI+WIzxeyeSDfD5EntCAMTdQQGoeY583cN23j41zuzjOdj23Tcs0lkHTebuCusIUxOQHs4+JVKTuHYMRJbUMweEpv5GuIS6Teupl+471CJ3fzyU9ZXEeQVMaD7DgO848ixEGZsTmXBMfUjuKJOAU9K6T2XpHxErvYVfG9CEVPlztSd/WixE6AKXaFxP2Z+BNYPocM9ASZRI+XVIMDZE1+55wB+569DQl4/FDq0G5F+N4M0lTZMxqYPdHDNV6iwDteLDX0AbmdG1I03B16iGFMeTumdzoUa5Wsmrowqg73B/JMMaQeMefSOgb/3I1UkzSpbvOR6oK9iyCTbMrlLboCfjnl/6QIe6Tz8O2yvQ8FmPH+r3QUwlz1964txDzUJUnHUqH2zR6epQ4tx4zHmEry3Rfsr0CI9JtHhv7n/0nPW/36qNPAnZ/BNCJjPJoDK+JTzjq+VuYZTb9eufQMu4GQSoh7s8V7cIRZoGPJ2qfZ8XcSXP/hR41EEz1tjcX/JQViINwTJT7D8tgn0fxlV0KwjQwGBX+Q6VtWIh9jtwmbT0dPnabcL9T7bKv4KnnvJIyrfhtfyqs7joT1I/WNEf/OULv+xNrlH4xmr3UsvYvEfqXNsmb/zac+N6/Rfe7/q/Wf9H4pEkhY6pRAAAAAElFTkSuQmCC';
  const TWILL_MARK_FULL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKUAAADACAMAAABSzFMBAAABc2lDQ1BJQ0MgUHJvZmlsZQAAeJyVkM0rBAEYxn8zS+tjtcJBcZi0nNCiFheHla9aDrurLC67szO7amd3mhlJrspVUeLi68BfwFU5K0Wk5CxH4sI2GqN2U3vwXt5fz9vz9r4PiPGcrJlVQdDylhGdCEtziXnJ+0ItbTQhMZiUTX06Nh6nYn3cITj9psfZxf+qPq2YMgg1wIisGxYIk0BkxdId3gZa5GwyDcIp0G3MJeZBuHX0lMvPDmdc/nLYiEdHQWwEpEwZp8pYzhoaiEEgoOWW5d97nE98Sn42BnQA7ZhEmSCMxBRjjBKij2FChOihn176oII/+OOfoYCETAGdVQyWyJDFohuJZUwUJFQMFBRyrDr5/83VVAf63e2+MFQ/2fZbJ3i3oLhp25+Htl08As8jXORL/sIBDL2DZ7OkBfbBvw5nlyUttQPnG9D6oCeN5I/kAURVhdcTaEhA8zXULbiZ/c45vof4GkSuYHcPulTwL34D0zZoFw8tgzQAAABgUExURQEAAD4yJdG8pUE0J9N+JNnDqz4yJT4yJVkdFtqDJtm0ptG8pV9fAf7+/tG8pd58IWZlZUAyJba0rtTPov8AAI1zVtN+JNJ9JP//AEAyJVhINbFnGbS0ddyNIv9/f///f10KShEAAAAgdFJOUwD9+/37/Z9eEfsYYAMBoRYCWAUOAf+dYQGn/wQEFgICn6gnOAAAC2JJREFUeNrtXGmXoygURamAcV/SlaSy9P//lw3iAojKA5KuD3lnzsxUTPR63/5AEfrIRz7ykY98JJCciqJYObR+5CMG+YuyMi5TZCDtmZZlZjzybilQdmASZ6jVjrRtyT5nR/6/1guUxlwOcaqBaVHGPuXyG9gsBRRGZqd83jGSxQ2U/1/j6YDykKFUQzkeKf8/lULhPWMqynRGWf8elL+Yy5OMUrHLS/F7ULI4NKCMNS4LCeX/D0QjFIZSD1G/EWWKatV50njy/neBWZEaxYc1Fx/CZXiUxT29FyYfabtVF59QdovMOaAMnHvuAz/LLIjKrDX8oC0k5+nU33RjUgqcIZ+ozbKsM4Dk9URmuFQrmeWpVk0hHaksu7BcZtzKys6YBA/xkuS6SNfMEtWTwoOGywvq+kuyC97Vz9PRifXLdVK0LJ6aJcdrSSlIUDnE3aVQUR7MKE+pHId0Galkh/4GJLONR5ToqRqCQLnQeIu6w0pI/DucrFfNpQhIZTei1G6+yAZDeGq/4MX45MZaGB2tcpHf/aubCWW7rHMZykKHMmm1VH/Q3rt4VvgzZOE2ppEFSoGecXLRmtg0nrNLYQxQ/aE2bBaMD4bq5jn6cbfaSxy0DrLlDdsULFP0msJBiX3ppHA9s09RSMs77XyE6+UZvGUdrexZ6J2glozvRZFJXpxeTMWQyZiDNQe8aW21S3L/mK9XsJw3g4y7upCZlEDGKQou90U72I6lrOwfDCP7OJb0fZfKj6kLN3hVoDw+ZxKuw8tUb7NPLu04uWIYV5Bc7mh2nJgVKEGzzqKMGTWVxYamgGOcQZa1HA4ziWPuVJfgKC9Tp8Iro6xLs/Iw217bFmnbpWnW/xnPKEXsrJ9tK/1AMNm+onmUvPMwKHoOKUxKcUTC2H86yvQz8bXyRdOhop4T80IOhwU+6YB+9PDClkxKel5y4NmofRnMFHUBYLLe/JUg+WA3LQ8HPx45RpQi9FKYbaYYm8nqNkw35sNr9PLpLzt/m5XlNpJVEQ3xeyeBLDwOklkIytK3oqvT9H6v6xze0d8daTydAgerouvuHZO0G6huhdzv6d+T6xRU5D6oJE1DrmSWhlL2D6UoeYHqLuhWPSqEKhhCEjHBikST4Ig04/cE6twPZM7gfR2/zhUEZhNpsGZ8kxD+xf7viCTeQ+/qePz6Oh4ZyJsdjYiaAep4GTYaYYH86slm/s1AMjl+V0+7E1EbjBwb5ZzPf/hIJUBymDcrX0+IFUhOJkpGlH4wT+h7QvlVjY5+qW4beK1RRhJKP5iPrxElI3NAvmOftiijiEooOWhnBz/PKL++ei+veGiqqgAoGXuR/F3XSFrNCudknvuP0BmJ//W0S26YVAmiziWGTOWRafuCqm8Wmkbtm7rIqz3KBCkqTxwV/lBQHjmX/SfH78tWSLeFmSAJJjfM3EnhlYLy63HqmeSANw3TLmJGff6Zg1Hk5uU3HeVkp5soayplwm2cw015odTtkmXz4W9G62Zkp6wGmhL3BplXKeu7hqKbGogYyseE0rY2omTLTHEjburK/p9VR065/IHOR53L0d1PO/MiqXPZwMm17NvhqOGSozwfpdBpQaUgh27BHAqpgCgfEsqTfTzbhHkd7qcOhrIaXXyuPOxkIx+JcthZbqyPOK+gBFApZMOFsE8nxLiqKtXHvyvhTDxa3oKhjCKfCvhR6blnDJesIK6AXG6VIO41mwD4raJ8VBOVFfB8FG/Ww44q70OlHCz7KrgSOfwMBokavJvQ3d1bCeqDMzG0NxQYpWM7wchSiOx9h6M88tISPiWheKehDFFoCGNkXe+Rg3WQHZSOHnQ6KY7TG+ON2+q5clp/2W0z3EzzpFQanEIG78EHRk4o9+t3N9O8CC8XwmLSYIxuVNqgdA1H5yEhfo+2eHLDyAdCVo1v4ja4ZOnn3PfeJ7+5nU3365qCxtK5uuV+S6jIqq10ro6qGxP/RVW7QYJ7PtcNzEloZI2yhoBhcJKENv0cfJBGtQLIvVlP4RqAMVJtHj511hTBl4uSBEEGR/6xjQ/DGwChY29mDdI+sOfb1T/mbTP/miyJENT/e/gMWfS5Ogc0WJ7gmifUzriZNZPIemZEw8aN6brDctN1WHui4/rTlSy/GzgKJRaBA9uK7eyao8yBce5qf/ZgguHRmGALNgOjbJyyxZv5dEuPdJMu/PPzExpm4pKw+2VZvITHP/r5wwThKCTfLrV6YiwTMOLofvr//PnzExalR0UUKQsyPYd/0MDlb0UpSPwRdhncvahrka2v3fTo8IAQB/dyx/rVNDjB4W3Sa1XKkNLxoPaXRFPXOaYxV+IX2KRXdxa9MwOxhYDaKWa+F2WUu7Xjb0aZfFD+V+9J5D0qL4eI3dck34XSuuczkknwmyyS+KxMUfyuSOm+yba2nUONjLzVuZ0Mk5sWdnZuv/2XxB4kodQNpjeV1mSKWNc4dZ6eK+SAMS7fjpqg3CkmeO693F9A1Ht+lzQQYlBtdV1uWTlwW6OicOpLp13InK7iMnsRTFCvrdZWZBKPPJBwqxJ53BVnYue42Dn1sxsczAS773RjrxogADJzS3cz72jF2H3remJFZgNZzVM9XNkqSl/pQGM8gZbOmNTKbbEd9snrQrtEAoWhRJqq3BOmBT1zyQAL7XRxcnetA1IIny6BKo3FTTnDtNEiddhYz+6tCZM0KQ8z+xeWSht7nc/RUkXZOKxYRMTCNDkByZL67Y3BTAHENPkm4P6Cn4bsb71QrInI61IYb5klxctbgZacYljEVzL3TZNKPyLDGiBtko0FU2GAbEv2VYUJL4x7dPx0u6ZJ13YmkK3wNSw0KENIOJeCQ+2hB/vlL45i3ZvovNyujPCJY+Lhdb8rl+sdMzXHZDDKcdcF1/nOXs+Nxp9YoCQejyRN2tqLmnIkssyxGhifB6ew3OtFrlu6GwuUBDs/kUSxHNwIduv9zWWngjJXLpW7Z/AtMhmV25vhMN67M+nBQ6DGcymO8ei2Rub+eenej6TeBQPXoZWHAcnq81q8PoAPQ/Vba2SSEw+UK866P0UxtRoqSmlCvh0vNutfwZcJpdWGpdwUbhtzWAWvSepBLMLb1RCsMaHm3YXzSAfs4vzxX1NKtt9snuzsss3RhLIBoZTTFjV7KqBL0R2ov3FT0QDUuIySaSExOmru2oxqs+ppXxgUpXxaOVY4cVnrDrTYX5D4omRTCLSW52zPWGu6WKZV4ouSrrwOALA0V+e6zhtjVQKK6sr+QbxaKIJq1mb7p0LloKieSy49KseYewCzCLUSWN4gwfBZkVTykfV6FlbCqHuUkrVm0A1lMxifaZyJIYvGqp9TU+QHcVkjpeLLV6eusEqLbHWLvUXANC7VpSSpp9ZwuYEH5ECJhvK0qEkgKHM5a9Od3VAQB1J03izXPjEEpbTPTQlgOW9/F6PR2s2B8PKxcb7zHbS+J7e52297WRQOls9/YO836szuuFQoXYzDHSf1GPk+KLNZO0ce0zz5DTCNL8rrrPB6t1qEXS5S3xQRYA0fm9/RsihwIDtECA6zPj63D+ZRQ6LP0mCTMikUI69H7yaUxO51KiBWJvfzXcafWjrLzY+wxEZwmC0RDba4WSUr21+vTqQZQV77h0tME8uH32DKa/Dc19b+QX3vmSg5kwD6lakg9vGfcea4f47G9fU92G2UYWzo9l4jk0sRCaZzGsB/EoLtuk552x7sggR7q3zo5wgoSAOfY42wH5ljLLQ6QT5PpIf3z9heA2MvMoexqL2hTR7rEEec88+IkrzYyCYXdS02iHibVW2rPYId2lQEsX6zOsgV8rT00A6BeJnmcK94EeoWm1AjIzjMLkxYiAW7wjUaX4H6Lum3YdC3vInAi05K0Uc+8pHfJv8AtKiQZAkcvPUAAAAASUVORK5CYII=';
  const SOF_DISCORD = 'https://discord.gg/ZQDz8ANTUR';
  const SOF_GUILD = 'https://www.wolvden.com/g/society/991';
  const SOF_PROFILE = 'https://www.wolvden.com/profile/145906';
  // The licence is linked to GitHub rather than the Pages copy on purpose:
  // GitHub renders Markdown in the browser, where Pages would hand over the
  // raw file and some browsers would download it instead of showing it.
  const TWILL_LICENCE = 'https://github.com/Trashgremlinx/Twill/blob/main/LICENCE.md';
  const VERSION = '0.35.1';

  /* Two copies of Twill on one page, say an old test build left installed
     beside this one, would draw two buttons and two hubs, and both would save
     to the same storage. Whichever arrives second stands down. The flag
     catches another copy of this build or a later one; the button catches
     older builds, which never set the flag. Saved test pages in dev/ carry a
     frozen copy of the button, so the button check is skipped on those. */
  if (window.__twill ||
      (document.getElementById('dk-launch') && !document.querySelector('meta[name="dk-fixture"]'))) {
    console.warn('Twill ' + VERSION + ': another copy of Twill is already running on this page, so this one is standing down. Remove the extra copy from the Tampermonkey dashboard.');
    return;
  }
  window.__twill = VERSION;

  // ================================================================== storage

  const PREFIX = 'denkit:';

  function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(PREFIX + key));
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* full or blocked */ }
  }

  // ====================================================================== dom

  function h(tag, props, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k in n) {
        // Some reflected names are read-only getters (input.list); strict mode
        // throws on those, so fall back to the attribute.
        try { n[k] = v; } catch { n.setAttribute(k, v); }
      } else n.setAttribute(k, v);
    }
    for (const kid of kids) if (kid != null && kid !== false) n.append(kid);
    return n;
  }

  // =================================================================== colour

  const hexToC = (s) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(s).trim());
    const n = m ? parseInt(m[1], 16) : 0x808080;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  const mix = (a, b, t) => ({
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t)
  });
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('');
  const lum = (c) => (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;

  // =================================================================== themes

  // The 8 approved presets. Presets never change; edits land in a draft
  // (per preset) or in one of your own saved themes.
  const PRESETS = {
    cypres: {
      name: 'Cyprès',
      panel: '#292317', surface: '#352d1f', line: '#4a4131',
      head: '#58382e', headText: '#f1ebe0',
      text: '#d9d2c5', muted: '#a39b8c',
      accent: '#9c9050', onAccent: '#1e1a10',
      good: '#4e7b67', goodText: '#eef3ea',
      warn: '#805748', warnText: '#f6ebe4',
      edge: '#c9a94f',
      tipTitle: '#b8a45c',
      glass: 62,
      // Red Rose is never downloaded. Pages that already load it (your den) get
      // it; everywhere else falls through to Georgia.
      titleFont: "'Red Rose', Georgia, serif",
      bodyFont: "'Red Rose', Georgia, serif",
      radius: 2
    },
    parchment: {
      name: 'Parchment',
      // Still a light mode, but a violet one: the page is white with a violet
      // cast rather than cream, and every coloured part of it is purple. That
      // is what keeps it apart from Tree Bark, which is warm brown light, and
      // from Bloom, which is pink light.
      panel: '#f8f6fb', surface: '#ece7f5', line: '#dcd3ea',
      head: '#4a3570', headText: '#f8f6fb',
      text: '#241f2e', muted: '#514b64',
      accent: '#5b3a92', onAccent: '#f8f6fb',
      good: '#e2ebe0', goodText: '#33502f',
      warn: '#f5e2dc', warnText: '#7a3524',
      edge: '#a48ec9',
      tipTitle: '#4a3570',
      glass: 76,
      titleFont: 'Constantia, Georgia, serif',
      bodyFont: "'Segoe UI', system-ui, sans-serif",
      radius: 3
    },
    winter: {
      name: 'Tide',
      // Deep water for the panel, a bright shallow-sea cyan for the links, and
      // warm sand for the headings so they are not one more shade of blue. Dark
      // rather than light, because Frosted Cranberries has the cool light slot.
      panel: '#0d2436', surface: '#143247', line: '#235071',
      head: '#10394f', headText: '#e6f4fb',
      text: '#dbeaf4', muted: '#9cbbcf',
      accent: '#5cc9ec', onAccent: '#082030',
      good: '#17553f', goodText: '#ddf2e6',
      warn: '#6b3a2a', warnText: '#fbe2d4',
      edge: '#3287b0',
      tipTitle: '#f2b134',
      glass: 62,
      titleFont: "'Trebuchet MS', 'Segoe UI', sans-serif",
      bodyFont: "'Segoe UI', system-ui, sans-serif",
      radius: 4
    },
    summer: {
      name: 'Bloom',
      // Petals, and pink enough to be read as pink: the page itself is the
      // flower, the words on it are wine and raspberry, and leaf green is kept
      // for the good state so a good thing still reads as one.
      panel: '#fce8ee', surface: '#f8d8e1', line: '#efc2ce',
      head: '#8c2140', headText: '#fce8ee',
      text: '#4a1f2e', muted: '#6b3a4a',
      accent: '#8c2140', onAccent: '#fce8ee',
      good: '#e3ecd8', goodText: '#44562e',
      warn: '#fbe0c9', warnText: '#8a4a1c',
      edge: '#e39cae',
      tipTitle: '#7d1f3c',
      glass: 76,
      titleFont: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
      bodyFont: "'Trebuchet MS', 'Segoe UI', sans-serif",
      radius: 6
    },
    /* The three below are drawn from the Twill mark itself, so the kit can wear
       its own colours. Every one is still only a starting point: the Look screen
       edits all 15 swatches and Save as new keeps your own version. */
    treebark: {
      name: 'Tree Bark',
      // The mark's light colourway: chestnut hide, tan antler, cream page.
      panel: '#f7f0e2', surface: '#ebdfc8', line: '#dccbab',
      head: '#6b4a2f', headText: '#f7f0e2',
      text: '#33261c', muted: '#5f4c3a',
      accent: '#734413', onAccent: '#f7f0e2',
      good: '#dfe7d6', goodText: '#3a5030',
      warn: '#f2ddd2', warnText: '#7d3d22',
      edge: '#a9713d',
      tipTitle: '#6b4a2f',
      glass: 76,
      titleFont: "Georgia, 'Times New Roman', serif",
      bodyFont: "Georgia, 'Times New Roman', serif",
      radius: 4
    },
    understory: {
      name: 'Understory',
      // Deep forest floor, moss for the links, the mark's butterfly for headings.
      panel: '#16251c', surface: '#20352a', line: '#31503e',
      head: '#1f3a2c', headText: '#eef2e6',
      text: '#dee7d6', muted: '#9fb094',
      accent: '#9ac96d', onAccent: '#16251c',
      good: '#2f5a42', goodText: '#e2f0e2',
      warn: '#6b3f28', warnText: '#f6e2d4',
      edge: '#7fa05c',
      tipTitle: '#e0964e',
      glass: 62,
      titleFont: "Georgia, 'Times New Roman', serif",
      bodyFont: "Georgia, 'Times New Roman', serif",
      radius: 4
    },
    cranberries: {
      name: 'Frosted Cranberries',
      // Snow and ice for the ground, berry for the links and the header, holly
      // for the headings. Red and green swapped over from where they started.
      panel: '#eef4f7', surface: '#dce8ee', line: '#c2d5df',
      head: '#8c1f26', headText: '#eef4f7',
      text: '#1b282e', muted: '#42535d',
      accent: '#95202a', onAccent: '#eef4f7',
      good: '#d7e8dc', goodText: '#1f4a32',
      warn: '#f7dcdd', warnText: '#8e2026',
      edge: '#9fc8d8',
      tipTitle: '#1f4230',
      glass: 76,
      titleFont: 'Cambria, Georgia, serif',
      bodyFont: 'Cambria, Georgia, serif',
      radius: 3
    },
    ink: {
      name: 'Ink',
      panel: '#16181c', surface: '#1f2227', line: '#30343b',
      head: '#0d0f12', headText: '#e8eaed',
      text: '#e2e4e8', muted: '#9aa0a8',
      accent: '#8fb3d9', onAccent: '#0d1117',
      good: '#1f3a2e', goodText: '#9fd6b8',
      warn: '#3d2620', warnText: '#f0b49c',
      edge: '#8fb3d9',
      tipTitle: '#d4b66c',
      glass: 62,
      titleFont: "'Segoe UI', system-ui, sans-serif",
      bodyFont: "'Segoe UI', system-ui, sans-serif",
      radius: 4
    }
  };

  const COLOUR_FIELDS = [
    ['panel', 'Panel'], ['surface', 'Surface'],
    ['line', 'Line'], ['head', 'Header'],
    ['headText', 'Header text'], ['text', 'Text'],
    ['muted', 'Muted'], ['accent', 'Accent'],
    ['onAccent', 'On accent'], ['good', 'Good'],
    ['goodText', 'Good text'], ['warn', 'Warning'],
    ['warnText', 'Warning text'], ['edge', 'Edge'], ['tipTitle', 'Tooltip title']
  ];

  const FONT_SUGGESTIONS = [
    // serifs
    "'Red Rose', Georgia, serif", 'Georgia, serif', 'Cambria, Georgia, serif',
    "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    "'Times New Roman', Times, serif", "Garamond, 'Apple Garamond', Georgia, serif",
    "Constantia, Georgia, serif", "'Hoefler Text', 'Baskerville Old Face', Georgia, serif",
    "'Iowan Old Style', 'Palatino Linotype', serif",
    // slabs and display
    "Rockwell, 'Courier New', Georgia, serif",
    "Copperplate, 'Copperplate Gothic Light', Georgia, serif",
    "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    // sans
    "'Segoe UI', system-ui, sans-serif", 'Verdana, Geneva, sans-serif',
    "'Trebuchet MS', 'Lucida Grande', sans-serif", 'Tahoma, Geneva, sans-serif',
    "Calibri, 'Helvetica Neue', Helvetica, sans-serif",
    "Candara, Optima, 'Segoe UI', sans-serif",
    "Corbel, 'Lucida Grande', sans-serif",
    "'Century Gothic', 'URW Gothic', 'Avant Garde', sans-serif",
    "'Franklin Gothic Medium', 'Arial Narrow', sans-serif",
    "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
    // hands and monospace
    "'Segoe Print', 'Bradley Hand', cursive",
    "'Segoe Script', 'Snell Roundhand', cursive",
    "'Ink Free', 'Bradley Hand', cursive",
    "Gabriola, 'Apple Chancery', cursive",
    "'Brush Script MT', 'Snell Roundhand', cursive",
    "'Comic Sans MS', 'Chalkboard SE', cursive",
    "Consolas, Menlo, monospace", "'Courier New', Courier, monospace"
  ];

  // theme: 'preset:<id>' or 'custom:<id>'
  // drafts: per-preset edits you have not saved as a theme yet
  const core = Object.assign(
    { theme: 'preset:cypres', drafts: {}, custom: {}, enabled: {}, corner: 'br', button: 'full', buttonSize: 40, buttonPlate: false },
    load('core', {})
  );
  const saveCore = () => save('core', core);

  function themeParts() {
    const [kind, id] = String(core.theme).split(':');
    if (kind === 'custom' && core.custom[id]) return { kind, id };
    return { kind: 'preset', id: PRESETS[id] ? id : 'cypres' };
  }

  function activeTokens() {
    const { kind, id } = themeParts();
    if (kind === 'custom') return { ...PRESETS.cypres, ...core.custom[id].tokens };
    return { ...PRESETS[id], ...(core.drafts[id] || {}) };
  }

  function themeLabel() {
    const { kind, id } = themeParts();
    if (kind === 'custom') return core.custom[id].name;
    const edited = core.drafts[id] && Object.keys(core.drafts[id]).length;
    return PRESETS[id].name + (edited ? ' (edited)' : '');
  }

  function setToken(key, value, persist) {
    const { kind, id } = themeParts();
    if (kind === 'custom') core.custom[id].tokens[key] = value;
    else (core.drafts[id] = core.drafts[id] || {})[key] = value;
    paintTheme();
    if (persist) saveCore();
  }

  // All theme colours live as CSS variables on :root, so a live edit is one
  // rewrite of this block and everything repaints.
  const varsEl = document.createElement('style');
  varsEl.id = 'dk-vars';
  document.head.appendChild(varsEl);

  function paintTheme() {
    const t = activeTokens();
    const bg = hexToC(t.panel);
    const tx = hexToC(t.text);
    const dark = lum(bg) < 0.5;
    const edge = /^#[0-9a-f]{6}$/i.test(t.edge || '') ? t.edge : t.accent;

    // How solid the frosted panels are, and a touch of lift on dark themes.
    const glass = Math.max(20, Math.min(100, Number(t.glass) || 62));

    // Glass cues have to flip with the panel. On a dark pane, light catches the
    // top and left edges. On a light pane those white highlights would vanish,
    // so the rim darkens, a crisp white line sits on the top edge, and a soft
    // shadow just beneath it gives the pane its thickness.
    const sheen = dark
      ? 'radial-gradient(120% 90% at 6% -10%, rgba(255,255,255,.15), rgba(255,255,255,.04) 26%, rgba(255,255,255,0) 56%),' +
        ' linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0) 14px)'
      : 'radial-gradient(120% 90% at 6% -10%, rgba(255,255,255,.58), rgba(255,255,255,.16) 28%, rgba(255,255,255,0) 60%),' +
        ' linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0) 16px)';
    const bevel = dark
      ? 'inset 0 1px 0 rgba(255,255,255,.34), inset 1px 0 0 rgba(255,255,255,.16),' +
        ' inset 0 -1px 0 rgba(0,0,0,.30), inset -1px 0 0 rgba(0,0,0,.16), inset 0 0 24px rgba(255,255,255,.05)'
      : 'inset 0 1px 0 rgba(255,255,255,.85), inset 1px 0 0 rgba(255,255,255,.5),' +
        ' inset 0 2px 7px rgba(0,0,0,.07), inset 0 -1px 0 rgba(0,0,0,.22), inset -1px 0 0 rgba(0,0,0,.12)';
    const rim = dark ? '55%' : '72%';
    const blur = 'blur(28px) saturate(' + (dark ? 1.28 : 1.4) + ') brightness(' + (dark ? 1.03 : 0.99) + ')' +
      (dark ? '' : ' contrast(1.04)');
    varsEl.textContent = `:root {
      --dk-panel: ${t.panel}; --dk-surface: ${t.surface}; --dk-line: ${t.line};
      --dk-head: ${t.head}; --dk-head-text: ${t.headText};
      --dk-text: ${t.text}; --dk-muted: ${t.muted};
      --dk-accent: ${t.accent}; --dk-on-accent: ${t.onAccent};
      --dk-good: ${t.good}; --dk-good-text: ${t.goodText};
      --dk-warn: ${t.warn}; --dk-warn-text: ${t.warnText};
      --dk-edge: ${edge};
      --dk-sheen: ${sheen}; --dk-bevel: ${bevel}; --dk-rim: ${rim}; --dk-blur: ${blur};
      /* Gene highlight colours are built in CSS from a hue per source plus these
         two, so switching theme re-fits every one of them without any JS. */
      --dk-gene-s: 72%; --dk-gene-l: ${dark ? '62%' : '40%'};
      --dk-glass: ${glass}%;
      --dk-tip-title: ${t.tipTitle || t.accent};
      --dk-title-font: ${t.titleFont}; --dk-body-font: ${t.bodyFont};
      --dk-radius: ${Math.max(0, Math.min(10, Number(t.radius) || 0))}px;
      --dk-hover: ${hex(mix(bg, tx, 0.1))};
      --dk-plate: ${hex(mix(bg, hexToC(t.head), 0.2))};
      --dk-shadow: ${dark ? '0 14px 34px rgba(0,0,0,.46)' : '0 12px 28px rgba(0,0,0,.2)'};
    }`;
  }

  // ============================================================ base styles

  // Everything is scoped under #dk-hub or dk- classes, with explicit values for
  // anything Bootstrap or a den skin likes to restyle (labels, inputs, buttons).
  const baseEl = document.createElement('style');
  baseEl.id = 'dk-base';
  baseEl.textContent = `
    /* A den's custom layout can restyle every link on the page with !important:
       its own colour, a glow, extra letter-spacing, bold. That is right for the
       den and wrong inside our panels, where it lands on a different background,
       so Twill's roots opt out of the lot and set their own link colours. */
    #dk-hub a, #dk-den a, #dk-pop a, #dk-tc a, #dk-np a, #dk-lore a, #dk-ped a,
    #dk-tray a, .dk-slip a {
      color: var(--dk-text) !important; text-shadow: none !important;
      letter-spacing: normal !important; font-weight: inherit !important;
    }

    #dk-launch {
      position: fixed; z-index: 2147483000; margin: 0;
      font: 600 12px/1 var(--dk-title-font); letter-spacing: .02em;
      padding: 8px 12px; border: 0; border-radius: var(--dk-radius);
      background: var(--dk-head); color: var(--dk-head-text);
      box-shadow: var(--dk-shadow); cursor: pointer;
    }
    #dk-launch:hover { filter: brightness(1.1); }
    /* Mark mode drops the panel entirely: no background, no border, and no ring
       around it. The only thing under the stag is the faintest drop, enough to
       keep it from lying flat on a busy den photo. Size is yours to set. */
    #dk-launch.dk-b-mark {
      padding: 0; background: transparent; box-shadow: none; line-height: 0;
      border: 0; outline: none !important;
    }
    #dk-launch.dk-b-mark img {
      display: block; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .35));
    }
    #dk-launch.dk-b-mark:hover { filter: brightness(1.06); }
    /* No ring, ever. A keyboard user still has to be able to see where they
       are, so focus lights the stag itself: the glow follows the silhouette
       rather than drawing a box around it. */
    #dk-launch.dk-b-mark:focus-visible { outline: none !important; }
    #dk-launch.dk-b-mark:focus-visible img {
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .35))
              drop-shadow(0 0 4px var(--dk-accent));
    }
    /* The plate, off unless you ask for it: the same frosted glass as the hub,
       so the mark has something of Twill's own to sit on when a den photo is
       too busy to read it against. */
    #dk-launch.dk-b-plate {
      padding: 6px;
      background-color: var(--dk-plate);
      background-image: var(--dk-sheen);
      border: 1px solid color-mix(in srgb, var(--dk-edge) var(--dk-rim), transparent) !important;
      border-radius: max(var(--dk-radius), 5px);
      box-shadow: var(--dk-shadow), var(--dk-bevel);
    }
    @supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      :root #dk-launch.dk-b-plate {
        background-color: color-mix(in srgb, var(--dk-plate) var(--dk-glass), transparent);
        -webkit-backdrop-filter: var(--dk-blur);
        backdrop-filter: var(--dk-blur);
      }
    }
    #dk-launch.dk-c-br { right: 12px; bottom: 12px; }
    #dk-launch.dk-c-bl { left: 12px; bottom: 12px; }
    #dk-launch.dk-c-tr { right: 12px; top: 12px; }
    #dk-launch.dk-c-tl { left: 12px; top: 12px; }

    #dk-hub {
      position: fixed; z-index: 2147483001; width: 320px; max-height: 72vh;
      display: flex; flex-direction: column; overflow: hidden;
      background: var(--dk-panel); color: var(--dk-text);
      border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
      box-shadow: var(--dk-shadow); font: 12px/1.5 var(--dk-body-font); text-align: left;
    }
    /* Compare needs a column per wolf, so the hub widens while it is open and
       shrinks back to 320px as soon as you leave it. */
    #dk-hub.dk-hub-wide { width: min(900px, calc(100vw - 24px)); }
    #dk-hub.dk-c-br { right: 12px; bottom: 50px; }
    #dk-hub.dk-c-bl { left: 12px; bottom: 50px; }
    #dk-hub.dk-c-tr { right: 12px; top: 50px; }
    #dk-hub.dk-c-tl { left: 12px; top: 50px; }
    #dk-hub *, #dk-hub *::before, #dk-hub *::after { box-sizing: border-box; }

    .dk-head {
      display: flex; align-items: center; gap: 6px; flex: none;
      padding: 8px 11px; background: var(--dk-head); color: var(--dk-head-text);
      font: 600 13px/1.3 var(--dk-title-font);
    }
    .dk-head .dk-title { flex: 1; }
    /* No chip behind it. The mark is two-tone, so instead of giving it a plate
       to read against, the colourway is chosen to suit what it lands on: the
       header bar is dark in every one of the eight themes, so the mark there is
       always the pale one, which measures 3.3:1 at worst on its body and 5.4:1
       on its antlers. */
    .dk-head .dk-mark {
      flex: none; display: grid; place-items: center; padding: 0; margin: -1px 4px -1px 0;
      background: none; border: 0; cursor: pointer; opacity: 1; line-height: 0;
    }
    .dk-head .dk-mark:hover { filter: brightness(1.06); }
    .dk-head .dk-mark img { display: block; }
    .dk-about-mark {
      margin: 8px auto 12px; display: grid; place-items: center;
      background: none; line-height: 0;
    }
    .dk-about-mark img { display: block; }
    .dk-about-name {
      text-align: center; font: 700 20px/1.2 var(--dk-title-font);
      color: var(--dk-tip-title); letter-spacing: .01em;
    }
    .dk-about-ver { text-align: center; color: var(--dk-muted); font-size: 11px; margin-top: 2px; }
    .dk-about-sof { display: flex; align-items: center; gap: 11px; }
    .dk-about-sof .dk-sof-chip {
      flex: none; display: block; padding: 5px; line-height: 0;
      background: #f5efe1; border-radius: var(--dk-radius);
    }
    .dk-about-sof .dk-sof-chip:hover { filter: brightness(1.06); }
    .dk-about-links { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .dk-about-links a { color: var(--dk-accent) !important; text-decoration: none; }
    .dk-about-links a:hover { text-decoration: underline; }
    .dk-head button {
      font: inherit; color: inherit; background: none; border: 0; margin: 0;
      padding: 0 4px; cursor: pointer; opacity: .8; line-height: 1;
    }
    .dk-head button:hover, .dk-head button:focus-visible { opacity: 1; }
    .dk-head .dk-x { font-size: 16px; }
    .dk-body { overflow: auto; padding: 2px 11px 12px; }
    .dk-body::-webkit-scrollbar { width: 8px; }
    .dk-body::-webkit-scrollbar-thumb { background: var(--dk-line); border-radius: 4px; }

    .dk-row {
      display: flex; align-items: center; gap: 9px;
      padding: 9px 0; border-bottom: 1px solid var(--dk-line);
    }
    .dk-row .dk-t { flex: 1; min-width: 0; cursor: pointer; }
    .dk-row .dk-t strong { display: block; font-weight: 600; color: var(--dk-text); }
    .dk-row .dk-t span { display: block; color: var(--dk-muted); font-size: 11px; }
    .dk-chev {
      flex: none; color: var(--dk-muted); background: none; border: 0; margin: 0;
      padding: 0 2px; font: 15px/1 var(--dk-body-font); cursor: pointer;
    }
    .dk-chev:hover { color: var(--dk-text); }
    .dk-row.dk-link { cursor: pointer; border-bottom: 0; padding-top: 11px; }

    .dk-switch {
      flex: none; position: relative; width: 30px; height: 17px; margin: 0; padding: 0;
      border: 0; border-radius: 9px; background: var(--dk-line); cursor: pointer;
    }
    .dk-switch::after {
      content: ""; position: absolute; top: 2px; left: 2px; width: 13px; height: 13px;
      border-radius: 50%; background: var(--dk-muted); transition: left .12s;
    }
    .dk-switch[aria-checked="true"] { background: var(--dk-accent); }
    .dk-switch[aria-checked="true"]::after { left: 15px; background: var(--dk-on-accent); }

    .dk-lb {
      font-size: 10px; text-transform: uppercase; letter-spacing: .08em;
      color: var(--dk-muted); font-weight: 600; margin: 14px 0 6px;
    }
    #dk-hub label { display: block; margin: 8px 0 3px; font-weight: 400; color: var(--dk-muted); font-size: 11px; }
    #dk-hub input[type=text], #dk-hub input[type=number], #dk-hub select {
      display: block; width: 100%; height: auto; margin: 0; padding: 5px 8px;
      font: 12px/1.4 var(--dk-body-font); color: var(--dk-text);
      background: var(--dk-surface); border: 1px solid var(--dk-line);
      border-radius: var(--dk-radius); box-shadow: none; outline: 0;
    }
    #dk-hub input[type=number] { display: inline-block; width: 64px; }
    #dk-hub textarea {
      display: block; width: 100%; margin: 0; padding: 6px 8px; resize: vertical;
      font: 11px/1.4 Consolas, 'Courier New', monospace; color: var(--dk-text);
      background: var(--dk-surface); border: 1px solid var(--dk-line);
      border-radius: var(--dk-radius); outline: 0;
    }
    #dk-hub textarea:focus { border-color: var(--dk-accent); }
    #dk-hub input[type=text]:focus, #dk-hub input[type=number]:focus, #dk-hub select:focus {
      border-color: var(--dk-accent);
    }
    #dk-hub input::placeholder { color: var(--dk-muted); opacity: .7; }
    #dk-hub label.dk-check {
      display: flex; align-items: center; gap: 7px; margin: 7px 0 0;
      color: var(--dk-text); font-size: 12px; cursor: pointer;
    }
    #dk-hub input[type=checkbox] { margin: 0; accent-color: var(--dk-accent); }
    #dk-hub input[type=range] { width: 100%; margin: 4px 0 0; accent-color: var(--dk-accent); }

    .dk-swatches { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px; }
    #dk-hub .dk-swatches label {
      display: flex; align-items: center; gap: 7px; margin: 0;
      color: var(--dk-muted); font-size: 11px; cursor: pointer;
    }
    #dk-hub input[type=color] {
      flex: none; width: 24px; height: 17px; margin: 0; padding: 0;
      border: 1px solid var(--dk-line); border-radius: 3px; background: none; cursor: pointer;
    }
    #dk-hub input[type=color]::-webkit-color-swatch-wrapper { padding: 0; }
    #dk-hub input[type=color]::-webkit-color-swatch { border: 0; border-radius: 2px; }
    .dk-two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .dk-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    .dk-btn {
      font: 12px/1.3 var(--dk-body-font); margin: 0; padding: 5px 10px; cursor: pointer;
      color: var(--dk-text); background: var(--dk-surface);
      border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
    }
    .dk-btn:hover { background: var(--dk-hover); }
    .dk-btn.dk-primary {
      color: var(--dk-on-accent); background: var(--dk-accent);
      border-color: var(--dk-accent); font-weight: 600;
    }
    .dk-btn.dk-primary:hover { filter: brightness(1.08); }
    .dk-btn.dk-quiet { background: none; }

    .dk-note { margin-top: 12px; color: var(--dk-muted); font-size: 11px; line-height: 1.45; }
    .dk-empty { padding: 10px 0; color: var(--dk-muted); }

    /* goals, search results, progress bars */
    .dk-goal { display: flex; align-items: flex-start; gap: 8px; padding: 5px 0; border-bottom: 1px solid var(--dk-line); }
    .dk-goal:last-of-type { border-bottom: 0; }
    .dk-goal-t { flex: 1; min-width: 0; }
    .dk-goal-t span { display: block; }
    .dk-goal-n { color: var(--dk-muted); font-size: 11px; }
    .dk-goal.dk-done .dk-goal-t > span:first-child { text-decoration: line-through; color: var(--dk-muted); }
    .dk-goal-x {
      flex: none; padding: 0 3px; font-size: 14px; line-height: 1; cursor: pointer;
      color: var(--dk-muted); background: none; border: 0;
    }
    .dk-goal-x:hover { color: var(--dk-text); }
    .dk-find { padding: 6px 0; border-bottom: 1px solid var(--dk-line); }
    .dk-find strong { display: block; font-weight: 600; }
    .dk-find span { display: block; color: var(--dk-muted); font-size: 11px; }
    /* A row that is itself a link. It keeps the row's own look rather than the
       theme's link colour, and says it is clickable by lifting on hover. */
    a.dk-find-link { display: block; text-decoration: none; cursor: pointer; }
    a.dk-find-link:hover { background: var(--dk-hover); }
    a.dk-find-link:hover strong { color: var(--dk-accent) !important; }
    /* Lore's layout editor, in the hub. */
    .dk-lore-row { display: flex; align-items: center; gap: 4px; padding: 4px 0; border-bottom: 1px solid var(--dk-line); }
    .dk-lore-srow { margin-top: 6px; }
    .dk-lore-frow { padding-left: 12px; }
    .dk-lore-nm { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 6px; }
    .dk-lore-type { color: var(--dk-muted); font-size: 10.5px; }
    .dk-lore-kb {
      flex: none; background: none; border: 0; margin: 0; padding: 0 4px; cursor: pointer;
      color: var(--dk-muted); font-size: 12px; line-height: 1.4;
    }
    .dk-lore-kb:hover { color: var(--dk-accent); }
    .dk-lore-add { display: flex; gap: 5px; margin-top: 5px; }
    .dk-lore-add select { flex: 1; min-width: 0; }
    .dk-find-card { margin: 6px 0; border: 1px solid var(--dk-line); border-radius: var(--dk-radius); }
    /* Chips are defined once, here. A second .dk-chip further down used to
       override this one, and because it came after .dk-chip-on as well, a
       picked biome looked exactly like every other chip. */
    .dk-chips { display: flex; flex-wrap: wrap; gap: 4px; margin: 7px 0 4px; }
    .dk-chip {
      padding: 1px 6px; margin: 0; cursor: pointer; font: 11px/1.5 var(--dk-body-font);
      color: var(--dk-text); background: var(--dk-surface);
      border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
    }
    .dk-chip:hover { border-color: var(--dk-accent); }
    .dk-chip-on { background: var(--dk-accent); color: var(--dk-on-accent); border-color: var(--dk-accent); }
    .dk-herb { padding: 7px 9px; }
    .dk-herb-h { display: flex; align-items: baseline; gap: 8px; }
    .dk-herb-h strong { display: block; font-weight: 600; }
    .dk-herb-where { margin-left: auto; flex: none; color: var(--dk-muted); font-size: 10.5px; }
    .dk-herb-m { display: flex; align-items: baseline; gap: 8px; font-size: 11.5px; padding: 1px 0; }
    /* The name must win the space fight: with the description at flex:none it
       never shrank, and a long medicine name wrapped one letter per line. */
    .dk-herb-m > span { flex: 1 1 auto; min-width: 0; }
    .dk-herb-m em {
      flex: 0 1 auto; min-width: 0; margin-left: auto; text-align: right;
      padding-left: 10px;
      color: var(--dk-muted); font-style: normal; font-size: 10.5px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .dk-herb-b { margin-top: 3px; color: var(--dk-muted); font-size: 10.5px; line-height: 1.45; }
    /* A row whose tail does not fit is kept to one line so the list stays
       scannable, and the ellipsis says there is more. Click it and it opens
       out in place: nothing in a guide should be unreadable. */
    .dk-herb-m.dk-can-ex, .dk-fr-row.dk-can-ex { cursor: pointer; }
    .dk-herb-m.dk-can-ex:hover em, .dk-fr-row.dk-can-ex:hover .dk-fr-m { color: var(--dk-text); }
    .dk-herb-m.dk-ex-open { align-items: flex-start; cursor: pointer; }
    .dk-herb-m.dk-ex-open > span, .dk-herb-m.dk-ex-open em,
    .dk-fr-row.dk-ex-open .dk-fr-m {
      white-space: normal; overflow: visible; text-overflow: clip;
    }
    .dk-herb-m.dk-ex-open em { text-align: right; }
    .dk-diff {
      flex: none; font-size: 9.5px; text-transform: uppercase; letter-spacing: .06em;
      padding: 0 5px; border-radius: var(--dk-radius); border: 1px solid var(--dk-line);
      color: var(--dk-muted);
    }
    .dk-diff-easy { color: var(--dk-good-text); background: var(--dk-good); border-color: transparent; }
    .dk-diff-medium { color: var(--dk-text); }
    .dk-diff-difficult { color: var(--dk-warn-text); background: var(--dk-warn); border-color: transparent; }
    .dk-diff-challenging { color: var(--dk-warn-text); background: var(--dk-warn); border-color: transparent; font-weight: 700; }
    .dk-rate { padding: 8px 9px; }
    .dk-rate-h { display: flex; align-items: baseline; gap: 8px; margin-bottom: 5px; }
    .dk-rate-h strong { font-weight: 600; }
    .dk-rate-h em { margin-left: auto; flex: none; font-style: normal; font-size: 10px;
      text-transform: uppercase; letter-spacing: .06em; color: var(--dk-muted); }
    .dk-rate-bar {
      display: flex; height: 9px; overflow: hidden; border-radius: var(--dk-radius);
      background: var(--dk-surface);
    }
    .dk-rate-bar span { display: block; height: 100%; }
    .dk-rate-non { background: var(--dk-line); }
    .dk-rate-car { background: var(--dk-accent); }
    .dk-rate-mut { background: var(--dk-tip-title); }
    .dk-rate-legend { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 5px; }
    .dk-rate-k { display: flex; align-items: center; gap: 4px; font-size: 10.5px; color: var(--dk-muted); }
    .dk-rate-k i { width: 8px; height: 8px; border-radius: 2px; flex: none; }
    .dk-bond-answer { margin-top: 6px; font-size: 13px; }
    .dk-bond-answer strong { color: var(--dk-tip-title); font-weight: 700; }
    .dk-bond-answer span { color: var(--dk-muted); font-size: 11px; }
    .dk-fr-row { display: flex; align-items: center; gap: 3px; padding: 2px 0; }
    .dk-fr-head { color: var(--dk-muted); font-size: 10px; text-transform: uppercase; letter-spacing: .06em; }
    /* The column key: the names in full, in column order, so the short codes
       in the header never have to be guessed at. Its own class, apart from the
       .dk-fr-key legend rows below, which it used to share and fight with. */
    .dk-fr-cols {
      display: flex; flex-wrap: wrap; gap: 4px 10px; margin: 8px 0 2px;
      font-size: 11px; color: var(--dk-muted);
    }
    .dk-fr-cols b { color: var(--dk-text); font-weight: 600; }
    .dk-fr-m { flex: 1; min-width: 0; font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dk-fr-c {
      flex: none; width: 34px; text-align: center; border-radius: var(--dk-radius);
      font: 700 11px/1.7 var(--dk-body-font);
    }
    .dk-fr-head .dk-fr-c { font-weight: 600; }
    .dk-v2 { background: var(--dk-good); color: var(--dk-good-text); }
    .dk-v1 { background: color-mix(in srgb, var(--dk-good) 55%, transparent); color: var(--dk-text); }
    .dk-v-1 { background: color-mix(in srgb, var(--dk-warn) 55%, transparent); color: var(--dk-text); }
    .dk-v-2 { background: var(--dk-warn); color: var(--dk-warn-text); }
    .dk-fr-key { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--dk-muted); padding: 1px 0; }
    .dk-fr-key i { width: 22px; height: 10px; border-radius: 2px; flex: none; }
    .dk-find-act { display: flex; align-items: center; gap: 8px; }
    .dk-find-act > div { flex: 1; min-width: 0; }
    .dk-goal-add { flex: none; }
    .dk-bar { height: 6px; background: var(--dk-surface); border-radius: 3px; overflow: hidden; }
    .dk-bar i { display: block; height: 100%; background: var(--dk-accent); }
    /* The Collection checklist. */
    .dk-ctabs { display: flex; gap: 4px; margin-bottom: 7px; }
    .dk-ctab {
      flex: 1; min-width: 0; padding: 4px 2px; margin: 0; cursor: pointer; text-align: center;
      font: 12px/1.3 var(--dk-body-font); color: var(--dk-muted); background: var(--dk-surface);
      border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
    }
    .dk-ctab small { display: block; font-size: 10.5px; }
    .dk-ctab[aria-selected="true"] { color: var(--dk-on-accent); background: var(--dk-accent); border-color: var(--dk-accent); }
    .dk-cfind { width: 100%; margin: 8px 0 6px; }
    .dk-cfilt { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 12px; color: var(--dk-muted); }
    .dk-cfilt label { display: inline-flex; align-items: center; gap: 5px; margin: 0; }
    .dk-cseg { display: inline-flex; }
    .dk-cseg button {
      margin: 0; padding: 2px 7px; cursor: pointer; font: 12px/1.4 var(--dk-body-font);
      color: var(--dk-text); background: var(--dk-surface); border: 1px solid var(--dk-line);
    }
    .dk-cseg button + button { border-left: 0; }
    .dk-cseg button[aria-pressed="true"] { color: var(--dk-on-accent); background: var(--dk-accent); border-color: var(--dk-accent); }
    .dk-clist { margin-top: 6px; }
    .dk-cgrp {
      display: flex; width: 100%; gap: 6px; align-items: baseline; margin: 0; padding: 5px 0; cursor: pointer;
      text-align: left; font: 12.5px/1.4 var(--dk-body-font); color: var(--dk-text);
      background: none; border: 0; border-top: 1px solid var(--dk-line);
    }
    .dk-cgrp b { flex: 1; min-width: 0; font-weight: normal; }
    .dk-cgrp span { flex: none; color: var(--dk-muted); font-size: 11.5px; }
    .dk-chip-got { background: var(--dk-good); color: var(--dk-good-text); border-color: var(--dk-good); }
    .dk-chip-got::before { content: '✓ '; }
    .dk-ctier { margin-left: 4px; font-size: 9.5px; opacity: .7; }
    /* The item lookup menu. */
    .dk-lu {
      display: block; width: 100%; margin: 0; padding: 6px 0; cursor: pointer; text-align: left;
      background: none; border: 0; border-top: 1px solid var(--dk-line);
      font: 12px/1.4 var(--dk-body-font); color: var(--dk-text);
    }
    .dk-lu:first-of-type { border-top: 0; }
    .dk-lu:hover strong, .dk-lu:focus-visible strong { color: var(--dk-accent); }
    .dk-lu strong { display: block; font-weight: 600; }
    .dk-lu span { display: block; color: var(--dk-muted); font-size: 11px; }

    /* The post composer's lint and preview. */
    .dk-post-ok { margin-top: 8px; color: var(--dk-good-text); background: var(--dk-good);
                  padding: 5px 8px; border-radius: var(--dk-radius); font-size: 11.5px; }
    .dk-post-warn { margin-top: 6px; color: var(--dk-warn-text); background: var(--dk-warn);
                    padding: 5px 8px; border-radius: var(--dk-radius); font-size: 11.5px; }
    .dk-post-warn strong { display: block; font-weight: 700; }
    /* contain keeps a post's Bootstrap positioning (fixed-top, sticky-top and
       the like) inside this box instead of loose on the page. */
    .dk-post-prev {
      margin-top: 4px; padding: 8px 10px; min-height: 40px; overflow: auto;
      background: var(--dk-surface); border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
      font-size: 12px; contain: layout paint;
    }
    .dk-post-prev img { max-width: 100%; }

    /* Compare, from the tray. */
    .dk-cmp-wrap { overflow-x: auto; margin-top: 4px; }
    .dk-cmp { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    .dk-cmp th, .dk-cmp td {
      padding: 3px 7px; text-align: left; vertical-align: top; white-space: nowrap;
      border-top: 1px solid var(--dk-line);
    }
    .dk-cmp thead th { border-top: 0; font: 700 11.5px var(--dk-title-font); color: var(--dk-tip-title); }
    .dk-cmp th.dk-cmp-r {
      font: 700 10px var(--dk-title-font); text-transform: uppercase; letter-spacing: .07em;
      color: var(--dk-muted); position: sticky; left: 0; background: var(--dk-panel);
    }
    .dk-cmp td.dk-cmp-d { color: var(--dk-accent); font-weight: 600; }
    .dk-cmp td { min-width: 110px; }
    .dk-cmp-seg { display: inline-flex; margin: 2px 0 6px; }
    .dk-cmp-seg button {
      margin: 0; padding: 2px 9px; cursor: pointer; font: 11.5px/1.5 var(--dk-body-font);
      color: var(--dk-text); background: var(--dk-surface); border: 1px solid var(--dk-line);
    }
    .dk-cmp-seg button + button { border-left: 0; }
    .dk-cmp-seg button[aria-pressed="true"] { color: var(--dk-on-accent); background: var(--dk-accent); border-color: var(--dk-accent); }

    /* The gene colour legend, in Genetics settings. */
    .dk-gene-key { display: flex; align-items: center; gap: 8px; padding: 2px 0; font-size: 11.5px; }
    .dk-gene-key i { flex: none; width: 26px; height: 8px; border-radius: 2px; }
    .dk-gene-key b { flex: none; width: 34px; font-size: 12px; color: var(--dk-accent); }
    .dk-gene-key em { margin-left: auto; color: var(--dk-muted); font-size: 10.5px; font-style: normal; }

    #dk-hub .dk-note a { color: var(--dk-accent) !important; }

    .dk-rc { padding: 8px 0; border-bottom: 1px solid var(--dk-line); }
    .dk-rc-top { display: flex; align-items: baseline; gap: 6px; }
    .dk-rc-name { font-weight: 600; }
    a.dk-cat, #dk-pop a.dk-cat {
      color: inherit; text-decoration: none; border-bottom: 1px dotted var(--dk-muted);
    }
    a.dk-cat:hover, #dk-pop a.dk-cat:hover {
      color: var(--dk-accent); border-bottom-color: var(--dk-accent); text-decoration: none;
    }
    .dk-rc-kind {
      font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--dk-muted);
    }
    a.dk-rc-wiki {
      margin-left: auto; flex: none; font-size: 11px; color: var(--dk-accent); text-decoration: none;
    }
    a.dk-rc-wiki:hover { text-decoration: underline; }
    .dk-rc-ings { margin-top: 2px; color: var(--dk-text); }
    .dk-rc-sep { color: var(--dk-muted); }
    .dk-rc-hit, a.dk-cat.dk-rc-hit, #dk-pop a.dk-cat.dk-rc-hit { color: var(--dk-accent); font-weight: 600; }
    .dk-rc-src { color: var(--dk-muted); font-size: 11px; margin-top: 2px; }

    /* Tooltips: a gold edge and frosted glass. The panel colour is laid over
       whatever is behind at ~80%, blurred, with a soft highlight along the top
       edge. Browsers without backdrop-filter get the solid panel instead. */
    #dk-pop {
      position: fixed; z-index: 2147483002; width: max-content; max-width: min(340px, calc(100vw - 16px));
      color: var(--dk-text); font: 12px/1.5 var(--dk-body-font); text-align: left;
      border-radius: max(var(--dk-radius), 4px);
    }
    #dk-pop[hidden] { display: none; }
    /* Click-through until pinned, then it takes the mouse so it can be scrolled. */
    #dk-pop { pointer-events: none; max-height: min(62vh, 520px); overflow: auto; }
    #dk-pop.dk-pop-pin { pointer-events: auto; }
    :root #dk-pop.dk-pop-edge {
      border-left: 3px solid hsl(var(--gh) var(--dk-gene-s, 72%) var(--dk-gene-l, 55%));
    }
    .dk-pop-x {
      position: sticky; float: right; top: 2px; right: 2px; z-index: 1;
      padding: 2px 7px; cursor: pointer; line-height: 1; font-size: 15px;
      color: var(--dk-muted); background: none; border: 0;
    }
    .dk-pop-x:hover { color: var(--dk-text); }
    #dk-pop.dk-pop-pin::after {
      content: 'pinned · scroll it, Esc or × to close';
      display: block; padding: 0 10px 7px; color: var(--dk-muted); font-size: 10px;
    }

    /* ---- glass and edges, shared by everything Twill draws ----
       Floating things (tooltips, hub, Notepad) are beveled glass: the panel
       colour over a heavy blur, light caught in the top left corner and along
       the top edge, and nothing laid over the text. Cards and the corner button
       share the same hairline edge. The :root prefix lets this win over each
       module's own later stylesheet. */
    :root #dk-pop, :root #dk-hub, :root #dk-np {
      background-color: var(--dk-panel);
      background-image: var(--dk-sheen);
    }
    @supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      :root #dk-pop, :root #dk-hub, :root #dk-np {
        background-color: color-mix(in srgb, var(--dk-panel) var(--dk-glass), transparent);
        -webkit-backdrop-filter: var(--dk-blur);
        backdrop-filter: var(--dk-blur);
      }
    }
    /* One hairline edge in the theme's colour, and depth from a soft dark
       shadow rather than a coloured halo. */
    :root #dk-pop, :root #dk-hub, :root #dk-np, :root #dk-den, :root #dk-tc, :root #dk-ped, :root #dk-lore, :root #dk-launch {
      border: 1px solid color-mix(in srgb, var(--dk-edge) var(--dk-rim), transparent);
    }
    /* The bevel: light catches the top and left inside edges while the bottom
       and right fall away, so a panel reads as a thick pane of glass rather
       than a flat rectangle. A faint inner bloom gives it depth. */
    :root #dk-pop, :root #dk-hub, :root #dk-np {
      border-radius: max(var(--dk-radius), 5px);
      box-shadow: var(--dk-shadow), var(--dk-bevel);
    }
    :root #dk-den, :root #dk-tc, :root #dk-ped, :root #dk-lore {
      box-shadow: inset 0 1px 0 rgba(255,255,255,.14), inset 0 -1px 0 rgba(0,0,0,.20);
    }
    :root #dk-launch {
      box-shadow: var(--dk-shadow), inset 0 1px 0 rgba(255,255,255,.30), inset 0 -1px 0 rgba(0,0,0,.28);
    }

    /* ------------------------------------------------------------- phones --
       Everything below lives inside a media query, so on a desktop these rules
       are never applied at all and the desktop layout cannot be affected by
       anything in here. There is no separate mobile build and there should not
       be: one file is the whole install, and a second one would mean two
       pastes, two updates, and telling people which to use.

       Wolvden's own <meta viewport> asks for initial-scale=0.75, so a phone
       renders the page at 500 CSS pixels and then zooms out. Anything Twill
       draws is shown at three quarters of its size on top of being small
       already: a 15px row arrives on the glass at about 11. So the work here is
       mostly room to put a thumb, plus letting the hub use the width it has
       instead of sitting in a 320px column. 560px catches a phone in either
       orientation once that 0.75 is taken into account. */
    @media (max-width: 560px) {
      /* The hub stops being a floating card and spans the screen. Corner only
         decides which end it grows from. */
      :root #dk-hub {
        left: 8px; right: 8px; width: auto; max-height: 80vh;
        font-size: 13px;
      }
      :root #dk-hub.dk-c-br, :root #dk-hub.dk-c-bl { bottom: 12px; }
      :root #dk-hub.dk-c-tr, :root #dk-hub.dk-c-tl { top: 12px; }

      /* Room for a thumb. 38px is short of the 44 the phone makers ask for,
         but the scale factor means 38 here lands near 50 real pixels. */
      #dk-hub .dk-row { padding: 13px 0; }
      #dk-hub .dk-chev { padding: 10px 8px; font-size: 17px; }
      /* The title bar is the smallest thing on the panel and holds the two
         controls people reach for most, so it gets padded rather than resized:
         the mark is artwork and must not stretch. */
      #dk-hub .dk-head .dk-x { padding: 8px 10px; font-size: 20px; }
      #dk-hub .dk-head button[aria-label="Back"] { padding: 8px 10px; font-size: 20px; }
      #dk-hub .dk-head .dk-mark { padding: 8px 6px; }
      #dk-hub .dk-chip, #dk-hub .dk-btn, #dk-hub select, #dk-hub input[type="text"],
      #dk-hub input[type="number"], #dk-hub input[type="search"] {
        min-height: 38px;
      }
      #dk-hub .dk-chip { padding: 6px 12px; font-size: 12.5px; }
      /* A 16px field is the one thing that stops iOS zooming the page in when
         you tap into it, which otherwise leaves the den at the wrong scale. */
      #dk-hub input[type="text"], #dk-hub input[type="number"],
      #dk-hub input[type="search"], #dk-hub textarea { font-size: 16px; }

      /* The tray runs the width of the screen and sits clear of the corner
         button rather than under it. */
      /* The tray module appends its own stylesheet after this one, so these
         need the extra :root to win on specificity rather than on order. */
      :root #dk-tray {
        left: 8px; right: 8px; max-width: none; bottom: 74px;
        gap: 6px; padding: 7px 8px;
      }
      :root .dk-tray-chip { padding: 6px 6px 6px 10px; font-size: 12.5px; }

      /* Tooltips are a hover idea, and a phone has no hover. The card can still
         be tapped open, so it needs to be readable and to have a close big
         enough to hit when it is. */
      :root #dk-pop { max-width: calc(100vw - 16px); font-size: 12.5px; }

      /* The cards Twill adds to Wolvden's own pages sit in whatever column the
         den gives them, so they only need their insides to stop being cramped. */
      #dk-den .dk-row, #dk-tc .dk-row, #dk-lore .dk-row { padding: 12px 0; }
    }
    .dk-pop-h {
      display: flex; justify-content: space-between; align-items: baseline; gap: 10px;
      padding: 6px 10px; border-bottom: 1px solid color-mix(in srgb, var(--dk-edge) 40%, transparent);
    }
    .dk-pop-h strong {
      color: var(--dk-tip-title); font: 700 13.5px/1.3 var(--dk-title-font); letter-spacing: .01em;
    }
    .dk-pop-h span { color: var(--dk-muted); font-size: 11px; }
    .dk-pop-b { padding: 6px 10px; }
    .dk-pop-b > div + div { margin-top: 3px; }
    .dk-pop-b .dk-muted { color: var(--dk-muted); font-size: 11px; }
    .dk-pop-sec {
      margin-top: 7px !important; padding-top: 6px;
      border-top: 1px solid color-mix(in srgb, var(--dk-edge) 35%, transparent);
    }
    .dk-pop-lb {
      font: 700 10.5px/1.3 var(--dk-title-font); text-transform: uppercase; letter-spacing: .08em;
      color: var(--dk-tip-title);
    }
    .dk-pop-list { margin-top: 2px; font-weight: 600; }
    /* A spec-sheet line: "Label: value", label quiet, value plain. */
    .dk-pop-f2 { margin-top: 2px; }
    .dk-pop-f2 b { font-weight: 600; color: var(--dk-muted); }
    /* The half of a combination this wolf already has. */
    .dk-have { color: var(--dk-tip-title); font-weight: 700; }
    .dk-pop-sec .dk-muted { margin-top: 2px; }
    /* The personality card. Disposition colours are fixed rather than themed, so
       Friendly is the same green everywhere, and each carries white text at 5:1
       or better. */
    .dk-pe-dot { display: inline-block; width: 8px; height: 8px; margin-right: 5px; border-radius: 50%; vertical-align: 0; }
    .dk-pe-stats { display: flex; flex-wrap: wrap; gap: 4px; }
    .dk-pe-stats span { padding: 0 6px; border: 1px solid var(--dk-line); background: var(--dk-surface); border-radius: var(--dk-radius); }
    .dk-pe-up2 { font-weight: 700; }
    .dk-pe-dn { color: var(--dk-muted); }
    .dk-pe-soc { display: grid; grid-template-columns: 1fr auto; gap: 1px 12px; font-weight: 400; }
    .dk-pe-soc span:nth-child(2n) { text-align: right; font-variant-numeric: tabular-nums; }
    .dk-pop-b .dk-rc { padding: 4px 0; }
    .dk-pop-b .dk-rc:last-child { border-bottom: 0; }
    .dk-pop-f { padding: 0 10px 7px; font-size: 11px; }
    #dk-pop a { color: var(--dk-accent) !important; text-decoration: none; }
    #dk-pop a:hover { text-decoration: underline; }
    #dk-pop .dk-dm-it { display: flex; justify-content: space-between; gap: 10px; padding: 2px 0; border-bottom: 1px solid var(--dk-line); }
    #dk-pop .dk-linkbtn {
      font: inherit; font-size: 11px; color: var(--dk-accent); background: none; border: 0;
      margin: 0; padding: 0; cursor: pointer;
    }
    #dk-pop .dk-linkbtn:hover { text-decoration: underline; }

    .dk-tag { display: inline-block; font-size: 11px; padding: 1px 6px; border-radius: var(--dk-radius); }
    .dk-tag.dk-good { background: var(--dk-good); color: var(--dk-good-text); }
    .dk-tag.dk-warn { background: var(--dk-warn); color: var(--dk-warn-text); }
  `;
  document.head.appendChild(baseEl);

  // ================================================================= modules

  // A module is { id, name, blurb, start(), stop(), settings(sheet), reload()? }.
  // start/stop must be safe to call repeatedly; stop puts the page back.
  // reload re-reads the module's saved settings after a backup is restored.
  const modules = [];
  const defineModule = (m) => modules.push(m);
  const isOn = (m) => core.enabled[m.id] !== false;

  /* Whose wolf is on screen. Wolvden's header menu links to your own profile,
     and a wolf's page says "Owned by" followed by a link to its owner's. Lore is
     written by a wolf's owner, so this decides whether the Lore panel can be
     edited. Every wolf on the site is drawn with the same markup, so there is no
     other way to tell. */
  const profileOf = (a) => ((a && a.getAttribute('href')) || '').match(/\/profile\/(\d+)/);
  function myProfileId() {
    for (const a of document.querySelectorAll('.dropdown-menu a[href*="/profile/"], a.dropdown-item[href*="/profile/"]')) {
      const m = profileOf(a);
      if (m) return m[1];
    }
    return null;
  }
  function wolfOwner() {
    const main = document.querySelector('#main');
    if (!main) return null;
    for (const a of main.querySelectorAll('a[href*="/profile/"]')) {
      const prev = a.previousSibling;
      const before = prev && prev.nodeType === 3 ? prev.textContent : '';
      if (!/owned by\s*$/i.test(before.replace(/\s+/g, ' '))) continue;
      const m = profileOf(a);
      if (m) return { id: m[1], name: a.textContent.replace(/\s+/g, ' ').trim() };
    }
    return null;
  }
  // true: yours. false: someone else's. null: Twill cannot tell, and then
  // nothing is unlocked and nothing is deleted.
  function wolfIsMine() {
    const me = myProfileId(), owner = wolfOwner();
    if (!me || !owner) return null;
    return me === owner.id;
  }

  // Which kind of Wolvden page this is. Offline test copies in dev/ say what they
  // stand in for with <meta name="dk-fixture" content="den | wolf:<id> | hoard | trades">.
  function currentPage() {
    const meta = document.querySelector('meta[name="dk-fixture"]');
    const fake = meta ? meta.getAttribute('content') || '' : '';
    const path = location.pathname;
    let m;
    if (fake === 'den' || /^\/den(\/\d+)?\/?$/.test(path)) return { kind: 'den' };
    if ((m = fake.match(/^wolf:(\d+)$/)) || (m = path.match(/^\/wolf\/(\d+)/))) return { kind: 'wolf', id: m[1] };
    if ((m = fake.match(/^family:(\d+)$/)) || (m = path.match(/^\/family\/(\d+)/))) return { kind: 'family', id: m[1] };
    if (fake === 'hoard' || /^\/hoard(\/|$)/.test(path)) return { kind: 'hoard' };
    if (fake === 'trades' || /^\/trading-center\/manage(\/|$)/.test(path)) return { kind: 'trades' };
    if ((m = fake.match(/^trade:(\d+)$/)) || (m = path.match(/^\/trade\/(\d+)/))) return { kind: 'trade', id: m[1] };
    if (fake === 'fishing' || /^\/fishing(\/|$)/.test(path)) return { kind: 'fishing' };
    // Exploring happens on a biome's own page, /biome/12 for the Glacier.
    if (fake === 'explore' || /^\/biome\/\d+/.test(path)) return { kind: 'explore' };
    if (fake === 'wardrobe' || /^\/(wardrobe|customi[sz]e)(\/|$)/.test(path)) return { kind: 'wardrobe' };
    return { kind: 'other' };
  }

  // ================================================================= recipes

  // Search over Glyph's catalogue (RECIPE_BOOK, generated near the end of this
  // file). Same rules as Glyph's search(): names that start with the query first.
  const norm = (s) => String(s || '').toLowerCase().split(/\s+/).filter(Boolean).join(' ');

  function recipesNamed(query, limit) {
    const q = norm(query);
    if (!q) return [];
    const starts = [];
    const contains = [];
    for (const r of RECIPE_BOOK.recipes) {
      const n = norm(r.n);
      if (n.startsWith(q)) starts.push(r);
      else if (n.includes(q)) contains.push(r);
    }
    return starts.concat(contains).slice(0, limit || 25);
  }

  // Every recipe wanting an ingredient whose name contains the query. With
  // exact set, only that exact ingredient counts (used for item popovers).
  function recipesUsing(query, exact) {
    const q = norm(query);
    if (!q) return [];
    return RECIPE_BOOK.recipes.filter((r) =>
      r.i.some(([name]) => (exact ? norm(name) === q : norm(name).includes(q))));
  }

  const recipeWiki = (r) => RECIPE_BOOK.wiki + '#' + encodeURIComponent(r.k);

  // The Item Catalogue's own search, opened in a new tab. A plain link: the
  // script never loads it itself.
  const catalogueUrl = (name) => '/item-catalogue?searchTerm=' + encodeURIComponent(name) + '&search=';
  const catLink = (name, text, cls) => h('a', {
    class: 'dk-cat' + (cls ? ' ' + cls : ''), href: catalogueUrl(name), target: '_blank', rel: 'noopener',
    title: 'Find ' + name + ' in the Item Catalogue', text: text || name
  });

  // One recipe as a small block: name, what it takes, where it drops, wiki link.
  // The product and every ingredient link to their Item Catalogue search.
  function recipeBlock(r, highlight) {
    const hl = norm(highlight);
    const ings = h('div', { class: 'dk-rc-ings' });
    r.i.forEach(([name, count], idx) => {
      if (idx) ings.append(h('span', { class: 'dk-rc-sep', text: ' · ' }));
      const hit = hl && norm(name).includes(hl);
      ings.append(count + ' × ', catLink(name, name, hit ? 'dk-rc-hit' : null));
    });
    return h('div', { class: 'dk-rc' },
      h('div', { class: 'dk-rc-top' },
        catLink(r.n, r.n, 'dk-rc-name'),
        h('span', { class: 'dk-rc-kind', text: r.t }),
        h('a', { class: 'dk-rc-wiki', href: recipeWiki(r), target: '_blank', rel: 'noopener', text: 'wiki ›', title: 'This recipe on the Grouse House Wiki' })
      ),
      ings,
      ...r.s.map((s) => h('div', { class: 'dk-rc-src', text: s })),
      r.x ? h('div', { class: 'dk-rc-src', text: r.x }) : null
    );
  }

  // One module failing on an odd page must not take the rest down with it, so
  // every start, stop and reload goes through here and a failure stays its own.
  function safely(m, what) {
    try { m[what](); } catch (err) { console.error('Twill: ' + m.name + ' could not ' + what + ' here.', err); }
  }

  function setModuleOn(m, on) {
    core.enabled[m.id] = on;
    saveCore();
    safely(m, on ? 'start' : 'stop');
  }

  // =============================================================== your things

  /* Everything below is yours and stays in this browser: lore you write on a
     wolf, goals you set for yourself, the Collection you tick, and the wolves
     you pin to the tray. Nothing is ever fetched, and nothing from the site is
     kept beyond those pinned wolves. */

  /* Lore's shape is yours to change: sections and fields you name, reorder, add
     and delete. Two stores, kept apart on purpose:

       denkit:loreplan  the layout, shared by every wolf
       denkit:lore      what you wrote, per wolf, keyed by FIELD ID

     Keying values by id and never by label is what lets a field be renamed
     without losing a word of what is written under it. The nine ids below are
     the ones Twill shipped with, so an existing lore record needs no
     migration: it already uses them. */
  const LORE_TYPES = {
    text: 'Text',
    long: 'Long text',
    tags: 'Tags',
    wolf: 'Wolf link'
  };

  const DEFAULT_LORE = {
    sections: [
      { id: 'who', label: 'Who they are', fields: [
        { id: 'called', label: 'Called', type: 'text', hint: 'what you actually call them' },
        { id: 'pronouns', label: 'Pronouns', type: 'text', hint: 'he/him, she/her, they/them' },
        { id: 'title', label: 'Title', type: 'text', hint: 'an epithet' },
        { id: 'role', label: 'Role', type: 'text', hint: 'in your story, not the game' },
        { id: 'temperament', label: 'Temperament', type: 'text', hint: 'character, not the game stat' },
        { id: 'tags', label: 'Tags', type: 'tags', hint: 'comma separated' }
      ] },
      { id: 'ties', label: 'Ties', fields: [
        { id: 'bonded', label: 'Bonded to', type: 'wolf', hint: 'an id, a /wolf/123 link, or just a name' },
        { id: 'origin', label: 'Origin', type: 'text', hint: 'born here, traded for, found' }
      ] },
      { id: 'tale', label: 'Story', fields: [
        { id: 'story', label: 'Story', type: 'long', hint: '' }
      ] }
    ]
  };

  const TRASH_DAYS = 30;

  let lorePlan = load('loreplan', null);

  function planOK(p) {
    return !!(p && Array.isArray(p.sections) && p.sections.every((s) =>
      s && typeof s.id === 'string' && Array.isArray(s.fields)));
  }

  function reloadPlan() {
    const stored = load('loreplan', null);
    lorePlan = planOK(stored) ? stored : JSON.parse(JSON.stringify(DEFAULT_LORE));
    if (!Array.isArray(lorePlan.trash)) lorePlan.trash = [];
    sweepTrash();
  }

  const savePlan = () => save('loreplan', lorePlan);

  /* A deleted field keeps what you wrote for thirty days so a mis-click is not
     the end of it. Past that the values go too, otherwise the store fills with
     text nothing can ever show again. */
  function sweepTrash() {
    const cutoff = Date.now() - TRASH_DAYS * 864e5;
    const dead = lorePlan.trash.filter((t) => (t.at || 0) < cutoff);
    if (!dead.length) return;
    lorePlan.trash = lorePlan.trash.filter((t) => (t.at || 0) >= cutoff);
    for (const t of dead) {
      for (const rec of Object.values(lore || {})) delete rec[t.field.id];
    }
    savePlan();
    if (lore) save('lore', lore);
  }

  // Every live field, flattened, each remembering the section it sits in.
  function loreFields() {
    const out = [];
    for (const s of lorePlan.sections) {
      for (const f of s.fields) out.push(Object.assign({ section: s.id, sectionLabel: s.label }, f));
    }
    return out;
  }

  const loreField = (id) => loreFields().find((f) => f.id === id) || null;

  // A wolf field stores a bare id where it can, so it can be linked and counted.
  // Anything that is not an id stays as you typed it and simply shows as text.
  function wolfRef(v) {
    const s = String(v == null ? '' : v).trim();
    if (!s) return null;
    const m = s.match(/^(?:https?:\/\/[^/]*wolvden\.com)?\/?(?:wolf\/)?(\d{3,})\/?$/i);
    return m ? { id: m[1] } : { text: s };
  }

  // The name to show for a linked wolf, from whatever Twill already knows.
  function wolfName(id) {
    const l = lore[id];
    if (l && l.called) return l.called;
    if (coll[id] && coll[id].n) return coll[id].n;
    if (ped[id] && ped[id].n) return ped[id].n;
    if (l && l._n) return l._n;
    return '#' + id;
  }

  /* Backlinks. If Styginetta is bonded to Pacholi, Pacholi's page should say so
     without you writing it twice. Computed on every render, never stored, so the
     two halves can never drift apart. */
  function loreMentions(id) {
    const out = [];
    const fields = loreFields().filter((f) => f.type === 'wolf');
    for (const [other, rec] of Object.entries(lore)) {
      if (other === id) continue;
      for (const f of fields) {
        const ref = wolfRef(rec[f.id]);
        if (ref && ref.id === id) out.push({ id: other, label: f.label });
      }
    }
    return out;
  }

  let lore = load('lore', {});
  let goals = load('goals', []);
  // The next two hold wolves pinned in the tray and nothing else: see pruneToTray().
  let ped = load('ped', {});    // wolf id -> { n, gen, coi, inst, lines, a: { id: { d: [depths], p: [slot paths], n } } }
  let coll = load('coll', {});  // wolf id -> { n, b: base, g: genetics, e: eyes, m: [markings] }

  /* The Collection checklist: catalogue keys you ticked yourself, one list per
     table. Nothing here is ever read from a page. */
  const HAVE_TABLES = ['marks', 'bases', 'eyes'];
  const loadHave = () => {
    const s = load('have', {});
    return Object.fromEntries(HAVE_TABLES.map((t) => [t, new Set(Array.isArray(s[t]) ? s[t] : [])]));
  };
  let have = loadHave();
  const saveHave = () => save('have', Object.fromEntries(HAVE_TABLES.map((t) => [t, [...have[t]]])));
  const haveCount = () => HAVE_TABLES.reduce((n, t) => n + have[t].size, 0);

  // Now that the value stores exist, the layout can be read and its thirty-day
  // trash swept; sweepTrash() reaches into `lore` and would hit the temporal
  // dead zone if this ran where reloadPlan is defined.
  reloadPlan();

  function saveLore(id, rec, name) {
    // Anything already written under a field that has since been deleted is left
    // alone: it is in the thirty-day trash and must survive an unrelated save.
    const keep = Object.assign({}, lore[id]);
    for (const f of loreFields()) {
      const v = String(rec[f.id] == null ? '' : rec[f.id]).trim();
      if (v) keep[f.id] = v; else delete keep[f.id];
    }
    const was = keep._n, pub = keep._pub;
    delete keep._n;
    delete keep._pub;
    if (Object.keys(keep).length) {
      // The wolf's own name, taken from its page as you save, so a link to it
      // elsewhere reads as a name. Kept only beside lore you wrote yourself.
      if (name || was) keep._n = name || was;
      // Which fields you have made public, by field id.
      if (Array.isArray(pub) && pub.length) keep._pub = pub;
      lore[id] = keep;
    } else delete lore[id];
    save('lore', lore);
  }

  // Mark one field of one wolf's lore as public or private.
  function setPublic(id, fieldId, on) {
    lore = load('lore', {});
    const rec = lore[id];
    if (!rec) return;
    const pub = new Set(rec._pub || []);
    if (on) pub.add(fieldId); else pub.delete(fieldId);
    if (pub.size) rec._pub = [...pub]; else delete rec._pub;
    save('lore', lore);
  }

  let tray = load('tray', []);
  const saveTray = () => save('tray', tray);

  /* Twill keeps a wolf's details and family tree only while that wolf is in the
     tray, at most 8, and lets them go the moment it leaves. This runs on every
     page load as well as on every tray change, which is also what clears out
     the wider records older versions kept, along with the two stores that no
     longer exist at all: the achievements list and the hoard's item names. */
  function pruneToTray() {
    tray = load('tray', []);
    const keep = new Set(tray);
    for (const [key, set] of [['coll', (v) => { coll = v; }], ['ped', (v) => { ped = v; }]]) {
      const all = load(key, {});
      const gone = Object.keys(all).filter((id) => !keep.has(id));
      for (const id of gone) delete all[id];
      if (gone.length) save(key, all);
      set(all);
    }
    for (const key of ['ach', 'owned']) {
      try { localStorage.removeItem(PREFIX + key); } catch { /* blocked */ }
    }
  }
  pruneToTray();

  /* Combo hunting. A pup can only reach a combo marking when one parent brings
     each of its two colours, on the same shape, in the same slot. Both halves of
     that come off the two pinned wolves' own pages. */
  function combosInReach(a, b) {
    const out = [];
    const shapeAfter = (name, colour) => name.slice(colour.length + 1);
    for (const [colour, pair] of Object.entries(GENETICS.combos || {})) {
      for (const [x, y] of [pair, [pair[1], pair[0]]]) {
        for (const [slotA, ma] of marksOf(a)) {
          for (const [slotB, mb] of marksOf(b)) {
            if (slotA && slotB && slotA !== slotB) continue;
            const na = norm(ma), nb = norm(mb);
            if (!na.startsWith(norm(x) + ' ') || !nb.startsWith(norm(y) + ' ')) continue;
            /* The shapes do not have to match. A pup can take either parent's
               shape, so long as that shape exists in the combo colour, so both
               are candidates and each is checked against the catalogue. */
            for (const shape of new Set([shapeAfter(na, norm(x)), shapeAfter(nb, norm(y))])) {
              const full = colour + ' ' + shape;
              const row = GENETICS.marks[norm(full)];
              if (!row) continue;
              const name = full.replace(/\b\w/g, (c) => c.toUpperCase());
              if (!out.some((o) => o.name === name)) {
                out.push({ name, tier: row[0], from: ma + ' × ' + mb, slot: slotA || slotB });
              }
            }
          }
        }
      }
    }
    return out;
  }

  /* Wright's coefficient of inbreeding for a pup of these two, over the
     ancestors Twill has actually seen.

     Every loop through a shared ancestor adds (1/2)^(n1 + n2 + 1), where n1 and
     n2 are the generations from each parent up to that ancestor, and a loop
     only counts if its two sides have nobody in common but the ancestor. That
     rule is why a tree is kept as lines and not just depths: half-siblings
     share their sire AND his whole line, but his parents are only ever reached
     through him, so they add nothing of their own. Each parent is an ancestor
     of the pup as well, so pairing a wolf with its own offspring counts that
     parent directly, at 25% for a sire and his daughter.

     Unknown ancestors, anything past great-great-grandparents, and each shared
     ancestor's own inbreeding are all left out, and each of them could only
     add: this is a floor, never the whole answer.

     Answers null when a tree was kept without its lines (before 0.32.4, or a
     layout Twill could not read), because a number from depths alone can be
     badly wrong in either direction. */
  const pedLines = (p) => (!Object.keys((p && p.a) || {}).length || p.lines === true ? 'ok'
    : p.lines === false ? 'unreadable' : 'old');

  function pairCoi(idA, pa, idB, pb) {
    if (pedLines(pa) !== 'ok' || pedLines(pb) !== 'ok') return null;
    // Every slot on one side, by its path from that parent: '' is the parent
    // itself, 'S' its sire, 'SD' its sire's dam, and so on.
    const slotsOf = (id, p) => {
      const at = new Map([['', id]]);
      for (const [aid, r] of Object.entries(p.a || {})) for (const path of r.p) at.set(path, aid);
      return at;
    };
    const sa = slotsOf(idA, pa), sb = slotsOf(idB, pb);
    // Everyone on the way from a parent up to a slot, the parent included and
    // the ancestor itself not. An Unknown can never match anybody.
    const between = (at, path, side) => {
      const who = [];
      for (let k = 0; k < path.length; k++) who.push(at.get(path.slice(0, k)) || '?' + side + path.slice(0, k));
      return who;
    };
    const found = new Map();
    for (const [pathA, x] of sa) {
      for (const [pathB, y] of sb) {
        if (x !== y) continue;
        const onB = new Set(between(sb, pathB, 'b'));
        if (between(sa, pathA, 'a').some((w) => onB.has(w))) continue;
        const row = found.get(x) || { id: x, pct: 0, depth: Infinity, self: x === idA || x === idB,
          name: ((pa.a || {})[x] || (pb.a || {})[x] || {}).n || x };
        row.pct += Math.pow(0.5, pathA.length + pathB.length + 1) * 100;
        // How far back, from whichever parent it is nearer. 0 for a parent
        // itself, which the Pairing screen words as one of the pair.
        row.depth = Math.min(row.depth, pathA.length, pathB.length);
        found.set(x, row);
      }
    }
    const shared = [...found.values()].sort((x, y) => y.pct - x.pct);
    return { coi: shared.reduce((n, s) => n + s.pct, 0), shared };
  }

  /* A wolf's generation, as its Family page states it ("3rd"). Wolvden counts
     the longest line back over the whole pedigree, not just the four columns on
     the page, so this is read off the page rather than worked out from the
     tree. A pup is always one more than the higher of its two parents. */
  const genNum = (p) => {
    const m = String((p && p.gen) || '').match(/\d+/);
    return m ? Number(m[0]) : null;
  };
  const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');

  // How far back the recorded tree actually reaches, so a clean answer can say
  // how much of the pedigree it was able to look at.
  const pedDepth = (p) => {
    const all = Object.values((p && p.a) || {}).flatMap((r) => r.d);
    return all.length ? Math.max(...all) : 0;
  };

  // Markings were stored as bare names before v0.8.1 and as [slot, name] after,
  // so read either and hand back the pairs.
  const marksOf = (w) => ((w && w.m) || []).map((m) => (Array.isArray(m) ? m : [null, m]));

  // A pinned wolf's personality, with its disposition, from the tray's record.
  const personalityOf = (w) => (w && w.pe ? PERSONALITY.p[String(w.pe).toLowerCase().replace(/\s+/g, ' ').trim()] || null : null);

  // A catalogue entry's display name. Marking keys are stored folded to lower
  // case and carry no name of their own, so the capitals are put back.
  const geneName = (table, k) => {
    const v = (GENETICS[table] || {})[k];
    return v && v.n ? v.n : k.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // The name in a wolf page's heading. The heading carries decoration icons
  // either side of the name, and the tray's pin button too.
  function wolfPageName() {
    const h1 = document.querySelector('#main h1');
    const head = h1 ? h1.cloneNode(true) : null;
    if (!head) return '';
    for (const b of head.querySelectorAll('button, .dk-pin')) b.remove();
    return head.textContent.replace(/\s+/g, ' ').replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').trim();
  }

  /* What Pair and Compare need from a wolf's own page: its genes, sex and age.
     Only ever called for a wolf in the tray, on that wolf's page. */
  function readWolfPage() {
    const main = document.querySelector('#main');
    if (!main) return null;
    const row = (label) => {
      for (const lab of main.querySelectorAll('td.b')) {
        if (lab.textContent.replace(/\s+/g, ' ').trim() !== label) continue;
        const cell = lab.nextElementSibling;
        if (!cell) return '';
        // The value is the cell's first text. Genetics marks the cell itself and
        // only appends after the value, so this holds whether it ran or not.
        const node = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
        if (node) return node.textContent.replace(/\s+/g, ' ').trim();
        // Some values are links rather than plain text (Carrier Status).
        const link = cell.querySelector('a');
        return link ? link.textContent.replace(/\s+/g, ' ').trim() : '';
      }
      return '';
    };
    // Markings keep their slot, because a combo marking only happens when both
    // parents bring their colour in the same slot.
    const marks = [];
    for (let i = 1; i <= 10; i++) {
      const v = row('Slot ' + i);
      if (v && !/^none\.?$/i.test(v)) marks.push([i, v]);
    }
    const muts = ['Mutation', 'Secondary Mutation', 'Tertiary Mutation']
      .map(row).filter((v) => v && !/^none\.?$/i.test(v));
    const rec = {
      n: wolfPageName(),
      b: row('Base'), g: row('Base Genetics'), e: row('Eyes'), m: marks,
      s: row('Skin'), no: row('Nose'), c: row('Claws'),
      mu: muts, ca: row('Carrier Status'), sx: row('Sex'), ag: row('Age'), pe: row('Personality')
    };
    return rec.b || marks.length ? rec : null;   // null: not a wolf page after all
  }

  // ===================================================================== hub

  const launch = h('button', { id: 'dk-launch', type: 'button', text: 'Twill',
    title: 'Twill (Alt+K)', 'aria-label': 'Twill (Alt+K)' });
  const hub = h('div', { id: 'dk-hub', hidden: true, role: 'dialog', 'aria-label': 'Twill' });
  const fontList = h('datalist', { id: 'dk-fonts' }, ...FONT_SUGGESTIONS.map((f) => h('option', { value: f })));
  document.body.append(launch, hub, fontList);

  let screen = 'home';           // 'home' | 'look' | a module id
  let saveAsOpen = false;        // the inline "name your theme" row on Look
  let pairIds = [];              // the two wolves the tray sent to the Pairing screen

  const BUTTONS = {
    light:  ['Mark, light',  TWILL_MARK],
    dark:   ['Mark, dark',   TWILL_MARK_DARK],
    full:   ['Mark, full colour', TWILL_MARK_FULL],
    label:  ['Button with the name', null]
  };

  // About wears exactly the colourway the corner button wears, with full colour
  // standing in when the button is the plain labelled one and has no mark.
  function aboutMarkSrc() {
    const picked = BUTTONS[core.button] && core.button !== 'label' ? core.button : 'full';
    return BUTTONS[picked][1];
  }

  function placeUi() {
    const c = ['br', 'bl', 'tr', 'tl'].includes(core.corner) ? core.corner : 'br';
    const b = BUTTONS[core.button] ? core.button : 'full';
    launch.className = 'dk-c-' + c + (b === 'label' ? ''
      : ' dk-b-mark dk-b-' + b + (core.buttonPlate ? ' dk-b-plate' : ''));
    launch.textContent = '';
    if (b === 'label') launch.textContent = 'Twill';
    else {
      // The artwork is 165 by 192, so height leads and width follows it.
      const hgt = Math.min(72, Math.max(20, Number(core.buttonSize) || 40));
      launch.append(h('img', {
        src: BUTTONS[b][1], alt: '', width: Math.round(hgt * 165 / 192), height: hgt
      }));
    }
    hub.className = 'dk-c-' + c;
  }

  function toggleHub(force) {
    hub.hidden = force == null ? !hub.hidden : !force;
    if (!hub.hidden) {
      screen = 'home';
      render();
      scheduleClipCheck();
    }
  }

  launch.addEventListener('click', () => toggleHub());

  /* Rows that keep their tail on one line get cut with an ellipsis when the
     tail is long, which is most drop lists on the Battle map and a fair few
     cures on the Illnesses screen. Which rows are actually cut depends on the
     theme's font and the width of the panel, so it is measured after every
     paint rather than guessed at, and only the cut ones become clickable.
     A guide screen repaints itself when you pick a biome without going back
     through render(), which is why this watches the panel instead. */
  function markClipped() {
    if (hub.hidden || !hub.clientWidth) return;
    hub.querySelectorAll('.dk-herb-m, .dk-fr-row').forEach((row) => {
      if (row.classList.contains('dk-ex-open')) return;
      let cut = false;
      for (const kid of row.children) {
        if (kid.scrollWidth > kid.clientWidth + 1) { cut = true; break; }
      }
      row.classList.toggle('dk-can-ex', cut);
      if (cut && !row.title) row.title = 'Click to open it out';
    });
  }

  let clipTick = null;
  function scheduleClipCheck() {
    if (clipTick) return;
    clipTick = requestAnimationFrame(() => { clipTick = null; markClipped(); });
  }
  // childList only: marking a row changes classes and the title, and watching
  // attributes as well would make this observe its own work.
  new MutationObserver(scheduleClipCheck).observe(hub, { childList: true, subtree: true });

  hub.addEventListener('click', (e) => {
    const row = e.target.closest && e.target.closest('.dk-can-ex, .dk-ex-open');
    if (!row || !hub.contains(row)) return;
    row.classList.toggle('dk-ex-open');
    if (!row.classList.contains('dk-ex-open')) scheduleClipCheck();
  });

  /* Which letter a shortcut was pressed with. e.key is right on every layout,
     except that on a Mac, Option changes the letter itself: Option+K types ˚
     and Option+N is a dead key. When e.key is not a plain letter, the physical
     key decides instead. */
  const pressed = (e, letter) => {
    const key = String(e.key || '').toLowerCase();
    return /^[a-z]$/.test(key) ? key === letter : e.code === 'Key' + letter.toUpperCase();
  };

  document.addEventListener('keydown', (e) => {
    if (e.altKey && !e.ctrlKey && !e.metaKey && pressed(e, 'k')) {
      const t = e.target;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) && !hub.contains(t)) return;
      e.preventDefault();
      toggleHub();
    } else if (e.key === 'Escape' && !hub.hidden && hub.contains(document.activeElement)) {
      toggleHub(false);
      launch.focus();
    }
  });

  /* Each open Wolvden tab holds its own copy of what Twill knows. When another
     tab reads a wolf's page or its Family page, or changes the tray, this tab
     takes the newer copy at once: a Pairing or Compare screen left open fills
     itself in, the tray redraws, and the next save here starts from the newer
     copy instead of writing an old one back over it. The browser raises this
     itself for every other tab of the same site; nothing is sent anywhere. */
  window.addEventListener('storage', (e) => {
    if (e.storageArea !== localStorage || !e.key || !e.key.startsWith(PREFIX)) return;
    const key = e.key.slice(PREFIX.length);
    if (key === 'ped') ped = load('ped', {});
    else if (key === 'coll') coll = load('coll', {});
    else if (key === 'tray') tray = load('tray', []);
    else if (key === 'have') have = loadHave();
    else return;
    resync();
  });

  // Tell every module, and any open screen that shows them, that the tray or
  // what Twill keeps for it has changed.
  function resync() {
    for (const m of modules) if (m.sync && isOn(m)) safely(m, 'sync');
    if (!hub.hidden && ['pair', 'compare', 'collection', 'collect', 'pedigree', 'tray'].includes(screen)) render();
  }

  // Where the current screen appends its contents.
  let sheet = null;

  function render() {
    if (hub.hidden) return;
    hub.classList.toggle('dk-hub-wide', screen === 'compare');
    const mod = modules.find((m) => m.id === screen);
    const title = screen === 'home' ? 'Twill'
      : screen === 'look' ? 'Look'
      : screen === 'backup' ? 'Backup'
      : screen === 'recipes' ? 'Recipes'
      : screen === 'modules' ? 'Modules'
      : screen === 'collection' ? 'Collection'
      : screen === 'pair' ? 'Pairing'
      : screen === 'compare' ? 'Compare'
      : screen === 'compose' ? 'Compose a post'
      : screen === 'about' ? 'About'
      : screen === 'guides' ? 'Guides'
      : screen === 'herbs' ? 'Herb map'
      : screen === 'scout' ? 'Scout map'
      : screen === 'rates' ? 'Pass rates'
      : screen === 'ills' ? 'Illnesses'
      : screen === 'prey' ? 'Food map'
      : screen === 'bonds' ? 'Pair bonds'
      : screen === 'battle' ? 'Battle map'
      : screen === 'friend' ? 'Befriending'
      : screen === 'roles' ? 'Roles'
      : (mod ? mod.name : 'Twill');

    hub.textContent = '';
    const head = h('div', { class: 'dk-head' });
    if (screen !== 'home') {
      const upTo = ['herbs', 'scout', 'rates', 'ills', 'prey', 'bonds', 'battle', 'friend', 'roles'].includes(screen) ? 'guides' : 'home';
      head.append(h('button', {
        type: 'button', text: '‹', title: 'Back', 'aria-label': 'Back',
        onclick: () => { screen = upTo; saveAsOpen = false; render(); }
      }));
    }
    // The mark doubles as the way into About, so the credit is never more than
    // one click away without costing a row on any screen.
    head.append(
      h('button', {
        type: 'button', class: 'dk-mark', title: 'About Twill', 'aria-label': 'About Twill',
        onclick: () => { screen = 'about'; render(); }
      }, h('img', { src: TWILL_MARK_DARK, alt: '', width: 19, height: 22 })),
      h('span', { class: 'dk-title', text: title }),
      h('button', {
        type: 'button', class: 'dk-x', text: '×', title: 'Close (Alt+K)', 'aria-label': 'Close',
        onclick: () => toggleHub(false)
      })
    );
    sheet = h('div', { class: 'dk-body' });
    hub.append(head, sheet);

    if (screen === 'home') renderHome();
    else if (screen === 'look') renderLook();
    else if (screen === 'backup') renderBackup();
    else if (screen === 'recipes') renderRecipes();
    else if (screen === 'modules') renderModules();
    else if (screen === 'collection') renderCollection();
    else if (screen === 'pair') renderPair(pairIds);
    else if (screen === 'compare') renderCompare(pairIds);
    else if (screen === 'compose') renderCompose();
    else if (screen === 'about') renderAbout();
    else if (screen === 'guides') renderGuides();
    else if (screen === 'herbs') renderHerbs();
    else if (screen === 'scout') renderScout();
    else if (screen === 'rates') renderRates();
    else if (screen === 'ills') renderIlls();
    else if (screen === 'prey') renderPrey();
    else if (screen === 'bonds') renderBonds();
    else if (screen === 'battle') renderBattle();
    else if (screen === 'friend') renderFriend();
    else if (screen === 'roles') renderRoles();
    else if (mod) mod.settings(sheet);
  }

  /* Guides: reference tables the game does not put anywhere you can read them.

     The two share biomes, which is the point of keeping them together. Scouting
     says which stat opens a biome; the herb map says what grows there once it is
     open. So the Scout map can answer the question you actually have, which is
     not "what stat is the Taiga" but "is it worth the trip".

     Facts come from the wiki snapshot through tools/export_guides.py. As with
     genetics, only facts travel and Twill words every line itself. */

  function renderGuides() {
    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: '9 references drawn from the Grouse House Wiki and kept offline, so nothing is fetched and nothing watches your pack. They are joined up: search an illness in the herb map and it finds the herbs that cure it.' }));
    const row = (label, go, sub) => sheet.append(h('div', { class: 'dk-row dk-link', onclick: go },
      h('div', { class: 'dk-t' }, h('strong', { text: label }), h('span', { text: sub })),
      h('button', { type: 'button', class: 'dk-chev', text: '\u203a', 'aria-label': label })));
    const herbCount = Object.keys(GUIDES.herbs || {}).length;
    row('Herb map', () => { screen = 'herbs'; render(); },
      herbCount + ' herbs, where they grow, what they mix into');
    row('Scout map', () => { screen = 'scout'; render(); },
      (GUIDES.biomes || []).length + ' biomes and the stat each one takes');
    row('Pass rates', () => { screen = 'rates'; render(); },
      'What a mutation pairing actually gives you');
    row('Illnesses', () => { screen = 'ills'; render(); },
      (GUIDES.ills || []).length + ' of them, what they cost and what cures them');
    row('Food map', () => { screen = 'prey'; render(); },
      (GUIDES.prey || []).length + ' prey, and the trails they are on');
    row('Pair bonds', () => { screen = 'bonds'; render(); },
      'How many pair breedings your territory allows');
    row('Battle map', () => { screen = 'battle'; render(); },
      (GUIDES.enemies || []).length + ' enemies, where they are and what they drop');
    row('Befriending', () => { screen = 'friend'; render(); },
      'Every move against every disposition');
    row('Roles', () => { screen = 'roles'; render(); },
      'What each role runs on, and how it improves');
    sheet.append(h('div', { class: 'dk-note',
      text: 'Captured ' + (GUIDES.exported || '') + '. Re-run tools/export_guides.py to refresh.' }));
  }

  // Which biome is being looked at on the Herb map. Kept outside the render so
  // switching back and forth does not lose your place.
  /* "Cures any illness and gives illness immunity for three rollovers." is a
     sentence; a 320px column needs "any illness". The full text stays on the
     row's title attribute, so nothing is actually lost. */
  function shortUse(u) {
    let s = String(u || '').replace(/^cures\s+/i, '').replace(/\.$/, '');
    s = s.split(/,| and /)[0].trim();
    return s.length > 24 ? s.slice(0, 23) + '…' : s;
  }

  let herbBiome = '';
  let herbQuery = '';

  function renderHerbs() {
    const herbs = GUIDES.herbs || {};
    const meds = GUIDES.meds || {};
    const biomes = GUIDES.biomes || [];

    const find = h('input', {
      type: 'text', value: herbQuery, placeholder: 'Herb, medicine or illness',
      'aria-label': 'Search the herb map', spellcheck: false
    });
    const chips = h('div', { class: 'dk-chips' });
    const list = h('div');
    sheet.append(find, chips, list);

    const chip = (label, value, title) => {
      const b = h('button', {
        type: 'button', class: 'dk-chip' + (herbBiome === value ? ' dk-chip-on' : ''),
        text: label, title: title || '',
        onclick: () => { herbBiome = herbBiome === value ? '' : value; paint(); }
      });
      chips.append(b);
    };

    function paint() {
      chips.textContent = '';
      chip('Everywhere', '', 'Every herb, whatever biome it grows in');
      for (const b of biomes) {
        const n = Object.values(herbs).filter((x) => x.b.includes(b)).length;
        chip(b, b, n + ' herbs grow here');
      }

      const q = norm(find.value);
      list.textContent = '';
      let shown = 0;
      for (const [name, herb] of Object.entries(herbs).sort((a, b) => a[0].localeCompare(b[0]))) {
        if (herbBiome && !herb.b.includes(herbBiome)) continue;
        if (q) {
          // Searching an illness should find the herb that cures it, which means
          // reaching through the medicine to what it treats.
          const blob = norm(name + ' ' + herb.m.map(([m]) => m + ' ' + ((meds[m] || {}).u || '')).join(' '));
          if (!blob.includes(q)) continue;
        }
        shown++;
        const card = h('div', { class: 'dk-find dk-find-card dk-herb' });
        card.append(h('div', { class: 'dk-herb-h' },
          h('strong', { text: name }),
          h('span', { class: 'dk-herb-where',
            text: herb.all ? 'every biome' : herb.b.length + (herb.b.length === 1 ? ' biome' : ' biomes') })));
        for (const [m, q2] of herb.m) {
          const use = (meds[m] || {}).u || '';
          card.append(h('div', { class: 'dk-herb-m', title: use },
            h('span', { text: m + (q2 > 1 ? '  \u00d7' + q2 : '') }),
            h('em', { text: shortUse(use) })));
        }
        if (!herb.all) {
          card.append(h('div', { class: 'dk-herb-b', text: herb.b.join('  \u00b7  ') }));
        }
        list.append(card);
      }
      if (!shown) {
        list.append(h('div', { class: 'dk-empty', text: 'Nothing matches. Try a biome, a herb, a medicine, or an illness like "cough".' }));
      }
    }

    let tid = null;
    find.addEventListener('input', () => {
      herbQuery = find.value;
      clearTimeout(tid); tid = setTimeout(paint, 120);
    });
    paint();
  }

  function renderScout() {
    const scout = GUIDES.scout || {};
    const herbs = GUIDES.herbs || {};
    const starters = new Set(GUIDES.starters || []);

    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: 'Each biome is scouted against one stat, so a scout who is wrong for a biome unlocks less of it per trip. Grouped by the stat they need.' }));

    const byStat = {};
    for (const [b, s] of Object.entries(scout)) (byStat[s] = byStat[s] || []).push(b);

    for (const stat of Object.keys(byStat).sort()) {
      sheet.append(h('div', { class: 'dk-lb', text: stat }));
      for (const b of byStat[stat].sort()) {
        // Counting the herbs answers the question behind the question: whether
        // the biome is worth the trip, not merely which stat it wants.
        const only = Object.entries(herbs).filter(([, x]) => !x.all && x.b.includes(b));
        const all = Object.values(herbs).filter((x) => x.b.includes(b)).length;
        const rare = only.filter(([, x]) => x.b.length <= 2).map(([n]) => n);
        const diff = (GUIDES.difficulty || {})[b] || '';
        sheet.append(h('div', { class: 'dk-find dk-find-card dk-herb' },
          h('div', { class: 'dk-herb-h' },
            h('strong', { text: b }),
            diff ? h('span', { class: 'dk-diff dk-diff-' + diff.toLowerCase(), text: diff }) : null,
            h('span', { class: 'dk-herb-where', text: starters.has(b) ? 'starter' : '' })),
          h('div', { class: 'dk-herb-m' },
            h('span', { text: all + ' herbs grow here' }),
            h('em', { text: rare.length ? 'hard to find elsewhere' : '' })),
          rare.length ? h('div', { class: 'dk-herb-b', text: rare.join('  \u00b7  ') }) : null));
      }
    }
    sheet.append(h('div', { class: 'dk-note',
      text: 'Retiring your lead wolf resets the map to your home biome and up to 2 neighbours, so anything further out is scouted again.' }));
    sheet.append(h('div', { class: 'dk-note',
      text: 'Difficulty decides how much of the progress bar one scout fills. The wiki says it exists but never lists it per biome, so those 4 labels come from the scouting map players pass around rather than from the game itself.' }));
  }

  /* Pass rates: what a mutation pairing actually gives you.

     A stacked bar rather than a table, because the question is "how much of this
     is wasted" and a row of percentages makes you do that sum yourself. The one
     result worth noticing is Mutation x Non-carrier: it can never give a mutated
     pup, only a carrier, which the table states as a flat 0% and which is easy
     to read past. */
  function renderRates() {
    const rates = GUIDES.rates || [];
    const OUT = [
      ['Mutation', 'dk-rate-mut'],
      ['Carrier', 'dk-rate-car'],
      ['Non-carrier', 'dk-rate-non']
    ];

    // Split the bundled mutation list by how it is obtained, so the counts in
    // the text below can never drift from the data.
    const byType = { genetic: [], applicator: [], random: [] };
    for (const m of Object.values(GENETICS.muts || {})) {
      if (byType[m.t]) byType[m.t].push(m.n);
    }
    const piebald = byType.applicator.filter((n) => /^Piebald/.test(n)).length;
    const patches = byType.applicator.filter((n) => /^Patches/.test(n)).length;
    const list = (a) => a.slice().sort().join(', ');

    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: 'Wolvden has 3 kinds of mutation and they are inherited in 3 completely different ways. Only the recessive ones use the table below.' }));

    sheet.append(h('div', { class: 'dk-lb', text: 'Recessive  \u00b7  ' + byType.genetic.length + ', the ones this table is about' }));
    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: list(byType.genetic) + '. These come from hidden genes, and hidden genes are recessive, so BOTH parents must carry one for a pup to have any chance of showing it. All ' + byType.genetic.length + ' pass at the rates below.' }));
    sheet.append(h('div', { class: 'dk-note',
      text: 'Hidden genes only enter your pack on newly generated wolves: a new lead wolf, a wolf befriended in explore, or one made in the Customizer. A newly generated wolf can carry at most one, so there is no such thing as a double carrier straight out of explore. Gene\u2019s Hollow tells you what a wolf carries.' }));

    for (const r of rates) {
      const by = {};
      for (const [k, v] of r.o) by[k] = v;
      const bar = h('div', { class: 'dk-rate-bar' });
      for (const [key, cls] of OUT) {
        const v = by[key] || 0;
        if (!v) continue;
        bar.append(h('span', { class: cls, style: 'width:' + v + '%', title: v + '% ' + key }));
      }
      const legend = h('div', { class: 'dk-rate-legend' });
      for (const [key, cls] of OUT) {
        const v = by[key];
        if (v == null) continue;
        legend.append(h('span', { class: 'dk-rate-k' },
          h('i', { class: cls }), h('span', { text: v + '% ' + key.toLowerCase() })));
      }
      sheet.append(h('div', { class: 'dk-find dk-find-card dk-rate' },
        h('div', { class: 'dk-rate-h' }, h('strong', { text: r.p.join('  \u00d7  ') }),
          // Only worth saying where it is a surprise: a parent that visibly has
          // the mutation, and still no chance of a mutated pup. On Non-carrier x
          // Non-carrier the same badge is just noise.
          (!by.Mutation && r.p.some((x) => /^mutation$/i.test(x)))
            ? h('em', { text: 'never a mutated pup' }) : null),
        bar, legend));
    }

    sheet.append(h('div', { class: 'dk-lb', text: 'The genetic mutations' }));
    for (const [name, slot] of Object.entries(GUIDES.genetic || {})) {
      sheet.append(h('div', { class: 'dk-herb-m' },
        h('span', { text: name }), h('em', { text: slot })));
    }
    sheet.append(h('div', { class: 'dk-note',
      text: 'A carrier shows nothing on its own page unless you have had its genetics read, and it can still pass the gene either way.' }));

    /* The other two kinds. Neither uses the table above, and confusing an
       applicator mutation for a recessive one is the easiest mistake to make
       here: they look identical on a wolf's page. */
    sheet.append(h('div', { class: 'dk-lb',
      text: 'Applicator  ·  ' + byType.applicator.length + ' (' + piebald + ' Piebald, ' + patches + ' Patches)' }));
    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: 'Applied directly with a Mutie on Demand applicator, to a wolf that has no secondary mutation yet. Every one of them fills the Secondary Mutation slot.' }));
    sheet.append(h('div', { class: 'dk-note',
      text: 'They do pass to pups, with a small chance, but they are NOT recessive and cannot be carried. A pup can only get one if a parent visibly has that exact mutation, so there is no hidden version travelling down the generations and no carrier to test for.' }));
    for (const n of byType.applicator.slice().sort()) {
      sheet.append(h('div', { class: 'dk-herb-m' },
        h('span', { text: n }), h('em', { text: 'Secondary Mutation' })));
    }

    sheet.append(h('div', { class: 'dk-lb', text: 'Random chance  ·  ' + byType.random.length + ' in this copy' }));
    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: 'These can turn up in any breeding at all, with no carrier and no applicator involved. The chance is very low: you could breed hundreds of pups and never see one. Secondary and tertiary random mutations appear to be a little more common than primary ones.' }));
    sheet.append(h('div', { class: 'dk-note',
      text: '2 things are said to raise the odds. A mother with lower fertility gives a small boost, and a Wolf Meat item raises the chance for one pup in her next litter.' }));
    for (const n of byType.random.slice().sort()) {
      const m = Object.values(GENETICS.muts || {}).find((x) => x.n === n) || {};
      sheet.append(h('div', { class: 'dk-herb-m' },
        h('span', { text: n }), h('em', { text: m.slot || 'Mutation' })));
    }

    sheet.append(h('div', { class: 'dk-lb', text: 'The 3 slots' }));
    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: 'Every wolf has a Mutation slot, a Secondary Mutation slot and a Tertiary Mutation slot, so up to 3 at once. Each mutation is assigned to one specific slot and can never appear in another. Big changes of shape take the primary slot; overlays and smaller changes take secondary or tertiary. Not every combination stacks.' }));
    sheet.append(h('div', { class: 'dk-note',
      text: 'Captured ' + (GENETICS.exported || '') + '. Wolvden’s own mutation page listed 11 random mutations at that point and this copy holds ' + byType.random.length + '; if you find one missing, tell Fallowe rather than trusting the count.' }));
  }

  /* Illnesses: what each one costs, and the whole chain out of it.

     An illness on its own is half an answer. Twill already holds the
     medicines and the herbs, so each illness names its cure, what that cure is
     mixed from, and therefore which biomes you need. All eighteen double mood
     loss at rollover, which is said once rather than on every row.

     Note on the data: "Breeding Effect" has three values and one of them is
     "Contagious", meaning it passes to the mate. That is separate from the
     rollover spread chance in the next column, and is not a misplaced cell. */
  function renderIlls() {
    const ills = GUIDES.ills || [];
    const meds = GUIDES.meds || {};
    const herbs = GUIDES.herbs || {};

    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: 'Every illness doubles mood loss at rollover, on top of what is listed here.' }));

    for (const il of ills) {
      const card = h('div', { class: 'dk-find dk-find-card dk-herb' });
      const bad = /lethal/i.test(il.o || '');
      card.append(h('div', { class: 'dk-herb-h' },
        h('strong', { text: il.n }),
        bad ? h('span', { class: 'dk-diff dk-diff-challenging', text: 'lethal' }) : null,
        h('span', { class: 'dk-herb-where', text: il.hp && il.hp !== 'None' ? il.hp : '' })));

      const facts = [];
      if (il.br && il.br !== 'None') {
        facts.push(il.br === 'Contagious' ? 'passes through breeding' : il.br.toLowerCase());
      }
      if (il.sp && il.sp !== 'Not Contagious') facts.push(il.sp + ' to spread each rollover');
      if (il.en && il.en !== 'None') facts.push(il.en.toLowerCase());
      if (facts.length) card.append(h('div', { class: 'dk-herb-b', text: facts.join('  \u00b7  ') }));
      if (il.o && il.o !== 'None') card.append(h('div', { class: 'dk-herb-b', text: il.o }));

      if (il.cure) {
        const r = meds[il.cure];
        card.append(h('div', { class: 'dk-herb-m' },
          h('span', { text: il.cure }),
          h('em', { text: r ? r.r.map(([n, q]) => n + (q > 1 ? ' \u00d7' + q : '')).join(', ') : '' })));
        if (r) {
          const where = new Set();
          let everywhere = false;
          for (const [hn] of r.r) {
            const hb = herbs[hn];
            if (!hb) continue;
            if (hb.all) { everywhere = true; continue; }
            for (const b of hb.b) where.add(b);
          }
          const txt = where.size ? [...where].join('  \u00b7  ')
            : everywhere ? 'its herbs grow everywhere' : '';
          if (txt) card.append(h('div', { class: 'dk-herb-b', text: txt }));
        }
      }
      sheet.append(card);
    }
  }

  // Food map. The list is long, so it reads by biome first: the question is
  // what can be hunted where you live, not what exists.
  let preyBiome = '';

  function renderPrey() {
    const prey = GUIDES.prey || [];
    const biomes = GUIDES.biomes || [];
    const chips = h('div', { class: 'dk-chips' });
    const list = h('div');
    sheet.append(chips, list);

    const paint = () => {
      chips.textContent = '';
      const chip = (label, value) => chips.append(h('button', {
        type: 'button', class: 'dk-chip' + (preyBiome === value ? ' dk-chip-on' : ''), text: label,
        onclick: () => { preyBiome = preyBiome === value ? '' : value; paint(); }
      }));
      chip('Everywhere', '');
      for (const b of biomes) chip(b, b);

      list.textContent = '';
      const cats = [];
      for (const pr of prey) if (!cats.includes(pr.c)) cats.push(pr.c);
      let shown = 0;
      for (const c of cats) {
        const inCat = prey.filter((x) => x.c === c
          && (!preyBiome || x.w.some(([b]) => b === preyBiome)));
        if (!inCat.length) continue;
        list.append(h('div', { class: 'dk-lb', text: c }));
        // Biggest first: choosing a trail, uses is the number that matters,
        // not the alphabet.
        for (const x of inCat.slice().sort((a, b) => b.u - a.u)) {
          shown++;
          const trails = preyBiome
            ? x.w.filter(([b]) => b === preyBiome).map(([, tr]) => tr)
            : [...new Set(x.w.map(([b]) => b))];
          list.append(h('div', { class: 'dk-find dk-find-card dk-herb' },
            h('div', { class: 'dk-herb-h' }, h('strong', { text: x.n }),
              h('span', { class: 'dk-herb-where', text: x.u + (x.u === 1 ? ' use' : ' uses') })),
            h('div', { class: 'dk-herb-b', text: trails.join('  \u00b7  ') })));
        }
      }
      if (!shown) list.append(h('div', { class: 'dk-empty', text: 'Nothing hunts here.' }));
    };
    paint();
  }

  /* Pair bonds. Twenty-one rows of a table that is really one rule, so the rule
     is answered directly and the table is kept underneath for checking. */
  function renderBonds() {
    const pairs = GUIDES.pairs || [];
    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: 'A pair bond lets a non-breeding male father pups with one partner. How many pair breedings you get is set by your territory.' }));

    sheet.append(h('div', { class: 'dk-lb', text: 'Your territory' }));
    const inp = h('input', { type: 'number', min: '0', step: '10', placeholder: 'e.g. 60', 'aria-label': 'Territory' });
    const answer = h('div', { class: 'dk-bond-answer' });
    const work = () => {
      const v = Number(inp.value);
      answer.textContent = '';
      if (!inp.value || isNaN(v) || v < 0) return;
      let got = null;
      for (const [terr, breed, under] of pairs) {
        if (under) { if (v < terr) got = breed; continue; }
        if (v >= terr) got = breed;
      }
      if (got == null) return;
      const next = pairs.find(([terr, , under]) => !under && terr > v);
      answer.append(h('strong', { text: got + (got === 1 ? ' pair breeding' : ' pair breedings') }),
        h('span', { text: next ? '  \u00b7  ' + (next[0] - v) + ' more territory for ' + next[1] : '  \u00b7  the most there is' }));
    };
    inp.addEventListener('input', work);
    sheet.append(inp, answer);

    sheet.append(h('div', { class: 'dk-lb', text: 'The whole table' }));
    for (const [terr, breed, under] of pairs) {
      sheet.append(h('div', { class: 'dk-herb-m' },
        h('span', { text: (under ? 'under ' : '') + terr + ' territory' }),
        h('em', { text: String(breed) })));
    }
    sheet.append(h('div', { class: 'dk-note',
      text: 'Disbanding a bond empties both wolves\u2019 mood and starts a 30 rollover cooldown, so play with them before the next rollover.' }));
  }

  /* Battle map: which enemies are in a biome, how hard, and what they leave.

     Sorted by level, because the question when you arrive somewhere new is what
     will kill you, not what is alphabetically first. Epic enemies are marked:
     they use the same wiki template as everything else and are only told apart
     by which section they sit in. */
  let battleBiome = '';
  let battleQuery = '';

  function renderBattle() {
    const enemies = GUIDES.enemies || [];
    const biomes = GUIDES.biomes || [];
    const find = h('input', {
      type: 'text', value: battleQuery, placeholder: 'Enemy, modifier or drop',
      'aria-label': 'Search the battle map', spellcheck: false
    });
    const chips = h('div', { class: 'dk-chips' });
    const list = h('div');
    sheet.append(find, chips, list);

    const paint = () => {
      chips.textContent = '';
      const chip = (label, value) => chips.append(h('button', {
        type: 'button', class: 'dk-chip' + (battleBiome === value ? ' dk-chip-on' : ''), text: label,
        onclick: () => { battleBiome = battleBiome === value ? '' : value; paint(); }
      }));
      chip('Everywhere', '');
      for (const b of biomes) chip(b, b);

      const q = norm(find.value);
      list.textContent = '';
      let shown = 0;
      const rows = enemies
        .filter((e) => !battleBiome || e.b.includes(battleBiome))
        .filter((e) => !q || norm(e.n + ' ' + e.mo.join(' ') + ' ' + e.d.join(' ')).includes(q))
        .slice()
        .sort((a, b) => (a.lv[0] || 0) - (b.lv[0] || 0));
      for (const e of rows) {
        shown++;
        const card = h('div', { class: 'dk-find dk-find-card dk-herb' });
        card.append(h('div', { class: 'dk-herb-h' },
          h('strong', { text: e.n }),
          e.e ? h('span', { class: 'dk-diff dk-diff-challenging', text: 'epic' }) : null,
          h('span', { class: 'dk-herb-where',
            text: e.lv.length ? (e.lv[0] === e.lv[1] ? 'level ' + e.lv[0] : 'level ' + e.lv[0] + '\u2013' + e.lv[1]) : '' })));
        const bits = [];
        if (e.st.length) bits.push('fights on ' + e.st.join(', '));
        if (e.mo.length) bits.push(e.mo.join(', '));
        if (bits.length) card.append(h('div', { class: 'dk-herb-b', text: bits.join('  \u00b7  ') }));
        if (!battleBiome && e.b.length) {
          card.append(h('div', { class: 'dk-herb-b',
            text: e.b.length === (GUIDES.biomes || []).length ? 'every biome' : e.b.join('  \u00b7  ') }));
        }
        if (e.d.length) {
          card.append(h('div', { class: 'dk-lb', text: 'Drops' }));
          card.append(h('div', { class: 'dk-herb-b', text: e.d.join('  ·  ') }));
        }
        list.append(card);
      }
      if (!shown) list.append(h('div', { class: 'dk-empty', text: 'Nothing matches.' }));
    };
    let tid = null;
    find.addEventListener('input', () => {
      battleQuery = find.value;
      clearTimeout(tid); tid = setTimeout(paint, 120);
    });
    paint();
  }

  /* Befriending: every move against every disposition.

     This is reference, the same as the wiki page it came from, and it lives in
     the hub where you look things up. Twill deliberately does NOT put it on
     the befriending screen itself: a table you consult is a guide, and the same
     table beside a live encounter, pointing at the best move, is the kind of
     thing that needs asking staff about first. */
  function renderFriend() {
    const disp = GUIDES.disp || [];
    const moves = GUIDES.moves || [];
    const CLASS = {
      'Very Positive': 'dk-v2', 'Positive': 'dk-v1',
      'Negative': 'dk-v-1', 'Very Negative': 'dk-v-2'
    };
    const SHORT = { 'Very Positive': '++', 'Positive': '+', 'Negative': '\u2013', 'Very Negative': '\u2013\u2013' };

    sheet.append(h('div', { class: 'dk-note', style: 'margin-top:0',
      text: 'Each arrow is 10% on the tracker. A wolf\u2019s disposition shows after your first move, or straight away with the Body Language talent.' }));

    const head = h('div', { class: 'dk-fr-row dk-fr-head' }, h('span', { class: 'dk-fr-m' }));
    // Spell the columns out before the table, left to right, since four
    // letters of a word is not a word.
    const key = h('div', { class: 'dk-fr-cols' });
    for (const d of disp) {
      key.append(h('span', {}, h('b', { text: d.slice(0, 4).toUpperCase() }),
        document.createTextNode(' ' + d)));
    }
    sheet.append(key);
    for (const d of disp) head.append(h('span', { class: 'dk-fr-c', title: d, text: d.slice(0, 4) }));
    sheet.append(head);

    for (const mv of moves) {
      const row = h('div', { class: 'dk-fr-row' }, h('span', { class: 'dk-fr-m', text: mv.n }));
      for (const v of mv.v) {
        row.append(h('span', { class: 'dk-fr-c ' + (CLASS[v] || ''), text: SHORT[v] || '', title: v }));
      }
      sheet.append(row);
    }

    sheet.append(h('div', { class: 'dk-lb', text: 'Reading it' }));
    for (const [k, v] of Object.entries(SHORT)) {
      sheet.append(h('div', { class: 'dk-fr-key' },
        h('i', { class: CLASS[k] }), h('span', { text: v + '   ' + k.toLowerCase() })));
    }
  }

  // Roles: what each one actually runs on. The wiki states these in prose
  // scattered over three pages; here they sit together.
  function renderRoles() {
    for (const r of (GUIDES.roles || [])) {
      sheet.append(h('div', { class: 'dk-find dk-find-card dk-herb' },
        h('div', { class: 'dk-herb-h' }, h('strong', { text: r.n }),
          h('span', { class: 'dk-herb-where', text: r.uses.join(' + ') })),
        h('div', { class: 'dk-herb-b', text: r.how })));
    }
    sheet.append(h('div', { class: 'dk-note',
      text: 'Party synergy is the average of each wolf\u2019s own synergy, gained 2 to 5 a hunt in a party of 2 or more, and it decays a little daily. Personality does not affect it.' }));
    sheet.append(h('div', { class: 'dk-note',
      text: 'A pack can have at most 3 foragers, and there is no way to raise that.' }));
  }

  // About: who made it, how to reach them, where the facts came from, and the
  // rules it keeps. Everything a stranger who was handed the file should read.
  function renderAbout() {
    sheet.append(
      // About wears whichever mark the corner button wears, always the same one.
      h('div', { class: 'dk-about-mark' }, h('img', {
        src: aboutMarkSrc(), alt: 'Twill', width: 82, height: 96
      })),
      h('div', { class: 'dk-about-name', text: 'Twill' }),
      h('div', { class: 'dk-about-ver', text: 'version ' + VERSION }),
      h('div', { class: 'dk-note', style: 'margin-top:10px',
        text: 'Twill reads the page you already have open, allows you to expand on details you otherwise would need a separate document to do and gives you space to grow your pack in a lore rich environment.' }),
      h('div', { class: 'dk-note', text: 'Hover over a gene and get expanded details on where it comes from, how it might look bred with another marking and if they can be a combo. Maybe you want to add more detail to your wolf that you simply do not have the ability to see at a glance without a separate lore document. Breeding challenges and planning your pack has become easier than ever.' }),
      h('div', { class: 'dk-note', text: 'Twill will never play the game for you, we leave that to you!' }),

      h('div', { class: 'dk-lb', text: 'Society of Fur' }),
      h('div', { class: 'dk-about-sof' },
        h('a', { href: SOF_DISCORD, target: '_blank', rel: 'noopener noreferrer', class: 'dk-sof-chip',
                 title: 'Join the Society of Fur on Discord', 'aria-label': 'Join the Society of Fur on Discord' },
          h('img', { src: SOF_LOGO, alt: 'Society of Fur', width: 44, height: 44 })),
        h('div', { class: 'dk-about-links' },
          h('a', { href: SOF_DISCORD, target: '_blank', rel: 'noopener noreferrer', text: 'Join us on Discord' }),
          h('a', { href: SOF_GUILD, target: '_blank', rel: 'noopener noreferrer', text: 'The guild on Wolvden' }))),

      h('div', { class: 'dk-lb', text: 'What it will not do' }),
      h('div', { class: 'dk-note', style: 'margin-top:0',
        text: 'Twill only ever reads a page you opened yourself, and keeps nothing from the site beyond the few wolves you pin to the tray. It never clicks, submits, fetches, refreshes, or plays anything for you. There is no server and no account, so nothing you write into it ever leaves this browser.' }),

      h('div', { class: 'dk-lb', text: 'Credit' }),
      h('div', { class: 'dk-note', style: 'margin-top:0' },
        'Game facts come from the ',
        h('a', { href: GENETICS.wiki, target: '_blank', rel: 'noopener noreferrer', text: 'Grouse House Wiki' }),
        '. Twill writes all content independently from facts collected across the wiki, Wolvden and community discussion.'),
      h('div', { class: 'dk-note' },
        'Wolvden is by Lioden Ltd. This is an unofficial fan tool, not affiliated with them.'),
      h('div', { class: 'dk-note' },
        'By ',
        h('a', { href: SOF_PROFILE, target: '_blank', rel: 'noopener noreferrer', text: 'Fallowe' })),

      h('div', { class: 'dk-lb', text: 'Licence' }),
      h('div', { class: 'dk-note', style: 'margin-top:0' },
        'Twill is free to use and free to pass on, and it asks to be passed on whole. ',
        h('a', { href: TWILL_LICENCE, target: '_blank', rel: 'noopener noreferrer',
                 text: 'Read the licence' }),
        '.')
    );
  }

  // Home is the search box and your goals. The module switches moved to their own
  // screen, so the first thing the hub shows is what you came to do.
  let homeQuery = '';

  function renderHome() {
    const find = h('input', {
      type: 'text', value: homeQuery, placeholder: 'Search everything',
      'aria-label': 'Search Twill', spellcheck: false
    });
    const results = h('div');
    const rest = h('div');
    sheet.append(find, results, rest);

    const paint = () => {
      homeQuery = find.value;
      results.textContent = '';
      rest.hidden = !!homeQuery.trim();
      if (homeQuery.trim()) renderSearch(results, homeQuery);
    };
    let t = null;
    find.addEventListener('input', () => { clearTimeout(t); t = setTimeout(paint, 120); });

    renderGoals(rest);

    const on = modules.filter(isOn).length;
    const row = (label, go, sub) => rest.append(h('div', { class: 'dk-row dk-link', onclick: go },
      h('div', { class: 'dk-t' }, h('strong', { text: label }), sub ? h('span', { text: sub }) : null),
      h('button', { type: 'button', class: 'dk-chev', text: '›', 'aria-label': label })
    ));
    rest.append(h('div', { class: 'dk-lb', text: 'Twill' }));
    row('Modules', () => { screen = 'modules'; render(); }, on + ' of ' + modules.length + ' on');
    row('Collection', () => { screen = 'collection'; render(); }, haveCount() ? haveCount().toLocaleString('en-GB') + ' ticked' : 'a checklist you tick yourself');
    row('Compose a post', () => { screen = 'compose'; render(); }, 'checks what Wolvden will strip');
    row('Look  ·  ' + themeLabel(), () => { screen = 'look'; render(); });
    row('Backup', () => { screen = 'backup'; render(); });
    row('Guides', () => { screen = 'guides'; render(); }, '9 references, kept offline');
    row('About', () => { screen = 'about'; render(); }, 'Society of Fur  ·  version ' + VERSION);

    paint();
  }

  // Goals are yours to write. A goal can carry a counter, and where Twill
  // already counts the thing (markings ticked in your Collection) it fills that
  // in itself rather than asking you to keep score.
  function renderGoals(box) {
    box.append(h('div', { class: 'dk-lb', text: 'Goals' }));
    const list = h('div');
    box.append(list);

    const paint = () => {
      list.textContent = '';
      if (!goals.length) {
        list.append(h('div', { class: 'dk-empty', text: 'Nothing yet. Write what you are working towards.' }));
      }
      goals.forEach((g, i) => {
        const tick = h('input', {
          type: 'checkbox', checked: !!g.done, 'aria-label': 'Done: ' + g.text,
          onchange: (e) => { g.done = e.target.checked; saveGoals(); paint(); }
        });
        const auto = goalProgress(g);
        list.append(h('div', { class: 'dk-goal' + (g.done ? ' dk-done' : '') },
          tick,
          h('div', { class: 'dk-goal-t' },
            h('span', { text: g.text }),
            auto ? h('span', { class: 'dk-goal-n', text: auto }) : null),
          h('button', {
            type: 'button', class: 'dk-goal-x', text: '×', title: 'Remove', 'aria-label': 'Remove ' + g.text,
            onclick: () => { goals.splice(i, 1); saveGoals(); paint(); }
          })
        ));
      });
    };

    const input = h('input', { type: 'text', placeholder: 'Add a goal, then Enter', 'aria-label': 'New goal' });
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !input.value.trim()) return;
      e.preventDefault();
      goals.push({ text: input.value.trim(), done: false });
      saveGoals();
      input.value = '';
      paint();
    });
    box.append(input);
    paint();
  }

  const saveGoals = () => save('goals', goals);

  // If a goal names something Twill counts, show the count beside it.
  function goalProgress(g) {
    const t = norm(g.text);
    if (/marking/.test(t)) {
      const n = have.marks.size;
      if (n) return n + ' of ' + Object.keys(GENETICS.marks).length + ' markings';
    }
    return null;
  }

  function renderModules() {
    for (const m of modules) {
      const on = isOn(m);
      // A module with its own window (Notepad) opens that instead of a settings screen.
      const open = m.open
        ? () => { if (!isOn(m)) setModuleOn(m, true); toggleHub(false); m.open(); }
        : () => { screen = m.id; render(); };
      sheet.append(h('div', { class: 'dk-row' },
        h('div', { class: 'dk-t', onclick: open },
          h('strong', { text: m.name }),
          h('span', { text: m.blurb })
        ),
        h('button', {
          type: 'button', class: 'dk-switch', role: 'switch',
          'aria-checked': String(on), 'aria-label': (on ? 'Turn off ' : 'Turn on ') + m.name,
          onclick: () => { setModuleOn(m, !on); render(); }
        }),
        h('button', { type: 'button', class: 'dk-chev', text: '›', 'aria-label': m.name + ' settings', onclick: open })
      ));
    }
    sheet.append(h('div', { class: 'dk-row dk-link', style: 'padding-top:4px', onclick: () => { screen = 'recipes'; render(); } },
      h('div', { class: 'dk-t' }, h('strong', { text: 'Recipes' }), h('span', { text: 'the full catalogue on its own' })),
      h('button', { type: 'button', class: 'dk-chev', text: '›', 'aria-label': 'Recipes' })
    ));
  }

  // The genetics module hands its card builders over here so the search can draw
  // a real tooltip rather than a second, poorer version of one.
  let geneCards = null;

  /* One search over everything Twill holds: the recipe catalogue, the genetics
     tables, your notes, your lore, your goals, and what you have ticked in your
     Collection. Separate scripts cannot do this; it only works because it is all
     one store. */
  function renderSearch(box, query) {
    const q = norm(query);
    if (q.length < 2) {
      box.append(h('div', { class: 'dk-empty', text: 'Keep typing.' }));
      return;
    }
    let total = 0;
    const group = (title, rows, limit) => {
      const cap = limit || 6;
      if (!rows.length) return;
      total += rows.length;
      box.append(h('div', { class: 'dk-lb', text: title + '  ·  ' + rows.length }));
      for (const r of rows.slice(0, cap)) box.append(r);
      if (rows.length > cap) box.append(h('div', { class: 'dk-empty', text: '+ ' + (rows.length - cap) + ' more. Add a word to narrow it down.' }));
    };
    const line = (name, sub, go) => h('div', { class: 'dk-find', onclick: go || null, style: go ? 'cursor:pointer' : null },
      h('strong', { text: name }), sub ? h('span', { text: sub }) : null);

    // --- the catalogue and the genetics tables ---
    const named = recipesNamed(q, 40);
    group('Recipes', named.map((r) => recipeBlock(r, q)), 4);

    if (geneCards) {
      const g = [];
      // Marking keys are stored folded to lower case, so put the capitals back.
      const titled = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
      const take = (table, make, kind) => {
        for (const [k, v] of Object.entries(GENETICS[table] || {})) {
          if (!k.includes(q)) continue;
          g.push({ sort: k.startsWith(q) ? 0 : 1, name: v && v.n ? v.n : titled(k), make, kind });
        }
      };
      take('bases', (n) => geneCards.baseCard(n), 'base');
      take('eyes', (n) => geneCards.eyeCard(n), 'eyes');
      take('marks', (n) => geneCards.markCard(n), 'marking');
      take('muts', (n) => geneCards.mutCard(n), 'mutation');
      for (const [pk, pv] of Object.entries(PERSONALITY.p)) {
        if (pk.includes(q)) g.push({ sort: pk.startsWith(q) ? 0 : 1, name: pv.n, make: (n) => geneCards.personalityCard(n), kind: 'personality' });
      }
      for (const kind of ['skin', 'nose', 'claw']) {
        for (const k of Object.keys(GENETICS.snc[kind] || {})) {
          if (k.includes(q)) g.push({ sort: k.startsWith(q) ? 0 : 1, name: titled(k), make: (n) => geneCards.traitCard(kind, n), kind });
        }
      }
      g.sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
      group('Genetics', g.map((x) => {
        const card = x.make(x.name);
        card.classList.add('dk-find-card');
        return card;
      }), 3);
    }

    // --- your own things ---
    const ticked = [];
    for (const [table, kind] of [['marks', 'marking'], ['bases', 'base'], ['eyes', 'eyes']]) {
      for (const k of have[table]) {
        if (k.includes(q)) ticked.push(line(geneName(table, k), kind + '  ·  ticked'));
      }
    }
    group('In your Collection', ticked, 8);

    const loreHits = [];
    for (const [id, rec] of Object.entries(lore)) {
      const blob = norm(Object.values(rec).join(' '));
      if (!blob.includes(q)) continue;
      const which = loreFields().filter((f) => rec[f.id] && norm(rec[f.id]).includes(q)).map((f) => f.label);
      loreHits.push(line(rec.called || rec._n || ('Wolf #' + id), (which.join(', ') || 'lore') + '  ·  #' + id,
        () => window.open('/wolf/' + id, '_blank', 'noopener')));
    }
    group('Lore', loreHits, 8);

    const notes = (load('notes', {}).notes || []).filter((n) =>
      norm((n.title || '') + ' ' + String(n.html || '').replace(/<[^>]*>/g, ' ')).includes(q));
    group('Notes', notes.map((n) => line(n.title || 'Untitled note', n.wolf ? 'pinned to #' + n.wolf : 'note')), 6);

    group('Goals', goals.filter((g) => norm(g.text).includes(q))
      .map((g) => line(g.text, g.done ? 'done' : 'open')), 6);

    if (!total) {
      box.append(h('div', { class: 'dk-empty', text: 'Nothing matches.' }));
    }
  }

  /* The pairing view. Everything a pairing raises lives here together: what the
     pups could inherit, and how closely the two are related. It needs both wolves'
     pages open at some point, so it says plainly what it is missing rather than
     quietly answering half the question. */
  function renderPair(ids) {
    const [idA, idB] = ids;
    const A = coll[idA], B = coll[idB];
    const nameOf = (id, w) => (w && w.n) || (ped[id] && ped[id].n) || ('#' + id);
    const nA = nameOf(idA, A), nB = nameOf(idB, B);

    // "Nightshade", "Nightshade and Ash": who is still missing something.
    const both = (list) => list.map(([, name]) => name).join(' and ');

    sheet.append(h('div', { class: 'dk-lb', text: nA + '  ×  ' + nB }));
    if (!A || !B) {
      const need = [[idA, nA, A], [idB, nB, B]].filter(([, , w]) => !w);
      sheet.append(h('div', { class: 'dk-note', style: 'margin-top:4px', text:
        'Twill has no genes for ' + both(need) + ' yet. A pinned wolf’s genes are read from its own page while you are on it.' }));
      return;
    }

    // A section: a heading, the answer, and a line saying what it means. The
    // line can carry links, so it can also be built from nodes.
    const sec = (label, main, why) => sheet.append(h('div', { class: 'dk-pair-sec' },
      h('div', { class: 'dk-pop-lb', text: label }),
      main == null ? null : (typeof main === 'string' ? h('div', { class: 'dk-pop-list', text: main }) : main),
      why == null ? null : typeof why === 'string'
        ? h('div', { class: 'dk-muted', style: 'font-size:11px;margin-top:2px', text: why })
        : h('div', { class: 'dk-note', style: 'font-size:11px;margin-top:2px' }, why)));

    // --- what the pups could get ---
    const hits = combosInReach(A, B);
    if (hits.length) {
      sec('Combos in reach', h('div', {}, ...hits.map((c) => h('div', {},
        h('b', { style: 'color:var(--dk-tip-title)', text: c.name }),
        h('span', { class: 'dk-muted', style: 'font-size:11px', text: '  tier ' + c.tier + (c.slot ? '  ·  slot ' + c.slot : '') + '  ·  from ' + c.from })))),
      'One parent brings each colour, on the same shape and slot.');
    }

    const combo = Object.values(GENETICS.bases).find((x) => x.c &&
      [norm(x.c[0]), norm(x.c[1])].sort().join('|') === [norm(A.b), norm(B.b)].sort().join('|'));
    sec('Base', A.b + ' × ' + B.b, combo ? 'These two are the factors for ' + combo.n + '.' : 'No combo base comes from these two.');

    const slots = [...new Set([...marksOf(A).map((m) => m[0]), ...marksOf(B).map((m) => m[0])])]
      .filter((s) => s != null).sort((x, y) => x - y);
    if (slots.length) {
      sec('Markings brought', h('div', {}, ...slots.map((s) => {
        const ma = marksOf(A).find((m) => m[0] === s), mb = marksOf(B).find((m) => m[0] === s);
        return h('div', {},
          h('span', { class: 'dk-muted', style: 'font-size:11px', text: 'Slot ' + s + '  ' }),
          h('span', { text: (ma ? ma[1] : '—') + '   ×   ' + (mb ? mb[1] : '—') }));
      })), 'Pups draw from what the parents carry. Twill does not guess pass rates.');
    }

    const eyeA = GENETICS.eyes[norm(A.e)];
    sec('Eyes', A.e + ' × ' + B.e,
      eyeA && eyeA.f && eyeA.f.length ? 'A pup that misses ' + A.e + ' gets one of: ' + eyeA.f.join(', ') + '.' : null);

    const pairOf = (x, y) => (x && y ? (norm(x) === norm(y) ? x : x + ' or ' + y) : (x || y || '—'));
    sec('Skin, nose, claws',
      pairOf(A.s, B.s) + '  ·  ' + pairOf(A.no, B.no) + '  ·  ' + pairOf(A.c, B.c),
      'Each is 50% from either parent.');

    const muts = [...(A.mu || []), ...(B.mu || [])];
    sec('Mutations', muts.length ? muts.join(' · ') : 'Neither shows one',
      [A.ca, B.ca].some((c) => /carrier/i.test(c || '')) ? 'One of them is a carrier, so a recessive can still surface.'
        : [A.ca, B.ca].some((c) => /unknown/i.test(c || '')) ? 'Carrier status is unknown on at least one, so a hidden recessive is possible.' : null);

    // --- the pups' personality: 9 in 10 come from one of the parents' dispositions ---
    const qa = personalityOf(A), qb = personalityOf(B);
    if (qa && qb) {
      const ds = [...new Set([qa.d, qb.d])];
      const an = /^[AEIOU]/.test(ds[0]) ? 'an ' : 'a ';
      sec('Personality', qa.n + ' (' + qa.d + ')  ×  ' + qb.n + ' (' + qb.d + ')',
        '9 in 10 pups get ' + an + ds.join(' or ') + ' personality. 1 in 10 get any of the 40.');
    }

    // --- the pups' generation, and how closely the two are related ---
    // Both come off the Family page, the only place Wolvden shows either.
    const pa = ped[idA], pb = ped[idB];
    const noTree = [[idA, nA, pa], [idB, nB, pb]].filter(([, , p]) => !p);
    if (noTree.length) {
      sec('Generation and shared ancestors', null,
        'Twill has no family tree for ' + both(noTree) + ' yet. A pinned wolf’s tree is read from its Family page while you are on it.');
      return;
    }

    const gA = genNum(pa), gB = genNum(pb);
    if (gA && gB) {
      sec('Generation', ordinal(Math.max(gA, gB) + 1) + ' generation',
        'One more than the higher of the two parents: ' + nA + ' is ' + ordinal(gA) + ' and ' + nB + ' is ' + ordinal(gB) + '.');
    }

    const result = pairCoi(idA, pa, idB, pb);
    if (!result) {
      // A number worked out from depths alone can be badly wrong either way,
      // so no number is given until both trees have been read with their lines.
      const unreadable = [[pa, nA], [pb, nB]].filter(([p]) => pedLines(p) === 'unreadable').map(([, n]) => n);
      const old = [[idA, nA, pa], [idB, nB, pb]].filter(([, , p]) => pedLines(p) === 'old');
      sec('Shared ancestors', null, unreadable.length
        ? 'Twill could not tell which line each ancestor sits on in ' + unreadable.join(' and ') + '’s tree, so it will not guess a COI for this pair.'
        : both(old) + '’s tree was kept before Twill noted which line each ancestor sits on, which a COI needs. It is read again the next time you are on that Family page.');
      return;
    }
    const { coi, shared } = result;
    const reach = Math.min(pedDepth(pa), pedDepth(pb));
    const nameOfAnc = (s) => (s.id === idA ? nA : s.id === idB ? nB : s.name);
    sec('Shared ancestors',
      h('div', {},
        h('div', { class: 'dk-ped-big', text: coi ? coi.toFixed(2) + '%' : 'None found' }),
        h('div', { class: 'dk-muted', style: 'font-size:11px', text: coi ? 'predicted pup COI, at least'
          : reach ? 'in the ' + reach + ' generation' + (reach === 1 ? '' : 's') + ' Twill can see'
          : 'though one of them has no ancestors on record' }),
        ...shared.slice(0, 6).map((s) => h('div', { style: 'margin-top:3px' },
          h('span', { text: nameOfAnc(s) }),
          h('span', { class: 'dk-muted', style: 'font-size:11px',
            text: '  +' + s.pct.toFixed(2) + '%  ·  ' + (s.self ? 'one of the pair' : s.depth + ' back') })))),
      'A floor, not the whole answer: Unknown ancestors, and anything past great-great-grandparents, are invisible to this.');
  }

  /* Side by side, for the wolves in the tray. Wolvden has no page that shows two
     at once, so this is the only place they meet. Values the fewest wolves share
     are picked out, because the differences are the whole point of looking. */
  // Whether Compare hides the rows every wolf shares. Kept for the session only.
  let cmpOnlyDiff = false;

  function renderCompare(ids) {
    const ws = ids.map((id) => ({ id, w: coll[id] })).filter((x) => x.w);
    if (ws.length < 2) {
      sheet.append(h('div', { class: 'dk-empty', text: 'Compare needs at least two pinned wolves with their genes read. A pinned wolf’s genes are read from its own page while you are on it.' }));
      return;
    }
    const rows = [['Sex', (w) => (w.sx || '').replace(/\s*\(.*/, '')], ['Age', (w) => w.ag || ''],
      ['Base', (w) => w.b], ['Genetics', (w) => w.g], ['Eyes', (w) => w.e],
      ['Skin', (w) => w.s], ['Nose', (w) => w.no], ['Claws', (w) => w.c],
      ['Mutations', (w) => (w.mu || []).join(', ') || 'None'], ['Carrier', (w) => w.ca || ''],
      ['Personality', (w) => { const p = personalityOf(w); return p ? p.n + ' (' + p.d + ')' : w.pe || ''; }]];
    for (let slot = 1; slot <= 10; slot++) {
      rows.push(['Slot ' + slot, (w) => {
        const m = marksOf(w).find((x) => x[0] === slot);
        return m ? m[1] : 'None';
      }]);
    }

    const head = h('tr', {}, h('th', { class: 'dk-cmp-r' }),
      ...ws.map((x) => h('th', { text: x.w.n || '#' + x.id })));
    const body = [];
    for (const [label, read] of rows) {
      const vals = ws.map((x) => String(read(x.w) || '—'));
      if (vals.every((v) => v === '—' || v === 'None')) continue;   // a slot nobody uses
      const tally = vals.reduce((m, v) => (m[v] = (m[v] || 0) + 1, m), {});
      const top = Math.max(...Object.values(tally));
      const allDiffer = top === 1;
      if (cmpOnlyDiff && top === vals.length) continue;              // every wolf the same
      body.push(h('tr', {}, h('th', { class: 'dk-cmp-r', text: label }),
        ...vals.map((v) => h('td', { class: allDiffer || tally[v] < top ? 'dk-cmp-d' : '', text: v }))));
    }
    const seg = h('div', { class: 'dk-cmp-seg', role: 'group', 'aria-label': 'Rows' },
      ...[[false, 'Every row'], [true, 'Only differences']].map(([only, text]) => h('button', {
        type: 'button', text, 'aria-pressed': String(cmpOnlyDiff === only),
        onclick: () => { cmpOnlyDiff = only; render(); }
      })));
    sheet.append(seg);
    if (!body.length) {
      sheet.append(h('div', { class: 'dk-empty', text: 'These wolves match on every row.' }));
    } else {
      sheet.append(h('div', { class: 'dk-cmp-wrap' },
        h('table', { class: 'dk-cmp' }, h('thead', {}, head), h('tbody', {}, ...body))));
    }
    sheet.append(h('div', { class: 'dk-note', text: 'Differences are picked out in the theme’s link colour. A row every wolf shares is left plain, and a marking slot none of them use is left out entirely. Only differences hides the shared rows too.' }));
  }

  /* Write a post, and be told what Wolvden will quietly throw away before you
     find out by posting it. The rules follow posts that were tested live:
     style="..." works exactly as written, and what breaks is a quote of the
     same kind INSIDE it, which ends the attribute early. An earlier version of
     this check had that the wrong way round and flagged every normal post.
     The preview shows what survives. */

  // Every style="..." or style='...' value in a draft, as written.
  const styleValues = (text) => [...String(text).matchAll(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi)]
    .map((m) => (m[2] != null ? m[2] : m[3]));
  const inStyles = (text, re) => styleValues(text).reduce((n, v) => n + (v.match(re) || []).length, 0);

  // Wolvden ships Bootstrap 4, so its own classes work in a post. Anything else
  // is a class with no style anywhere to match it.
  const BOOTSTRAP = new RegExp('^(' + [
    'row', 'no-gutters', 'container(-fluid)?', 'col(-(sm|md|lg|xl))?(-(\\d{1,2}|auto))?',
    '[mp][trblxy]?(-(sm|md|lg|xl))?-(n?\\d|auto)', '[wh]-(25|50|75|100|auto)', 'm[wh]-100', 'v[wh]-100',
    '(text|bg|d|flex|justify-content|align-(items|self|content)|order|float|position|overflow|font-weight|display)-[\\w-]+',
    '(border|rounded|shadow)(-[\\w-]+)?',
    '(card|btn|badge|alert|table|list-group|nav|navbar|progress|media|jumbotron|figure|embed-responsive|blockquote)(-[\\w-]+)?',
    'list-(unstyled|inline(-item)?)', 'img-(fluid|thumbnail)', 'font-italic', 'small', 'lead', 'mark', 'initialism',
    'h[1-6]', 'clearfix', 'visible', 'invisible', 'sr-only', 'fixed-(top|bottom)', 'sticky-top',
    'align-(baseline|top|middle|bottom|text-top|text-bottom)'
  ].join('|') + ')$');
  const classTokens = (text) => [...String(text).matchAll(/\sclass\s*=\s*("([^"]*)"|'([^']*)'|([^\s>"']+))/gi)]
    .flatMap((m) => (m[2] || m[3] || m[4] || '').split(/\s+/).filter(Boolean));

  const QUIRKS = [
    {
      id: 'quote',
      // Only a quote of the same kind as the pair around the attribute breaks
      // it, and what is left then stops mid-declaration: on url( or a colon.
      count: (text) => styleValues(text).filter((v) => /[(:,]\s*$/.test(v)).length,
      what: 'A quote inside a style attribute',
      why: 'A quote of the same kind as the pair around the attribute ends it early, and everything after it is lost. Leave url(…) unquoted, and give font names the other kind of quote: font-family:\'Georgia\'.'
    },
    {
      id: 'radius',
      count: (text) => inStyles(text, /border(-[a-z]+)*-radius\s*:/gi),
      what: 'border-radius',
      why: 'Ignored. The corners will be square however you write it.'
    },
    {
      id: 'position',
      count: (text) => inStyles(text, /(^|[;\s])position\s*:/gi),
      what: 'position',
      why: 'Ignored, and anything you placed with it lands back in the flow.'
    },
    {
      id: 'script',
      count: (text) => (String(text).match(/<\s*(script|iframe|object|embed|form|input|button)\b/gi) || []).length,
      what: 'A tag Wolvden removes outright',
      why: 'Scripts, frames and form controls are stripped from posts.'
    },
    {
      id: 'class',
      count: (text) => classTokens(text).filter((c) => !BOOTSTRAP.test(c)).length,
      what: 'A class of your own',
      why: 'Wolvden only has its own Bootstrap classes to match, like row, col-12 or text-center. A class you make up does nothing, so style that element directly.'
    }
  ];

  /* The preview is built from a parse that can run nothing. A <template> is
     inert: nothing inside it loads, runs or fires, so only an allow-list of
     tags and attributes ever reaches the page. A pasted post is somebody
     else's HTML more often than not, and without this an onerror on one broken
     image would run inside Wolvden with the player's account behind it. Same
     idea as Notepad's clean(), with room for everything a post can hold. */
  const POST_TAGS = new Set(['A', 'ABBR', 'B', 'BIG', 'BLOCKQUOTE', 'BR', 'CAPTION', 'CENTER', 'CODE',
    'DD', 'DEL', 'DETAILS', 'DIV', 'DL', 'DT', 'EM', 'FONT', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR',
    'I', 'IMG', 'INS', 'LI', 'MARK', 'OL', 'P', 'PRE', 'S', 'SMALL', 'SPAN', 'STRIKE', 'STRONG', 'SUB',
    'SUMMARY', 'SUP', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'U', 'UL']);
  const POST_ATTRS = new Set(['align', 'alt', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'class', 'color',
    'colspan', 'face', 'height', 'href', 'open', 'rowspan', 'size', 'src', 'style', 'title', 'valign', 'width']);
  // What Wolvden ignores inside a style, taken out of the preview the same way.
  const POST_IGNORED = ['border-radius', 'position', 'z-index'];
  // Removed along with everything inside them, rather than unwrapped.
  const POST_DROP = /^(script|style|iframe|frame|frameset|object|embed|form|input|button|select|textarea|svg|math|link|meta|base|template|noscript|audio|video)$/i;
  const POST_URL = /^(https?:\/\/|\/(?!\/)|#)/i;

  function inertPost(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = String(html || '');
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) continue;
        if (child.nodeType !== 1 || POST_DROP.test(child.tagName)) { child.remove(); continue; }
        walk(child);
        if (!POST_TAGS.has(child.tagName)) { child.replaceWith(...child.childNodes); continue; }
        for (const a of [...child.attributes]) {
          const name = a.name.toLowerCase();
          const url = name === 'href' || name === 'src';
          if (!POST_ATTRS.has(name) || (url && !POST_URL.test(a.value.trim()))) child.removeAttribute(a.name);
        }
        // Bootstrap's classes work on Wolvden, so they stay; a made-up one does
        // nothing there, so it goes, and with it anything that could pick up
        // Twill's own styles.
        if (child.hasAttribute('class')) {
          const keep = child.getAttribute('class').split(/\s+/).filter((c) => BOOTSTRAP.test(c));
          if (keep.length) child.setAttribute('class', keep.join(' '));
          else child.removeAttribute('class');
        }
        // A style keeps everything Wolvden keeps. A quote inside it has already
        // cut it short in the parse, exactly as it would on the live site.
        if (child.hasAttribute('style')) {
          for (const p of POST_IGNORED) child.style.removeProperty(p);
          if (!child.getAttribute('style').trim()) child.removeAttribute('style');
        }
        // A link in the preview opens beside the page instead of replacing it.
        if (child.tagName === 'A') {
          child.setAttribute('target', '_blank');
          child.setAttribute('rel', 'noopener noreferrer');
        }
      }
    };
    walk(tpl.content);
    return tpl.content;
  }

  let postDraft = load('post', '');

  function renderCompose() {
    const box = h('textarea', {
      rows: 10, spellcheck: true, value: postDraft,
      'aria-label': 'Your post'
    });
    const report = h('div');
    const preview = h('div', { class: 'dk-post-prev' });

    const check = () => {
      postDraft = box.value;
      save('post', postDraft);
      report.textContent = '';
      const found = QUIRKS.map((q) => {
        const n = q.count(postDraft);
        return n ? { q, n } : null;
      }).filter(Boolean);

      if (!postDraft.trim()) {
        report.append(h('div', { class: 'dk-empty', text: 'Paste or write a post. Nothing is sent anywhere; this only reads what you type.' }));
      } else if (!found.length) {
        report.append(h('div', { class: 'dk-post-ok', text: '✓ Nothing here trips the quirks Twill knows about.' }));
      } else {
        for (const { q, n } of found) {
          report.append(h('div', { class: 'dk-post-warn' },
            h('strong', { text: q.what + (n > 1 ? '  ×' + n : '') }),
            h('span', { text: q.why })));
        }
      }

      // The preview strips what Wolvden strips, so you see what will survive:
      // the tags it removes outright here, and inside the inert parse the
      // styles it ignores and the classes it has nothing to match.
      preview.textContent = '';
      const survives = postDraft
        .replace(/<\s*(script|iframe|object|embed|form|input|button)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
        .replace(/<\s*(script|iframe|object|embed|form|input|button)\b[^>]*>/gi, '');
      preview.append(h('div', {}, inertPost(survives)));
    };

    let t = null;
    box.addEventListener('input', () => { clearTimeout(t); t = setTimeout(check, 200); });

    sheet.append(h('div', { class: 'dk-lb', text: 'Your post' }), box, report,
      h('div', { class: 'dk-btns' },
        h('button', {
          type: 'button', class: 'dk-btn dk-primary', text: 'Copy',
          onclick: async (e) => {
            try { await navigator.clipboard.writeText(box.value); e.target.textContent = 'Copied'; }
            catch { box.select(); e.target.textContent = 'Select and copy'; }
            setTimeout(() => { e.target.textContent = 'Copy'; }, 1400);
          }
        }),
        h('button', {
          type: 'button', class: 'dk-btn dk-quiet', text: 'Clear',
          onclick: () => { box.value = ''; check(); }
        })),
      h('div', { class: 'dk-lb', text: 'What survives' }), preview,
      h('div', { class: 'dk-note', text: 'The preview drops exactly what Wolvden drops, so what you see is what posts. It checks the quirks we have actually seen bite, not every rule Wolvden has.' }));
    check();
  }

  /* The Collection is a checklist you keep yourself: tick what you have and the
     counts follow. Nothing on any page fills it in. Markings are grouped by
     shape, bases by Wolvden's own colour groups, eyes by where they come from. */
  const collView = { tab: 'marks', q: '', tier: '', show: 'all', open: new Set() };
  const collLists = {};
  function collList(table) {
    if (collLists[table]) return collLists[table];
    const titled = (x) => x.replace(/\b\w/g, (c) => c.toUpperCase());
    let out;
    if (table === 'marks') {
      // A marking key is its colour then its shape, and some colours are two
      // words, so take the longest base name it starts with as the colour.
      const colours = Object.keys(GENETICS.bases).sort((x, y) => y.length - x.length);
      out = Object.entries(GENETICS.marks).map(([k, row]) => {
        const c = colours.find((x) => k.startsWith(x + ' '));
        const cut = c ? c.length + 1 : k.indexOf(' ') + 1;
        return { k, name: titled(k), group: titled(k.slice(cut) || k), label: titled(k.slice(0, cut).trim() || k), tier: row[0] };
      });
    } else {
      out = Object.entries(GENETICS[table]).map(([k, v]) => ({
        k, name: v.n, label: v.n, group: (table === 'bases' ? v.g : v.s) || 'Other'
      }));
    }
    out.sort((x, y) => x.group.localeCompare(y.group) || x.name.localeCompare(y.name));
    return (collLists[table] = out);
  }

  function renderCollection() {
    const v = collView;
    const TABS = [['marks', 'Markings'], ['bases', 'Bases'], ['eyes', 'Eyes']];
    const label = TABS.find(([t]) => t === v.tab)[1];
    const all = collList(v.tab);
    const whole = (t) => Object.keys(GENETICS[t]).length;
    const fmt = (n) => n.toLocaleString('en-GB');

    const counts = {};
    const tabs = h('div', { class: 'dk-ctabs', role: 'tablist' });
    for (const [t, name] of TABS) {
      counts[t] = h('small');
      tabs.append(h('button', {
        type: 'button', role: 'tab', class: 'dk-ctab', 'aria-selected': String(v.tab === t),
        onclick: () => { v.tab = t; v.tier = ''; v.open.clear(); render(); }
      }, name, counts[t]));
    }
    const fill = h('i');
    sheet.append(tabs, h('div', { class: 'dk-bar' }, fill));

    const find = h('input', { type: 'search', class: 'dk-cfind', value: v.q,
      placeholder: 'Search ' + label.toLowerCase(), 'aria-label': 'Search ' + label.toLowerCase() });
    find.addEventListener('input', () => { v.q = find.value; paint(); });
    const filters = h('div', { class: 'dk-cfilt' });
    if (v.tab === 'marks') {
      const tiers = [...new Set(all.map((e) => e.tier))].sort((x, y) => x - y);
      filters.append(h('label', {}, 'Tier ', h('select', {
        'aria-label': 'Tier', onchange: (e) => { v.tier = e.target.value; paint(); }
      }, h('option', { value: '', text: 'Any', selected: v.tier === '' }),
      ...tiers.map((t) => h('option', { value: String(t), text: String(t), selected: v.tier === String(t) })))));
    }
    const seg = h('div', { class: 'dk-cseg', role: 'group', 'aria-label': 'Show' });
    for (const [val, text] of [['all', 'All'], ['left', 'Still to get'], ['got', 'Got']]) {
      seg.append(h('button', {
        type: 'button', 'aria-pressed': String(v.show === val), text,
        onclick: (ev) => {
          v.show = val;
          for (const btn of seg.children) btn.setAttribute('aria-pressed', String(btn === ev.currentTarget));
          paint();
        }
      }));
    }
    filters.append(seg);
    const list = h('div', { class: 'dk-clist' });
    sheet.append(find, filters, list);

    function paint() {
      for (const [t] of TABS) counts[t].textContent = fmt(have[t].size) + ' of ' + fmt(whole(t));
      fill.style.width = Math.min(100, Math.round(have[v.tab].size / whole(v.tab) * 100)) + '%';
      const mine = have[v.tab];
      const q = norm(v.q);
      // Totals per group come from the whole table, so a filter never changes them.
      const sums = new Map();
      for (const e of all) {
        const g = sums.get(e.group) || sums.set(e.group, { got: 0, of: 0 }).get(e.group);
        g.of++;
        if (mine.has(e.k)) g.got++;
      }
      const shown = new Map();
      for (const e of all) {
        if (q && !norm(e.name).includes(q)) continue;
        if (v.tier !== '' && String(e.tier) !== v.tier) continue;
        if (v.show !== 'all' && (v.show === 'got') !== mine.has(e.k)) continue;
        (shown.get(e.group) || shown.set(e.group, []).get(e.group)).push(e);
      }
      list.textContent = '';
      if (!shown.size) {
        list.append(h('div', { class: 'dk-empty', text: v.show === 'got' && !mine.size
          ? 'Nothing ticked yet. Pick All, then click a name to tick it.' : 'Nothing matches.' }));
        return;
      }
      // Searching or filtering opens every group it leaves standing.
      const narrowed = q || v.tier !== '' || v.show !== 'all';
      for (const [group, entries] of shown) {
        const open = narrowed || v.open.has(group);
        const sum = sums.get(group);
        list.append(h('button', {
          type: 'button', class: 'dk-cgrp', 'aria-expanded': String(open),
          onclick: () => { if (v.open.has(group)) v.open.delete(group); else v.open.add(group); paint(); }
        }, h('b', { text: (open ? '▾ ' : '▸ ') + group }), h('span', { text: sum.got + ' of ' + sum.of })));
        if (!open) continue;
        list.append(h('div', { class: 'dk-chips' }, ...entries.map((e) => {
          const got = mine.has(e.k);
          return h('button', {
            type: 'button', class: 'dk-chip' + (got ? ' dk-chip-got' : ''), 'aria-pressed': String(got),
            title: e.name + (got ? ', ticked' : ''),
            onclick: () => {
              have = loadHave();   // another tab may have ticked something since
              if (have[v.tab].has(e.k)) have[v.tab].delete(e.k); else have[v.tab].add(e.k);
              saveHave();
              paint();
            }
          }, e.label, e.tier != null ? h('span', { class: 'dk-ctier', text: 'T' + e.tier }) : null);
        })));
      }
    }
    paint();

    sheet.append(h('div', { class: 'dk-note' },
      'Click a name to tick it, and again to untick it. You keep this list yourself: Twill never fills it in from a page. ',
      h('button', {
        type: 'button', class: 'dk-btn dk-quiet', text: 'Untick everything',
        onclick: () => {
          const n = haveCount();
          if (!n || !confirm('Untick all ' + fmt(n) + ' in your Collection?')) return;
          have = loadHave();
          for (const t of HAVE_TABLES) have[t].clear();
          saveHave();
          render();
        }
      })));
  }

  // Everything Twill keeps lives under denkit: keys, so a backup is just
  // those keys gathered into one blob of text.
  function exportAll() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) data[k.slice(PREFIX.length)] = load(k.slice(PREFIX.length), null);
    }
    return JSON.stringify({ denKit: 1, saved: new Date().toISOString(), data }, null, 1);
  }

  function renderBackup() {
    const box = h('textarea', { rows: 10, spellcheck: false, 'aria-label': 'Twill settings', value: exportAll() });
    const status = h('div', { class: 'dk-note', text: 'Copy this somewhere safe. Pasting it back restores your themes, hidden players, and every module’s settings.' });

    const copy = h('button', {
      type: 'button', class: 'dk-btn dk-primary', text: 'Copy',
      onclick: async () => {
        box.value = exportAll();
        try {
          await navigator.clipboard.writeText(box.value);
        } catch {
          box.select();
          document.execCommand('copy');
        }
        copy.textContent = 'Copied';
        setTimeout(() => { copy.textContent = 'Copy'; }, 1500);
      }
    });

    const restore = h('button', {
      type: 'button', class: 'dk-btn', text: 'Restore from box',
      onclick: () => {
        let incoming;
        try {
          incoming = JSON.parse(box.value);
          if (!incoming || incoming.denKit !== 1 || !incoming.data || typeof incoming.data !== 'object') throw new Error('not a Twill backup');
        } catch (err) {
          status.textContent = 'That text isn’t a Twill backup (' + err.message + '). Nothing was changed.';
          return;
        }
        if (!confirm('Replace all Twill settings with the ones in the box?')) return;
        for (const [k, v] of Object.entries(incoming.data)) save(k, v);
        // A backup made by an older version can carry wolves outside the tray,
        // and the two stores Twill no longer keeps. Neither comes back.
        pruneToTray();
        Object.assign(core, { theme: 'preset:cypres', drafts: {}, custom: {}, enabled: {}, corner: 'br', button: 'full', buttonSize: 40, buttonPlate: false }, load('core', {}));
        paintTheme();
        placeUi();
        for (const m of modules) {
          safely(m, 'stop');
          if (m.reload) safely(m, 'reload');
          if (isOn(m)) safely(m, 'start');
        }
        // Goals and the post draft belong to no module, so nothing above
        // reloads them. Without this, the first goal ticked after a restore
        // would save the old list straight back over the restored one.
        goals = load('goals', []);
        postDraft = load('post', '');
        render();
      }
    });

    sheet.append(h('div', { class: 'dk-lb', text: 'All Twill settings' }), box, h('div', { class: 'dk-btns' }, copy, restore), status);
  }

  let recipeQuery = '';

  function renderRecipes() {
    const input = h('input', {
      type: 'text', value: recipeQuery, placeholder: 'Recipe or ingredient, e.g. spores',
      'aria-label': 'Search recipes', spellcheck: false
    });
    const results = h('div', { class: 'dk-rc-results' });
    const LIMIT = 15;

    const paint = () => {
      recipeQuery = input.value;
      results.textContent = '';
      const q = norm(recipeQuery);
      if (!q) {
        results.append(h('div', {
          class: 'dk-note', style: 'margin-top:8px',
          text: RECIPE_BOOK.recipes.length + ' recipes from Glyph’s catalogue (exported ' + RECIPE_BOOK.exported + '). Search a recipe name, or an ingredient to see what it’s used in.'
        }));
        return;
      }
      const named = recipesNamed(q, 50);
      const namedKeys = new Set(named.map((r) => r.k));
      const using = recipesUsing(q).filter((r) => !namedKeys.has(r.k));
      const group = (title, list) => {
        if (!list.length) return;
        results.append(h('div', { class: 'dk-lb', text: title + '  ·  ' + list.length }));
        for (const r of list.slice(0, LIMIT)) results.append(recipeBlock(r, q));
        if (list.length > LIMIT) results.append(h('div', { class: 'dk-empty', text: '+ ' + (list.length - LIMIT) + ' more. Add a word to narrow it down.' }));
      };
      group('Recipes', named);
      group('Uses a matching ingredient', using);
      if (!named.length && !using.length) {
        results.append(h('div', { class: 'dk-empty', text: 'Nothing in the catalogue matches that. Wolvden adds recipes, so the book may just be behind.' }));
      }
    };

    let t = null;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(paint, 120); });
    sheet.append(h('div', { class: 'dk-lb', text: 'Search' }), input, results,
      h('div', { class: 'dk-note' },
        'Recipe facts from Glyph, gathered from the ',
        h('a', { href: RECIPE_BOOK.wiki, target: '_blank', rel: 'noopener', text: 'Grouse House Wiki' }),
        ' (CC BY-NC-SA).'));
    paint();
    setTimeout(() => input.focus(), 0);
  }

  function renderLook() {
    const t = activeTokens();
    const { kind, id } = themeParts();

    // --- theme menu ---
    const sel = h('select', {
      'aria-label': 'Theme',
      onchange: (e) => { core.theme = e.target.value; saveAsOpen = false; saveCore(); paintTheme(); render(); }
    });
    const presetGroup = h('optgroup', { label: 'Presets' });
    for (const [pid, p] of Object.entries(PRESETS)) {
      const edited = core.drafts[pid] && Object.keys(core.drafts[pid]).length;
      presetGroup.append(h('option', {
        value: 'preset:' + pid,
        text: p.name + (edited ? ' (edited)' : ''),
        selected: kind === 'preset' && id === pid
      }));
    }
    sel.append(presetGroup);
    const mine = Object.entries(core.custom);
    if (mine.length) {
      const g = h('optgroup', { label: 'Yours' });
      for (const [cid, c] of mine) g.append(h('option', { value: 'custom:' + cid, text: c.name, selected: kind === 'custom' && id === cid }));
      sel.append(g);
    }
    sheet.append(h('div', { class: 'dk-lb', text: 'Theme' }), sel);

    // --- colours: 'input' repaints live while you drag, 'change' saves ---
    const sw = h('div', { class: 'dk-swatches' });
    for (const [key, label] of COLOUR_FIELDS) {
      sw.append(h('label', {},
        h('input', {
          type: 'color', value: t[key],
          oninput: (e) => setToken(key, e.target.value, false),
          onchange: (e) => { setToken(key, e.target.value, true); refreshLookLabels(); }
        }),
        document.createTextNode(label)
      ));
    }
    sheet.append(h('div', { class: 'dk-lb', text: 'Colours' }), sw);

    // --- fonts ---
    const fontInput = (key) => h('input', {
      type: 'text', value: t[key], list: 'dk-fonts', spellcheck: false,
      onchange: (e) => { setToken(key, e.target.value.trim() || PRESETS.cypres[key], true); refreshLookLabels(); }
    });
    sheet.append(
      h('div', { class: 'dk-lb', text: 'Fonts' }),
      h('div', { class: 'dk-two' },
        h('div', {}, h('label', { text: 'Title' }), fontInput('titleFont')),
        h('div', {}, h('label', { text: 'Body' }), fontInput('bodyFont'))
      )
    );

    // --- corners ---
    const cornerLabel = h('div', { class: 'dk-lb', text: 'Corners  ·  ' + t.radius + 'px' });
    sheet.append(cornerLabel, h('input', {
      type: 'range', min: '0', max: '10', step: '1', value: String(t.radius), 'aria-label': 'Corner rounding',
      oninput: (e) => { cornerLabel.textContent = 'Corners  ·  ' + e.target.value + 'px'; setToken('radius', Number(e.target.value), false); },
      onchange: (e) => { setToken('radius', Number(e.target.value), true); refreshLookLabels(); }
    }));

    // --- glass ---
    sheet.append(h('div', { class: 'dk-lb', text: 'Glass' }));
    const glassLabel = (v) => 'How solid  ·  ' + v + '%  (lower shows more of the page)';
    const glassNow = t.glass == null ? 62 : t.glass;
    const glassLab = h('label', { text: glassLabel(glassNow) });
    sheet.append(glassLab, h('input', {
      type: 'range', min: '20', max: '100', step: '1', value: String(glassNow), 'aria-label': 'Glass',
      oninput: (e) => { glassLab.textContent = glassLabel(e.target.value); setToken('glass', Number(e.target.value), false); },
      onchange: (e) => { setToken('glass', Number(e.target.value), true); refreshLookLabels(); }
    }));

    // --- save / reset / delete ---
    const btns = h('div', { class: 'dk-btns' });
    if (saveAsOpen) {
      const name = h('input', { type: 'text', placeholder: 'Name this theme', 'aria-label': 'Theme name' });
      const commit = () => {
        const n = name.value.trim();
        if (!n) { name.focus(); return; }
        const cid = Date.now().toString(36);
        core.custom[cid] = { name: n, tokens: activeTokens() };
        if (kind === 'preset') delete core.drafts[id];
        core.theme = 'custom:' + cid;
        saveAsOpen = false;
        saveCore();
        paintTheme();
        render();
      };
      name.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); });
      sheet.append(h('div', { class: 'dk-lb', text: 'Save as new' }), name);
      btns.append(
        h('button', { type: 'button', class: 'dk-btn dk-primary', text: 'Save theme', onclick: commit }),
        h('button', { type: 'button', class: 'dk-btn dk-quiet', text: 'Cancel', onclick: () => { saveAsOpen = false; render(); } })
      );
      setTimeout(() => name.focus(), 0);
    } else {
      btns.append(h('button', {
        type: 'button', class: 'dk-btn dk-primary', text: 'Save as new',
        onclick: () => { saveAsOpen = true; render(); }
      }));
      if (kind === 'preset') {
        btns.append(h('button', {
          type: 'button', class: 'dk-btn', text: 'Reset to preset',
          onclick: () => { delete core.drafts[id]; saveCore(); paintTheme(); render(); }
        }));
      } else {
        btns.append(h('button', {
          type: 'button', class: 'dk-btn', text: 'Delete theme',
          onclick: () => {
            if (!confirm('Delete the theme "' + core.custom[id].name + '"?')) return;
            delete core.custom[id];
            core.theme = 'preset:cypres';
            saveCore();
            paintTheme();
            render();
          }
        }));
      }
    }
    sheet.append(btns);

    // --- button position ---
    const cornerSel = h('select', {
      'aria-label': 'Button position',
      onchange: (e) => { core.corner = e.target.value; saveCore(); placeUi(); }
    });
    for (const [v, text] of [['br', 'Bottom right'], ['bl', 'Bottom left'], ['tr', 'Top right'], ['tl', 'Top left']]) {
      cornerSel.append(h('option', { value: v, text, selected: core.corner === v }));
    }
    sheet.append(h('div', { class: 'dk-lb', text: 'Button position' }), cornerSel);

    // --- what the button wears ---
    const buttonSel = h('select', {
      'aria-label': 'Hub button',
      onchange: (e) => { core.button = e.target.value; saveCore(); placeUi(); }
    });
    for (const [v, [text]] of Object.entries(BUTTONS)) {
      buttonSel.append(h('option', { value: v, text, selected: core.button === v }));
    }
    sheet.append(h('div', { class: 'dk-lb', text: 'Hub button' }), buttonSel);

    const sizeNow = Math.min(72, Math.max(20, Number(core.buttonSize) || 40));
    const sizeLabel = (v) => 'Size  \u00b7  ' + v + 'px tall';
    const sizeLab = h('label', { text: sizeLabel(sizeNow) });
    sheet.append(sizeLab, h('input', {
      type: 'range', min: '20', max: '72', step: '2', value: String(sizeNow), 'aria-label': 'Button size',
      oninput: (e) => { sizeLab.textContent = sizeLabel(e.target.value); core.buttonSize = Number(e.target.value); placeUi(); },
      onchange: () => saveCore()
    }));
    sheet.append(h('label', { class: 'dk-check' },
      h('input', {
        type: 'checkbox', checked: !!core.buttonPlate,
        onchange: (e) => { core.buttonPlate = e.target.checked; saveCore(); placeUi(); }
      }),
      document.createTextNode('Frosted plate behind the mark')));
    sheet.append(h('div', { class: 'dk-note',
      text: 'The 3 marks sit on nothing at all, so they take their colour from the artwork rather than from your theme. Pick whichever reads against your den photo, turn the plate on if none of them do, or keep the plain button with the name on it. Size only changes the marks.' }));

    sheet.append(h('div', {
      class: 'dk-note',
      text: kind === 'preset'
        ? 'Edits to a preset are kept as a draft until you save them as your own theme or reset.'
        : 'Edits to your own theme save as you make them.'
    }));
  }

  // The theme menu label changes to "(edited)" after the first edit; update it
  // without rebuilding the screen, so a colour picker in use is not torn down.
  function refreshLookLabels() {
    const sel = hub.querySelector('select[aria-label="Theme"]');
    if (!sel) return;
    for (const opt of sel.querySelectorAll('option')) {
      const [k, pid] = opt.value.split(':');
      if (k !== 'preset') continue;
      const edited = core.drafts[pid] && Object.keys(core.drafts[pid]).length;
      opt.textContent = PRESETS[pid].name + (edited ? ' (edited)' : '');
    }
  }

  // =================================================== module: den manager

  defineModule((() => {
    // Game facts, checked against the Grouse House Wiki (FAQ, Rollovers and
    // Dailies, Breeding, WIP Puppies) on 2026-09-22.
    const USE = 10;                 // every food or amusement use restores 10%
    const HUNGER_LOSS = 20;         // per rollover; pregnant wolves lose 30
    const HUNGER_LOSS_PREGNANT = 30;
    const MOOD_LOSS = 10;
    const NURSING_UNDER = 2.5;      // pups nurse for 5 rollovers and lose nothing meanwhile
    const PUP_UNDER = 6;            // puppy until 5.5 months
    const ADULT_AT = 12;            // adolescent until 1 year
    const ELDER_AT = 86.5;          // 7y 2.5m: females can no longer breed
    const OLD_AGE_AT = 90;          // 7y 6m: random old-age death can start
    const WEAK_PUP = 50;            // "needs attention" threshold for survival
    const COOLDOWN_SOON = 2;        // cooldowns ending within this many rollovers

    const ui = Object.assign({ open: true }, load('den', {}));
    let card = null;

    const onDenPage = () => currentPage().kind === 'den' && document.querySelector('table[data-cave-key]');

    // Everything the card knows comes from what Wolvden already drew:
    // tooltips on the bars and icons, and the text on each wolf card.
    function readWolves() {
      const wolves = [];
      for (const c of document.querySelectorAll('table[data-cave-key] .card')) {
        if (!c.querySelector('.progress')) continue;
        const link = c.querySelector('a[href*="/wolf/"]');
        const id = link && (link.getAttribute('href').match(/\/wolf\/(\d+)/) || [])[1];
        if (!id) continue;
        const nameEl = c.querySelector('.bg-dark small, small.b');
        const name = (nameEl ? nameEl.textContent : link.textContent).replace(/\s+/g, ' ').trim() || '#' + id;

        const tips = [];
        for (const el of c.querySelectorAll('[data-original-title], [title], img[alt]')) {
          for (const v of [el.getAttribute('data-original-title'), el.getAttribute('title'), el.getAttribute('alt')]) {
            if (v) tips.push(v);
          }
        }
        const tip = (re) => { for (const t of tips) { const m = t.match(re); if (m) return m; } return null; };
        const num = (re) => { const m = tip(re); return m ? Number(m[1]) : null; };

        let months = null;
        for (const s of c.querySelectorAll('small')) {
          const m = s.textContent.match(/(\d+)\s*y\s*(\d+)\s*(½)?\s*m/);
          if (m) { months = Number(m[1]) * 12 + Number(m[2]) + (m[3] ? 0.5 : 0); break; }
        }
        const hp = tip(/HP:\s*(\d+)\s*\/\s*(\d+)/);

        wolves.push({
          id, name, months,
          female: !!c.querySelector('.fa-venus'),
          energy: num(/^Energy:\s*(\d+)%/), mood: num(/^Mood:\s*(\d+)%/), hunger: num(/^Hunger:\s*(\d+)%/),
          survival: num(/Survival Chance:\s*(\d+)%/),
          hp: hp ? { now: Number(hp[1]), max: Number(hp[2]) } : null,
          roles: [...new Set(tips.filter((t) => / icon$/.test(t)).map((t) => t.replace(/ icon$/, '')))],
          cooldown: num(/Breeding Cooldown \((\d+) rollovers?\)/),
          pregnant: num(/Pregnant \((\d+) rollovers?\)/),
          heat: num(/In Heat \((\d+) rollovers?\)/),
          nested: tips.some((t) => /nested/i.test(t)),
          immortal: tips.some((t) => /immortal/i.test(t)) || months == null,
          trade: tips.some((t) => /listed in a trade|^Trade$/.test(t))
        });
      }
      return wolves;
    }

    function summarise(wolves) {
      const mortal = wolves.filter((w) => !w.immortal);
      const fed = mortal.filter((w) => w.months >= NURSING_UNDER);
      const uses = (missing) => Math.ceil(Math.max(0, Math.min(100, missing)) / USE);
      const pups = mortal.filter((w) => w.months < PUP_UNDER);
      const adults = mortal.filter((w) => w.months >= ADULT_AT);

      const attention = [];
      for (const w of mortal.filter((x) => x.pregnant != null && !x.nested).sort((a, b) => a.pregnant - b.pregnant)) {
        attention.push({ who: [w], tag: 'not nested', rest: 'pregnant, due in ' + w.pregnant });
      }
      for (const w of mortal.filter((x) => x.heat === 1)) {
        attention.push({ who: [w], tag: 'last rollover', rest: 'in heat' });
      }
      const weak = pups.filter((w) => w.survival != null && w.survival < WEAK_PUP);
      if (weak.length) attention.push({ label: weak.length + (weak.length === 1 ? ' pup' : ' pups'), rest: 'under ' + WEAK_PUP + '% survival' });
      const tired = mortal.filter((w) => w.energy === 0);
      if (tired.length) attention.push({ who: tired, rest: '0% energy' });
      for (const w of wolves.filter((x) => x.hp && x.hp.now < x.hp.max)) {
        attention.push({ who: [w], rest: 'HP ' + w.hp.now + ' / ' + w.hp.max });
      }

      const roleCount = {};
      for (const w of wolves) for (const r of w.roles) roleCount[r] = (roleCount[r] || 0) + 1;

      return {
        total: wolves.length,
        pups: pups.length,
        nursing: mortal.filter((w) => w.months < NURSING_UNDER).length,
        adolescents: mortal.filter((w) => w.months >= PUP_UNDER && w.months < ADULT_AT).length,
        adults: adults.length,
        immortal: wolves.length - mortal.length,
        foodNow: mortal.reduce((n, w) => n + uses(100 - w.hunger), 0),
        funNow: mortal.reduce((n, w) => n + uses(100 - w.mood), 0),
        foodNext: fed.reduce((n, w) => n + uses(100 - w.hunger + (w.pregnant != null ? HUNGER_LOSS_PREGNANT : HUNGER_LOSS)), 0),
        funNext: fed.reduce((n, w) => n + uses(100 - w.mood + MOOD_LOSS), 0),
        attention,
        heat: mortal.filter((w) => w.heat != null).sort((a, b) => a.heat - b.heat),
        pregnant: mortal.filter((w) => w.pregnant != null).sort((a, b) => a.pregnant - b.pregnant),
        cooldownSoon: mortal.filter((w) => w.cooldown != null && w.cooldown <= COOLDOWN_SOON).length,
        weakest: pups.filter((w) => w.survival != null && w.survival < 100).sort((a, b) => a.survival - b.survival),
        roles: Object.entries(roleCount).sort((a, b) => b[1] - a[1]),
        noRole: adults.filter((w) => !w.roles.length),
        elders: mortal.filter((w) => w.months >= ELDER_AT).sort((a, b) => b.months - a.months),
        trade: wolves.filter((w) => w.trade)
      };
    }

    const age = (m) => Math.floor(m / 12) + 'y ' + (m % 12 % 1 ? Math.floor(m % 12) + '½' : m % 12) + 'm';
    const wolfLinks = (list) => {
      const span = h('span', {});
      list.forEach((w, i) => {
        if (i) span.append(', ');
        span.append(h('a', { href: '/wolf/' + w.id, text: w.name }));
      });
      return span;
    };
    // Group wolves sharing the same value into one row: "Alizée, Featherfull  due in 1".
    const grouped = (list, key) => {
      const out = new Map();
      for (const w of list) {
        const k = key(w);
        if (!out.has(k)) out.set(k, []);
        out.get(k).push(w);
      }
      return [...out.entries()];
    };

    function row(left, right, tag, tone) {
      return h('div', { class: 'dk-dm-it' },
        typeof left === 'string' ? h('span', { text: left }) : left,
        h('span', { class: 'dk-dm-r' },
          tag ? h('span', { class: 'dk-tag ' + (tone || 'dk-warn'), text: tag }) : null,
          tag ? ' ' : null,
          right)
      );
    }

    /* Every section folds on its own, and can be switched off entirely in
       settings so it is never built at all. A folded section still shows its
       own summary on the right, so folding costs you the detail and not the
       signal: the card stays worth glancing at when all of it is shut. */
    const SECTIONS = [
      ['glance', 'At a glance'],
      ['care', 'Care'],
      ['attention', 'Needs attention'],
      ['breeding', 'Breeding'],
      ['pups', 'Pups, lowest survival'],
      ['roles', 'Roles'],
      ['oldage', 'Old age'],
      ['trade', 'In a trade']
    ];

    const secOff = (key) => !!(ui.off && ui.off[key]);
    const secOpen = (key) => (ui.start === 'open' ? true
      : ui.start === 'closed' ? false
      : (ui.sec || {})[key] !== false);

    function section(key, title, summary, ...kids) {
      if (secOff(key)) return null;
      const open = secOpen(key);
      const body = h('div', { class: 'dk-dm-secb', hidden: !open }, ...kids.filter(Boolean));
      const arrow = h('span', { class: 'dk-dm-arrow', text: open ? '▾' : '▸' });
      const head = h('button', {
        type: 'button', class: 'dk-dm-sech', 'aria-expanded': String(open),
        onclick: () => {
          const now = body.hidden;
          body.hidden = !now;
          arrow.textContent = now ? '▾' : '▸';
          head.setAttribute('aria-expanded', String(now));
          // Remembered whichever way "Start every section" is set, so switching
          // back to "However I left it" picks up where you actually left it.
          ui.sec = Object.assign({}, ui.sec, { [key]: now });
          save('den', ui);
        }
      }, arrow, h('span', { class: 'dk-dm-sect', text: title }),
         summary ? h('span', { class: 'dk-dm-secn', text: summary }) : null);
      return h('div', { class: 'dk-dm-sec' }, head, body);
    }

    function build(sum) {
      const body = h('div', { class: 'dk-dm-body', hidden: !ui.open });
      // section() returns null when that section is switched off, and
      // append(null) would write the string "null" into the card.
      const add = (el) => { if (el) body.append(el); };

      const total = sum.pups + sum.adolescents + sum.adults;
      add(section('glance', 'At a glance', total + (total === 1 ? ' wolf' : ' wolves'),
        h('div', { class: 'dk-dm-tiles' },
          h('div', {}, h('b', { text: String(sum.pups) }), h('span', { text: 'Pups' + (sum.nursing ? ' · ' + sum.nursing + ' nursing' : '') })),
          h('div', {}, h('b', { text: String(sum.adolescents) }), h('span', { text: 'Adolescents' })),
          h('div', {}, h('b', { text: String(sum.adults) }), h('span', { text: 'Adults' })),
          h('div', {}, h('b', { text: String(sum.immortal) }), h('span', { text: 'Immortal' }))
        )));

      add(section('care', 'Care',
        sum.foodNow || sum.funNow
          ? sum.foodNow + ' food, ' + sum.funNow + ' amusement due'
          : 'nothing due',
        h('div', { class: 'dk-dm-two' },
          h('div', {}, h('b', { text: String(sum.foodNow) }), ' ', h('span', { text: 'food uses now' }), h('br'),
            h('span', { text: sum.foodNext + ' to stay full through the next rollover' })),
          h('div', {}, h('b', { text: String(sum.funNow) }), ' ', h('span', { text: 'amusement uses now' }), h('br'),
            h('span', { text: sum.funNext + ' to stay full through the next rollover' }))
        )));

      add(section('attention', 'Needs attention',
        sum.attention.length ? String(sum.attention.length) : 'clear',
        ...(sum.attention.length
          ? sum.attention.map((a) => row(a.who ? wolfLinks(a.who) : a.label, a.rest, a.tag))
          : [h('div', { class: 'dk-dm-none', text: 'Nothing right now.' })])
      ));

      const breeding = [
        ...sum.heat.map((w) => row(wolfLinks([w]), w.heat + ' left', 'in heat', 'dk-good')),
        ...grouped(sum.pregnant, (w) => w.pregnant).map(([due, ws]) => row(wolfLinks(ws), 'due in ' + due)),
        sum.cooldownSoon ? row(sum.cooldownSoon + (sum.cooldownSoon === 1 ? ' cooldown' : ' cooldowns'), 'end within ' + COOLDOWN_SOON) : null
      ].filter(Boolean);
      const pups = sum.weakest.length
        ? [...sum.weakest.slice(0, 5).map((w) => row(wolfLinks([w]), w.survival + '%')),
           sum.weakest.length > 5 ? row('+ ' + (sum.weakest.length - 5) + ' more', 'all under 100%') : null].filter(Boolean)
        : [h('div', { class: 'dk-dm-none', text: sum.pups ? 'Every pup is at 100%.' : 'No pups.' })];
      const breedSum = [
        sum.heat.length ? sum.heat.length + ' in heat' : '',
        sum.pregnant.length ? sum.pregnant.length + ' pregnant' : '',
        sum.cooldownSoon ? sum.cooldownSoon + (sum.cooldownSoon === 1 ? ' cooldown' : ' cooldowns') : ''
      ].filter(Boolean).join(' · ') || 'nothing due';
      add(section('breeding', 'Breeding', breedSum,
        ...(breeding.length ? breeding : [h('div', { class: 'dk-dm-none', text: 'Nobody in heat or pregnant.' })])));
      add(section('pups', 'Pups, lowest survival',
        sum.weakest.length ? sum.weakest.length + ' under 100%' : sum.pups ? 'all at 100%' : 'no pups',
        ...pups));

      const pills = h('div', { class: 'dk-dm-pills' },
        ...sum.roles.map(([r, n]) => h('span', { class: 'dk-dm-pill', text: r.charAt(0).toUpperCase() + r.slice(1) + ' ' + n })));
      if (sum.noRole.length) pills.append(h('span', { class: 'dk-dm-pill dk-dm-pill-warn' }, 'No role: ', wolfLinks(sum.noRole)));
      add(section('roles', 'Roles',
        sum.noRole.length ? sum.noRole.length + ' unassigned' : 'all assigned', pills));

      const soonest = sum.elders.filter((w) => w.months < OLD_AGE_AT).sort((a, b) => b.months - a.months)[0];
      const atRisk = sum.elders.filter((w) => w.months >= OLD_AGE_AT);
      const old = [
        ...grouped(sum.elders, (w) => w.months).map(([m, ws]) => row(wolfLinks(ws), age(m), m >= OLD_AGE_AT ? 'old-age risk' : null)),
        soonest && !atRisk.length ? row('Old-age risk begins', 'in ' + Math.round((OLD_AGE_AT - soonest.months) * 2) + ' rollovers') : null
      ].filter(Boolean);
      add(section('oldage', 'Old age',
        atRisk.length ? atRisk.length + ' past ' + age(OLD_AGE_AT) : sum.elders.length ? sum.elders.length + ' elders' : 'none',
        ...(old.length ? old : [h('div', { class: 'dk-dm-none', text: 'Nobody past breeding age.' })])));
      add(section('trade', 'In a trade',
        sum.trade.length ? String(sum.trade.length) : 'none',
        ...(sum.trade.length ? sum.trade.map((w) => row(wolfLinks([w]), 'listed')) : [h('div', { class: 'dk-dm-none', text: 'None.' })])));

      // The folded state keeps the headline numbers visible.
      const n = sum.attention.length;
      const head = h('button', {
        type: 'button', class: 'dk-dm-head', 'aria-expanded': String(ui.open),
        onclick: () => {
          ui.open = !ui.open;
          save('den', ui);
          body.hidden = !ui.open;
          head.setAttribute('aria-expanded', String(ui.open));
          arrow.textContent = ui.open ? '▾' : '▸';
        }
      });
      const arrow = h('span', { class: 'dk-dm-arrow', text: ui.open ? '▾' : '▸' });
      head.append(arrow,
        h('span', { class: 'dk-dm-title', text: 'Den Manager' }),
        h('span', { class: 'dk-dm-sum', text:
          sum.foodNext + ' food · ' + sum.funNext + ' amusement · ' + n + (n === 1 ? ' needs' : ' need') + ' attention' }));

      return h('section', { id: 'dk-den', 'aria-label': 'Den Manager' }, head, body);
    }

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      #dk-den {
        margin: 12px 0 16px; background: var(--dk-panel); color: var(--dk-text);
        border: 1px solid var(--dk-line); border-radius: var(--dk-radius); overflow: hidden;
        font: 12px/1.5 var(--dk-body-font); text-align: left;
      }
      #dk-den * { box-sizing: border-box; }
      #dk-den a { text-decoration: none; border-bottom: 1px dotted var(--dk-muted); }
      #dk-den a:hover { color: var(--dk-accent) !important; border-bottom-color: var(--dk-accent); }
      .dk-dm-head {
        display: flex; align-items: baseline; gap: 8px; width: 100%; margin: 0; cursor: pointer;
        padding: 8px 12px; border: 0; border-radius: 0; text-align: left;
        background: var(--dk-head); color: var(--dk-head-text); font: 600 14px/1.3 var(--dk-title-font);
      }
      .dk-dm-arrow { flex: none; width: 10px; font-size: 11px; }
      .dk-dm-title { flex: none; }
      .dk-dm-sum { margin-left: auto; font: 400 11px/1.3 var(--dk-body-font); opacity: .85; }
      .dk-dm-body { padding: 10px 12px 12px; }
      .dk-dm-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
      .dk-dm-tiles > div, .dk-dm-two > div { background: var(--dk-surface); padding: 6px 8px; border-radius: var(--dk-radius); }
      .dk-dm-tiles b, .dk-dm-two b { font-size: 18px; font-weight: 600; color: var(--dk-text); }
      .dk-dm-tiles b { display: block; }
      .dk-dm-tiles span, .dk-dm-two span { color: var(--dk-muted); font-size: 11px; }
      .dk-dm-two { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .dk-dm-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 16px; }
      .dk-dm-sec { border-bottom: 1px solid var(--dk-line); }
      .dk-dm-sec:last-child { border-bottom: 0; }
      .dk-dm-sech {
        display: flex; align-items: center; gap: 8px; width: 100%; margin: 0;
        padding: 7px 2px; background: none; border: 0; border-radius: 0; cursor: pointer;
        color: var(--dk-muted); text-align: left;
        font: 600 10px/1.6 var(--dk-body-font); text-transform: uppercase; letter-spacing: .08em;
      }
      .dk-dm-sech:hover { color: var(--dk-accent); }
      .dk-dm-sect { flex: none; }
      .dk-dm-secn {
        margin-left: auto; flex: none; text-transform: none; letter-spacing: 0;
        font-weight: 400; font-size: 11px; color: var(--dk-muted);
      }
      .dk-dm-secb { padding: 0 0 9px 17px; }
      .dk-dm-sec .dk-lb { margin: 12px 0 5px; }
      .dk-dm-it {
        display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
        padding: 3px 0; border-bottom: 1px solid var(--dk-line);
      }
      .dk-dm-r { color: var(--dk-muted); text-align: right; flex: none; }
      .dk-dm-none { color: var(--dk-muted); padding: 3px 0; }
      .dk-dm-pills { display: flex; flex-wrap: wrap; gap: 4px; }
      .dk-dm-pill {
        padding: 1px 7px; background: var(--dk-surface);
        border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
      }
      .dk-dm-pill-warn { border-color: var(--dk-warn); }
      @media (max-width: 640px) {
        .dk-dm-grid, .dk-dm-two { grid-template-columns: 1fr; }
        .dk-dm-tiles { grid-template-columns: 1fr 1fr; }
      }
    `;

    function start() {
      if (card || !onDenPage()) return;
      const wolves = readWolves();
      if (!wolves.length) return;           // not your den, or a view we don't read
      if (!styleEl.isConnected) document.head.appendChild(styleEl);
      const firstCave = document.querySelector('table[data-cave-key]');
      const anchor = firstCave.closest('form') || firstCave;
      card = build(summarise(wolves));
      anchor.parentNode.insertBefore(card, anchor);
    }

    function stop() {
      if (card) card.remove();
      card = null;
      styleEl.remove();
    }

    function reload() {
      Object.assign(ui, { open: true, start: 'keep', sec: {}, off: {} }, load('den', {}));
    }

    function settings(sheet) {
      const redraw = () => { stop(); start(); };

      sheet.append(h('div', { class: 'dk-lb', text: 'Sections' }));
      for (const [key, label] of SECTIONS) {
        sheet.append(check(label, !secOff(key), (on) => {
          ui.off = Object.assign({}, ui.off);
          if (on) delete ui.off[key]; else ui.off[key] = 1;
          save('den', ui);
          redraw();
        }));
      }
      sheet.append(h('div', { class: 'dk-note', style: 'margin-top:4px',
        text: 'A section switched off is never built, so the card gets shorter rather than just quieter.' }));

      sheet.append(h('div', { class: 'dk-lb', text: 'Start every section' }));
      const startSel = h('select', { 'aria-label': 'How sections start',
        onchange: (e) => { ui.start = e.target.value; save('den', ui); redraw(); } },
        h('option', { value: 'keep', text: 'However I left it', selected: ui.start !== 'open' && ui.start !== 'closed' }),
        h('option', { value: 'closed', text: 'Collapsed', selected: ui.start === 'closed' }),
        h('option', { value: 'open', text: 'Open', selected: ui.start === 'open' }));
      sheet.append(startSel, h('div', { class: 'dk-note', style: 'margin-top:5px',
        text: 'Folding a section always records the choice, so switching back to “However I left it” finds the card the way you actually left it.' }));

      sheet.append(
        h('div', { class: 'dk-lb', text: 'What it does' }),
        h('div', {
          class: 'dk-note', style: 'margin-top:0',
          text: 'On your own den, a card above the caves sums up care, breeding, pups, roles, old age, and trades. It reads only what the den page already shows; nothing is fetched.'
        }),
        h('div', {
          class: 'dk-note',
          text: 'Figures follow the Grouse House Wiki: each use restores 10%, a rollover costs 20% hunger (30% if pregnant) and 10% mood, and nursing pups lose nothing until they are weaned.'
        })
      );
    }

    return { id: 'den', name: 'Den Manager', blurb: 'Care, breeding, death-roll watch', start, stop, reload, settings };
  })());

  // ================================================================= popover

  // One floating box shared by every module: genetics tooltips (hover) and the
  // item recipe list (click). Fixed position, kept inside the window.
  const pop = h('div', { id: 'dk-pop', role: 'tooltip', hidden: true });
  let popAnchor = null;
  let popSticky = false;
  let popHideTimer = null;

  function placePop() {
    if (!popAnchor || pop.hidden) return;
    const r = popAnchor.getBoundingClientRect();
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    let left = Math.min(r.left, window.innerWidth - pw - 8);
    let top = r.bottom + 6;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 6);
    pop.style.left = Math.max(8, left) + 'px';
    pop.style.top = top + 'px';
  }

  /* Unpinned, the box is click-through: the pointer passes straight to whatever
     is under it. Clicking pins it, which gives it the mouse so it can be
     scrolled, and adds a close button. */
  function showPop(anchor, content, sticky) {
    clearTimeout(popHideTimer);
    if (!pop.isConnected) document.body.append(pop);
    pop.textContent = '';
    if (sticky) {
      pop.append(h('button', {
        type: 'button', class: 'dk-pop-x', text: '×', 'aria-label': 'Close',
        onclick: (e) => { e.stopPropagation(); hidePop(); }
      }));
    }
    pop.append(content);
    pop.hidden = false;
    popAnchor = anchor;
    popSticky = !!sticky;
    pop.classList.toggle('dk-pop-pin', !!sticky);
    // Carry the anchor's own colour down the edge of the box.
    const hue = anchor && anchor.style && anchor.style.getPropertyValue('--gh');
    pop.style.setProperty('--gh', hue || '');
    pop.classList.toggle('dk-pop-edge', !!hue);
    if (anchor && anchor.classList) anchor.classList.toggle('dk-gene-on', !!sticky);
    pop.scrollTop = 0;
    placePop();
  }

  function hidePop() {
    clearTimeout(popHideTimer);
    pop.hidden = true;
    if (popAnchor && popAnchor.classList) popAnchor.classList.remove('dk-gene-on');
    popAnchor = null;
    popSticky = false;
    pop.classList.remove('dk-pop-pin', 'dk-pop-edge');
  }

  // Hover popovers linger a moment so the pointer can move onto them (and
  // click the wiki link) without the box vanishing underneath it.
  const hideSoon = () => { clearTimeout(popHideTimer); popHideTimer = setTimeout(hidePop, 180); };
  pop.addEventListener('mouseenter', () => clearTimeout(popHideTimer));
  pop.addEventListener('mouseleave', () => { if (!popSticky) hideSoon(); });
  document.addEventListener('mousedown', (e) => {
    if (popSticky && !pop.contains(e.target) && !(popAnchor && popAnchor.contains(e.target))) hidePop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !pop.hidden) hidePop(); });
  window.addEventListener('scroll', placePop, { passive: true });
  window.addEventListener('resize', placePop);

  // Header, body lines, and an optional footer link, in the popover's style.
  function popCard(title, sub, lines, link) {
    return h('div', {},
      h('div', { class: 'dk-pop-h' }, h('strong', { text: title }), sub ? h('span', { text: sub }) : null),
      h('div', { class: 'dk-pop-b' }, ...lines.filter(Boolean).map((l) => (typeof l === 'string' ? h('div', { text: l }) : l))),
      link ? h('div', { class: 'dk-pop-f' }, h('a', { href: link.href, target: '_blank', rel: 'noopener', text: link.text })) : null
    );
  }

  // ===================================================== module: hide users

  defineModule((() => {
    const PROFILE_RE = /^\/profile\/(\d+)/;

    const CONTEXTS = [
      ['post', 'Forum posts'],
      ['topic', 'Topics they started'],
      ['reply', 'Topics they replied to last'],
      ['chat', 'Chat, comments, cards'],
      ['other', 'Names anywhere else']
    ];
    const ACTIONS = [
      ['collapse', 'Collapse to a stub'],
      ['hide', 'Hide completely'],
      ['dim', 'Just dim the name'],
      ['off', 'Leave alone']
    ];

    const RULE_DEFAULTS = { post: 'collapse', topic: 'collapse', reply: 'dim', chat: 'collapse', other: 'dim' };
    const STUB_DEFAULTS = { template: 'Hidden: {name}', showNote: true, strike: true, dim: 45, toggles: true };

    const s = {};                                       // users: id -> { name, note, added }
    function reload() {
      const saved = load('hide', {});
      s.users = saved.users || {};
      s.rules = Object.assign({}, RULE_DEFAULTS, saved.rules);
      s.stub = Object.assign({}, STUB_DEFAULTS, saved.stub);
    }
    reload();
    const persist = () => save('hide', s);

    const isHidden = (id) => Object.prototype.hasOwnProperty.call(s.users, String(id));
    const nameOf = (id) => (s.users[id] && s.users[id].name) || '#' + id;

    // Styles that depend on this module's own settings.
    const modStyle = document.createElement('style');
    modStyle.id = 'dk-hide-style';
    document.head.appendChild(modStyle);

    function paintModStyle() {
      modStyle.textContent = `
        .dk-hidden { display: none !important; }
        .dk-stub {
          font: 12px/1.5 var(--dk-body-font); color: var(--dk-muted);
          background: var(--dk-surface); border-left: 2px solid var(--dk-accent);
          padding: 5px 10px; margin: 0; list-style: none;
        }
        tr.dk-stub > td {
          font: 12px/1.5 var(--dk-body-font); color: var(--dk-muted);
          background: var(--dk-surface) !important;
          border-left: 2px solid var(--dk-accent) !important; padding: 5px 10px !important;
        }
        .dk-stub-line { display: flex; align-items: baseline; gap: 6px; width: 100%; }
        .dk-stub-who { font-weight: 600; color: var(--dk-text); }
        .dk-stub-note { font-size: 11px; opacity: .8; }
        .dk-stub-show {
          margin-left: auto; flex: none; font: inherit; font-size: 11px;
          letter-spacing: .06em; text-transform: uppercase; color: var(--dk-accent);
          background: none; border: 0; padding: 1px 2px; cursor: pointer; opacity: .75;
        }
        .dk-stub-show:hover { opacity: 1; text-decoration: underline; }
        .dk-hide-dim {
          opacity: ${Math.max(5, Math.min(100, Number(s.stub.dim) || 45)) / 100};
          text-decoration: ${s.stub.strike ? 'line-through' : 'none'};
        }
        .dk-eye {
          display: ${s.stub.toggles ? 'inline-block' : 'none'};
          font: 10px/1 sans-serif; margin: 0 0 0 2px; padding: 2px; border: 0;
          border-radius: 50%; background: none; color: inherit; cursor: pointer;
          opacity: 0; transition: opacity .12s; vertical-align: baseline;
        }
        .dk-eye:focus-visible { opacity: 1; outline: 1px solid currentColor; }
        a[href^="/profile/"]:hover + .dk-eye, .dk-eye:hover,
        tr:hover .dk-eye, li:hover .dk-eye, p:hover .dk-eye { opacity: .55; }
      `;
    }

    // Which chunk of the page a profile link belongs to.
    function classify(link) {
      const tr = link.closest('tr');
      if (tr && tr.querySelector('td.forum-post')) return { kind: 'post', unit: tr };
      if (tr && tr.querySelector('td a[href^="/chatter/topic/"]')) {
        const cell = link.closest('td');
        const idx = cell ? [...tr.children].indexOf(cell) : -1;
        return { kind: idx === 1 ? 'topic' : 'reply', unit: tr };
      }
      let n = link.parentElement;
      for (let depth = 0; n && depth < 6; depth++, n = n.parentElement) {
        if (n === document.body || n.id === 'main' || n.id === 'content') break;
        const cls = typeof n.className === 'string' ? n.className : '';
        const looksLikeUnit =
          n.tagName === 'LI' ||
          /\b(chat|message|comment|post|card|media)\b/i.test(cls) ||
          /^(chat|msg|post|comment)/i.test(n.id || '');
        if (!looksLikeUnit) continue;
        if (n.querySelectorAll('a[href^="/profile/"]').length > 2) break;
        if (n.textContent.length > 4000) break;
        return { kind: 'chat', unit: n };
      }
      return { kind: 'other', unit: null };
    }

    function stubFor(unit, id) {
      const u = s.users[id] || {};
      const label = (s.stub.template || 'Hidden: {name}')
        .replace(/\{name\}/g, nameOf(id))
        .replace(/\{id\}/g, id)
        .replace(/\{note\}/g, u.note || '');

      const line = h('div', { class: 'dk-stub-line' }, h('span', { class: 'dk-stub-who', text: label }));
      if (s.stub.showNote && u.note && !/\{note\}/.test(s.stub.template)) {
        line.append(h('span', { class: 'dk-stub-note', text: u.note }));
      }
      let stub;
      line.append(h('button', {
        type: 'button', class: 'dk-stub-show', text: 'show',
        onclick: () => { unit.classList.remove('dk-hidden'); stub.remove(); }
      }));

      if (unit.tagName === 'TR') {
        stub = h('tr', { class: 'dk-stub' }, h('td', { colSpan: unit.children.length || 1 }, line));
      } else {
        stub = h(unit.tagName === 'LI' ? 'li' : 'div', { class: 'dk-stub' }, line);
      }
      return stub;
    }

    let running = false;
    let scanning = false;
    let observer = null;

    function scan() {
      if (!running || scanning) return;
      scanning = true;
      try {
        const links = [...document.querySelectorAll('a[href^="/profile/"]')]
          .filter((a) => !a.closest('#dk-hub'));

        // Avatar links have no text; collect the best name per id first.
        const names = new Map();
        for (const a of links) {
          const m = (a.getAttribute('href') || '').match(PROFILE_RE);
          const text = a.textContent.replace(/\s+/g, ' ').trim();
          if (m && text && !names.has(m[1])) names.set(m[1], text);
        }

        for (const a of links) {
          const m = (a.getAttribute('href') || '').match(PROFILE_RE);
          if (!m) continue;
          const id = m[1];
          const name = names.get(id) || '';

          addEye(a, id, name);
          if (!isHidden(id)) continue;

          if (name && nameOf(id).startsWith('#')) {
            s.users[id].name = name;
            persist();
          }

          const { kind, unit } = classify(a);
          const action = s.rules[kind] || 'off';
          if (action === 'off') continue;
          if (action === 'dim' || !unit) {
            a.classList.add('dk-hide-dim');
            continue;
          }
          if (unit.dataset.dkDone) continue;
          unit.dataset.dkDone = '1';
          unit.classList.add('dk-hidden');
          if (action === 'collapse') unit.parentNode.insertBefore(stubFor(unit, id), unit);
        }
      } finally {
        scanning = false;
      }
    }

    function clearPage() {
      document.querySelectorAll('.dk-stub').forEach((el) => el.remove());
      document.querySelectorAll('.dk-hidden').forEach((el) => el.classList.remove('dk-hidden'));
      document.querySelectorAll('[data-dk-done]').forEach((el) => delete el.dataset.dkDone);
      // Its own class name: .dk-mark is the stag in the hub's title bar.
      document.querySelectorAll('.dk-hide-dim').forEach((el) => el.classList.remove('dk-hide-dim'));
    }

    function reapply() {
      clearPage();
      scan();
      document.querySelectorAll('.dk-eye').forEach((b) => paintEye(b, b.dataset.dkFor));
    }

    function addEye(a, id, name) {
      if (a.dataset.dkEye) return;
      a.dataset.dkEye = '1';
      const b = h('button', {
        type: 'button', class: 'dk-eye',
        onclick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isHidden(id)) delete s.users[id];
          else s.users[id] = { name: name || '#' + id, note: '', added: Date.now() };
          persist();
          reapply();
          if (screen === 'hide') render();
        }
      });
      b.dataset.dkFor = id;
      b.dataset.dkName = name;
      paintEye(b, id);
      a.insertAdjacentElement('afterend', b);
    }

    function paintEye(b, id) {
      const on = isHidden(id);
      b.textContent = on ? '○' : '⊘';
      b.title = (on ? 'Unhide ' : 'Hide ') + (b.dataset.dkName || nameOf(id));
    }

    function start() {
      if (running) return;
      running = true;
      paintModStyle();
      scan();
      let pending = null;
      observer = new MutationObserver(() => {
        if (pending) return;
        pending = setTimeout(() => { pending = null; scan(); }, 150);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    function stop() {
      running = false;
      if (observer) observer.disconnect();
      observer = null;
      clearPage();
      document.querySelectorAll('.dk-eye').forEach((b) => b.remove());
      document.querySelectorAll('[data-dk-eye]').forEach((el) => delete el.dataset.dkEye);
      modStyle.textContent = '';
    }

    function settings(sheet) {
      // --- people ---
      sheet.append(h('div', { class: 'dk-lb', text: 'Hidden players' }));
      const ids = Object.keys(s.users).sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
      if (!ids.length) {
        sheet.append(h('div', {
          class: 'dk-empty',
          text: 'Nobody yet. Hover a username anywhere on Wolvden and click the ⊘ beside it, or add someone below.'
        }));
      }
      for (const id of ids) {
        sheet.append(h('div', { class: 'dk-row', style: 'display:block' },
          h('div', { style: 'display:flex;align-items:center;gap:6px' },
            h('strong', { text: nameOf(id), style: 'font-weight:600' }),
            h('span', { text: '#' + id, style: 'color:var(--dk-muted);font-size:11px' }),
            h('span', { style: 'margin-left:auto;display:flex;gap:4px' },
              h('a', {
                href: '/profile/' + id, target: '_blank', rel: 'noopener', text: 'profile',
                class: 'dk-btn dk-quiet', style: 'padding:2px 6px;text-decoration:none'
              }),
              h('button', {
                type: 'button', class: 'dk-btn dk-quiet', text: 'unhide', style: 'padding:2px 6px',
                onclick: () => { delete s.users[id]; persist(); reapply(); render(); }
              })
            )
          ),
          h('input', {
            type: 'text', value: (s.users[id] && s.users[id].note) || '', placeholder: 'Private note',
            style: 'margin-top:6px',
            onchange: (e) => { s.users[id].note = e.target.value.trim(); persist(); reapply(); }
          })
        ));
      }

      const who = h('input', { type: 'text', placeholder: 'Profile id or URL', 'aria-label': 'Profile id or URL' });
      const note = h('input', { type: 'text', placeholder: 'Note (optional)', 'aria-label': 'Note', style: 'margin-top:6px' });
      const add = () => {
        const m = who.value.match(/(\d{1,9})/);
        if (!m) { who.focus(); return; }
        s.users[m[1]] = { name: '#' + m[1], note: note.value.trim(), added: Date.now() };
        persist();
        reapply();
        render();
      };
      who.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
      note.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
      sheet.append(
        h('div', { class: 'dk-lb', text: 'Add someone' }),
        who, note,
        h('div', { class: 'dk-btns' }, h('button', { type: 'button', class: 'dk-btn dk-primary', text: 'Hide them', onclick: add }))
      );

      // --- rules ---
      sheet.append(h('div', { class: 'dk-lb', text: 'What happens where' }));
      for (const [key, label] of CONTEXTS) {
        const sel = h('select', {
          'aria-label': label,
          onchange: (e) => { s.rules[key] = e.target.value; persist(); reapply(); }
        });
        for (const [v, text] of ACTIONS) sel.append(h('option', { value: v, text, selected: s.rules[key] === v }));
        sheet.append(h('label', { text: label }), sel);
      }

      // --- stub ---
      const setStub = (key, value) => { s.stub[key] = value; persist(); paintModStyle(); reapply(); };
      sheet.append(
        h('div', { class: 'dk-lb', text: 'Stub' }),
        h('label', { text: 'Wording  ·  {name}, {id}, {note}' }),
        h('input', { type: 'text', value: s.stub.template, onchange: (e) => setStub('template', e.target.value || 'Hidden: {name}') }),
        check('Show the note on the stub', s.stub.showNote, (v) => setStub('showNote', v)),
        check('Strike through dimmed names', s.stub.strike, (v) => setStub('strike', v)),
        check('Hover toggle beside names', s.stub.toggles, (v) => setStub('toggles', v)),
        h('label', { text: 'Dimmed names, % visible' }),
        h('input', {
          type: 'number', min: '5', max: '100', value: String(s.stub.dim),
          onchange: (e) => setStub('dim', Math.max(5, Math.min(100, Number(e.target.value) || 45)))
        }),
        h('div', { class: 'dk-note', text: 'Local to this browser. Nothing is sent anywhere and nobody is blocked.' })
      );
    }

    return { id: 'hide', name: 'Hide users', blurb: 'Collapse posts from chosen players', start, stop, reload, settings };
  })());

  // ================================================== module: item lookup

  // The Recipes screen in the hub, plus two buttons on every Hoard item: one
  // opening its Item Catalogue search in a new tab, and (for items a recipe
  // uses or makes) a badge that opens the recipe list.
  defineModule((() => {
    const madeBy = (name) => RECIPE_BOOK.recipes.find((r) => norm(r.n) === norm(name));
    let observer = null;

    function openRecipesFor(name) {
      hidePop();
      recipeQuery = name;
      screen = 'recipes';
      hub.hidden = false;
      render();
    }

    function listFor(name, anchor) {
      const uses = recipesUsing(name, true).sort((a, b) => a.n.localeCompare(b.n));
      const made = madeBy(name);
      const lines = [];
      if (made) {
        lines.push(h('div', { class: 'dk-muted', text: 'Made by a recipe' }), recipeBlock(made));
      }
      if (uses.length) {
        if (made) lines.push(h('div', { class: 'dk-muted', style: 'margin-top:6px', text: 'Also used in' }));
        for (const r of uses.slice(0, 5)) {
          const count = (r.i.find(([n]) => norm(n) === norm(name)) || [])[1];
          lines.push(h('div', { class: 'dk-dm-it' },
            catLink(r.n),
            h('span', { class: 'dk-muted', text: String(count) })));
        }
      }
      const more = uses.length > 5
        ? h('button', { type: 'button', class: 'dk-linkbtn', text: '+ ' + (uses.length - 5) + ' more in Recipes ›', onclick: () => openRecipesFor(name) })
        : uses.length ? h('button', { type: 'button', class: 'dk-linkbtn', text: 'Open in Recipes ›', onclick: () => openRecipesFor(name) }) : null;
      lines.push(h('div', { style: 'display:flex;justify-content:space-between;gap:10px;margin-top:6px' },
        more || h('div', {}),
        h('a', { href: catalogueUrl(name), target: '_blank', rel: 'noopener', text: 'catalogue ›' })));
      const sub = uses.length ? 'used in ' + uses.length + (uses.length === 1 ? ' recipe' : ' recipes') : 'recipe product';
      showPop(anchor, popCard(name, sub, lines), true);
    }

    /* Where to look an item up. Both are plain links that open in a new tab; Den
       Kit never loads either page itself.

       Search Trades splits by what you are after: /search/general, /wolves,
       /items and /currency are separate endpoints. Posting keywords to /general
       with has_items=1 sends you to the item search having dropped the keywords,
       which is 394 pages of every item trade on the site. Ask /items directly.

       `keywords` was tried and returns nothing, so it does not look at item
       names. The form's exact filter is `item`, a hidden ID set by a JavaScript
       picker. The Hoard happens to carry that ID already: a stacked item links to
       /hoard/stacked/<id> and its checkbox has the same value, and the numbers
       are small and shared (Elk Bull Carcass is 1), which is an item type rather
       than one of your stacks. So from the Hoard we can ask exactly; anywhere
       else, fall back to the trade name. */
    const tradeSearchUrl = (name, id) => '/trading-center/search/items?'
      + (id ? 'item=' + encodeURIComponent(id) : 'name=' + encodeURIComponent(name))
      + '#results';

    function lookupMenu(name, id) {
      const row = (label, note, go) => h('button', { type: 'button', class: 'dk-lu', onclick: go },
        h('strong', { text: label }), h('span', { text: note }));
      return popCard(name, 'look up', [
        row('Item Catalogue', 'opens searched for this item',
          () => { window.open(catalogueUrl(name), '_blank', 'noopener'); hidePop(); }),
        row('Trading Center', id ? 'trades holding this exact item' : 'trades whose name matches',
          () => { window.open(tradeSearchUrl(name, id), '_blank', 'noopener'); hidePop(); })
      ], null);
    }

    function decorate(item) {
      if (item.dataset.dkLookup) return;
      // A trade lists wolves in the same .item markup as items. A wolf's head
      // links to /wolf/<id>, and looking one up in the item catalogue is nonsense.
      if (item.querySelector('a[href*="/wolf/"]')) return;
      const head = item.querySelector('.item-head');
      const img = item.querySelector('img[alt]');
      const name = ((head && head.textContent) || (img && img.alt) || '').replace(/\s+/g, ' ').trim();
      if (!name) return;
      item.dataset.dkLookup = '1';
      const host = item.querySelector('.image') || item;
      host.classList.add('dk-il-host');

      /* Divs and buttons only: Wolvden's hoard styles collapse spans in items.
         The magnifier opens a small menu rather than jumping straight to the
         catalogue, because "where can I look this up" has more than one answer.
         Both entries are plain links that open in a new tab; Twill never loads
         either page itself. */
      // The Hoard links a stacked item to /hoard/stacked/<id>, and its checkbox
      // carries the same number: that is the item's own id, not this stack's.
      const stack = item.querySelector('a[href*="/hoard/stacked/"]');
      const box = item.querySelector('input[type=checkbox][value]');
      const itemId = (stack && (stack.getAttribute('href').match(/\/hoard\/stacked\/(\d+)/) || [])[1])
        || (box && /^\d+$/.test(box.value) ? box.value : null);

      const find = h('button', {
        type: 'button', class: 'dk-il-btn', text: '⌕', title: 'Look up ' + name,
        'aria-label': 'Look up ' + name,
        onclick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!pop.hidden && popAnchor === find) { hidePop(); return; }
          showPop(find, lookupMenu(name, itemId), true);
        }
      });
      const group = h('div', { class: 'dk-il' }, find);
      const uses = recipesUsing(name, true).length;
      if (uses || madeBy(name)) {
        const badge = h('button', {
          type: 'button', class: 'dk-il-btn dk-il-badge', text: uses ? String(uses) : 'R',
          title: uses ? name + ' is used in ' + uses + (uses === 1 ? ' recipe' : ' recipes') : name + ' is made by a recipe',
          'aria-label': 'Recipes for ' + name,
          onclick: (e) => {
            e.preventDefault(); e.stopPropagation();
            if (!pop.hidden && popAnchor === badge) hidePop();
            else listFor(name, badge);
          }
        });
        group.append(badge);
      }
      host.append(group);
    }

    const scan = () => document.querySelectorAll('.item').forEach(decorate);

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .dk-il-host { position: relative !important; }
      .dk-il {
        position: absolute; top: 4px; right: 4px; z-index: 5; display: flex !important; gap: 2px;
        width: auto !important; height: auto !important; overflow: visible !important;
      }
      .dk-il-btn {
        display: inline-flex !important; align-items: center; justify-content: center;
        min-width: 18px; height: 18px !important; margin: 0 !important; padding: 0 4px !important;
        font: 600 11px/1 var(--dk-body-font) !important; color: var(--dk-text) !important;
        background: var(--dk-panel) !important; border: 1px solid var(--dk-line) !important;
        border-radius: var(--dk-radius) !important; cursor: pointer; opacity: .9;
      }
      .dk-il-btn:hover, .dk-il-btn:focus-visible { opacity: 1; border-color: var(--dk-accent) !important; }
      .dk-il-badge { border-color: var(--dk-accent) !important; }
    `;

    return {
      id: 'lookup', name: 'Item Lookup', blurb: 'Recipes, and catalogue links for items',
      start() {
        // A trade page draws items in the same markup, so it gets the same help.
        if (!['hoard', 'trade'].includes(currentPage().kind) || observer) return;
        document.head.appendChild(styleEl);
        scan();
        // Filtering and paging redraw the hoard in place.
        let pending = null;
        observer = new MutationObserver(() => {
          if (pending) return;
          pending = setTimeout(() => { pending = null; scan(); }, 150);
        });
        observer.observe(document.querySelector('#hoard') || document.body, { childList: true, subtree: true });
      },
      stop() {
        if (observer) observer.disconnect();
        observer = null;
        document.querySelectorAll('.dk-il').forEach((g) => g.remove());
        document.querySelectorAll('[data-dk-lookup]').forEach((el) => delete el.dataset.dkLookup);
        styleEl.remove();
        hidePop();
      },
      settings(sheet) {
        sheet.append(
          h('div', { class: 'dk-note', style: 'margin-top:8px', text: 'On the Hoard, every item gets ⌕ to open its Item Catalogue search in a new tab. Items a recipe uses or makes also get a badge; click it for the recipes. Search everything from the Recipes row on the hub home.' }),
          h('div', { class: 'dk-btns' }, h('button', {
            type: 'button', class: 'dk-btn dk-primary', text: 'Open recipes',
            onclick: () => { screen = 'recipes'; render(); }
          }))
        );
      }
    };
  })());

  // ================================================== module: store front

  defineModule((() => {
    const st = {};
    function reload() {
      const s = load('trades', {});
      st.items = Array.isArray(s.items) ? s.items : [];     // { id, name, keep, match: [], cat }
      st.cats = Array.isArray(s.cats) ? s.cats : [];        // category order you chose
    }
    reload();
    const persist = () => save('trades', st);

    // Titles and phrases compared loosely: case, accents, emoji and punctuation
    // all ignored, so "🌿Black Sage 🖤" counts as Black Sage.
    const loose = (s) => String(s || '').normalize('NFKD').toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const phrases = (it) => (it.match && it.match.length ? it.match : [it.name]).map(loose).filter(Boolean);
    // Categories exist while something uses them, in the order you arranged
    // them; new ones join at the end.
    function cats() {
      const used = [...new Set(st.items.map((i) => i.cat || 'Other'))];
      const ordered = st.cats.filter((c) => used.includes(c));
      for (const c of used) if (!ordered.includes(c)) ordered.push(c);
      return ordered;
    }

    function moveCat(c, dir) {
      st.cats = cats();
      const i = st.cats.indexOf(c);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= st.cats.length) return;
      [st.cats[i], st.cats[j]] = [st.cats[j], st.cats[i]];
      persist();
      paintCard();
      render();
    }

    function renameCat(from, to) {
      const name = to.trim();
      if (!name || name === from) return;
      for (const it of st.items) if ((it.cat || 'Other') === from) it.cat = name;
      st.cats = cats();                              // a rename onto an existing category merges them
      persist();
      paintCard();
    }

    function readTrades() {
      const table = [...document.querySelectorAll('table')].find((t) => /Your Trades/i.test((t.querySelector('th') || {}).textContent || ''));
      if (!table) return null;
      const trades = [];
      for (const a of table.querySelectorAll('a[href*="/trade/"]')) {
        const small = a.parentElement.querySelector('small');
        const m = small && small.textContent.match(/(\d+)\s+offers?/i);
        trades.push({ title: a.textContent.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href'), offers: m ? Number(m[1]) : 0 });
      }
      return { table, trades };
    }

    function tally(trades) {
      return st.items.map((it) => {
        const ps = phrases(it);
        const have = trades.filter((t) => ps.some((p) => (' ' + loose(t.title) + ' ').includes(' ' + p + ' '))).length;
        return { ...it, have, need: Math.max(0, (Number(it.keep) || 0) - have) };
      });
    }

    let card = null;

    function build(found) {
      const rows = tally(found.trades);
      const short = rows.filter((r) => r.need > 0);
      const body = h('div', { class: 'dk-tc-body' });

      const waiting = found.trades.filter((t) => t.offers > 0);
      if (waiting.length) {
        const line = h('div', { class: 'dk-tc-offers' },
          h('span', { class: 'dk-tag dk-good', text: waiting.length + (waiting.length === 1 ? ' trade has' : ' trades have') + ' offers waiting' }), ' ');
        waiting.forEach((t, i) => {
          if (i) line.append(', ');
          line.append(h('a', { href: t.href, text: t.title }), ' (' + t.offers + ')');
        });
        body.append(line);
      }

      if (!rows.length) {
        body.append(h('div', { class: 'dk-dm-none', text: 'Nothing tracked yet. Add what you like to keep listed, and this card counts it for you.' }));
      }
      for (const c of cats()) {
        const inCat = rows.filter((r) => (r.cat || 'Other') === c);
        body.append(h('div', { class: 'dk-lb', text: c }));
        for (const r of inCat) {
          body.append(h('div', { class: 'dk-dm-it' },
            h('span', { text: r.name }),
            h('span', { class: 'dk-dm-r' },
              h('span', { class: 'dk-tag ' + (r.need ? 'dk-warn' : 'dk-good'), text: r.need ? 'list ' + r.need + ' more' : 'stocked' }),
              ' ' + r.have + ' of ' + r.keep + ' listed')));
        }
      }

      const copy = h('button', {
        type: 'button', class: 'dk-btn dk-primary', text: 'Copy what to list',
        onclick: async () => {
          const text = short.length
            ? short.map((r) => r.name + ': list ' + r.need + ' more (' + r.have + ' of ' + r.keep + ' listed)').join('\n')
            : 'Everything is stocked.';
          try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
          copy.textContent = 'Copied';
          setTimeout(() => { copy.textContent = 'Copy what to list'; }, 1500);
        }
      });
      const edit = h('button', {
        type: 'button', class: 'dk-btn', text: 'Edit list ›',
        onclick: () => { screen = 'trades'; hub.hidden = false; render(); }
      });
      body.append(h('div', { class: 'dk-btns' }, rows.length ? copy : null, edit));

      const n = found.trades.length;
      return h('section', { id: 'dk-tc', 'aria-label': 'Store Front' },
        h('div', { class: 'dk-tc-head' },
          h('span', { text: 'Store Front' }),
          h('span', { class: 'dk-tc-sum', text: n + (n === 1 ? ' listing' : ' listings') + ' · ' + short.length + (short.length === 1 ? ' needs' : ' need') + ' relisting' })),
        body);
    }

    function paintCard() {
      if (card) card.remove();
      card = null;
      if (currentPage().kind !== 'trades') return;
      const found = readTrades();
      if (!found) return;
      card = build(found);
      found.table.parentNode.insertBefore(card, found.table);
    }

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      #dk-tc {
        margin: 0 0 14px; background: var(--dk-panel); color: var(--dk-text);
        border: 1px solid var(--dk-line); border-radius: var(--dk-radius); overflow: hidden;
        font: 12px/1.5 var(--dk-body-font); text-align: left;
      }
      #dk-tc * { box-sizing: border-box; }
      .dk-tc-head {
        display: flex; justify-content: space-between; align-items: baseline; gap: 10px; padding: 7px 11px;
        background: var(--dk-head); color: var(--dk-head-text); font: 600 13px/1.3 var(--dk-title-font);
      }
      .dk-tc-sum { font: 400 11px/1.3 var(--dk-body-font); opacity: .85; }
      .dk-tc-body { padding: 4px 11px 11px; }
      .dk-tc-body .dk-lb { margin: 10px 0 4px; }
      .dk-tc-offers { margin-top: 8px; }
      #dk-hub .dk-tc-cat { display: flex; align-items: center; gap: 4px; margin: 14px 0 4px; }
      #dk-hub .dk-tc-cat .dk-lb { margin: 0 auto 0 0; }
      #dk-hub .dk-tc-cat input { flex: 1; }
      #dk-hub .dk-tc-tiny { padding: 1px 6px; font-size: 11px; line-height: 1.2; }
      #dk-hub .dk-tc-tiny:disabled { opacity: .35; cursor: default; }
      #dk-tc a { text-decoration: none; border-bottom: 1px dotted var(--dk-muted); }
      #dk-tc a:hover { color: var(--dk-accent) !important; border-bottom-color: var(--dk-accent); }
      #dk-tc .dk-dm-it {
        display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
        padding: 4px 0; border-bottom: 1px solid var(--dk-line);
      }
      #dk-tc .dk-dm-r { color: var(--dk-muted); }
      #dk-tc .dk-dm-none { color: var(--dk-muted); padding: 8px 0 2px; }
    `;

    // --- the hub screen: add, edit, remove ---
    let editing = null;     // id of the entry being edited, or null for "add"

    let renaming = null;    // category being renamed in place

    function catHead(c, idx, total) {
      if (renaming === c) {
        const input = h('input', { type: 'text', value: c, 'aria-label': 'New name for ' + c });
        const done = (ok) => { if (ok) renameCat(c, input.value); renaming = null; render(); };
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') done(true);
          else if (e.key === 'Escape') { e.stopPropagation(); done(false); }
        });
        setTimeout(() => { input.focus(); input.select(); }, 0);
        return h('div', { class: 'dk-tc-cat' }, input,
          h('button', { type: 'button', class: 'dk-btn dk-primary', text: 'Save', onclick: () => done(true) }),
          h('button', { type: 'button', class: 'dk-btn dk-quiet', text: 'Cancel', onclick: () => done(false) }));
      }
      const tiny = (text, label, fn, off) => h('button', {
        type: 'button', class: 'dk-btn dk-quiet dk-tc-tiny', text, title: label, 'aria-label': label,
        disabled: off, onclick: fn
      });
      return h('div', { class: 'dk-tc-cat' },
        h('span', { class: 'dk-lb', text: c }),
        tiny('↑', 'Move ' + c + ' up', () => moveCat(c, -1), idx === 0),
        tiny('↓', 'Move ' + c + ' down', () => moveCat(c, 1), idx === total - 1),
        tiny('✎', 'Rename ' + c, () => { renaming = c; render(); }));
    }

    function settings(sheet) {
      if (!st.items.length) sheet.append(h('div', { class: 'dk-empty', text: 'Nothing tracked yet. Add the first thing you like to keep listed below.' }));
      const order = cats();
      order.forEach((c, idx) => {
        const list = st.items.filter((i) => (i.cat || 'Other') === c);
        sheet.append(catHead(c, idx, order.length));
        for (const it of list) {
          sheet.append(h('div', { class: 'dk-row', style: 'padding:6px 0' },
            h('div', { class: 'dk-t', style: 'cursor:default' },
              h('strong', { text: it.name }),
              h('span', { text: 'Keep ' + it.keep + ' listed · matches ' + (it.match && it.match.length ? it.match.join(', ') : it.name) })),
            h('button', { type: 'button', class: 'dk-btn dk-quiet', text: 'edit', style: 'padding:2px 6px', onclick: () => { editing = it.id; render(); } }),
            h('button', {
              type: 'button', class: 'dk-btn dk-quiet', text: 'remove', style: 'padding:2px 6px',
              onclick: () => { st.items = st.items.filter((x) => x !== it); persist(); paintCard(); render(); }
            })));
        }
      });

      const it = st.items.find((x) => x.id === editing);
      const catList = h('datalist', { id: 'dk-tc-cats' }, ...cats().map((c) => h('option', { value: c })));
      const name = h('input', { type: 'text', value: it ? it.name : '', placeholder: 'Black Sage', 'aria-label': 'Name' });
      const keep = h('input', { type: 'number', min: '1', max: '99', value: String(it ? it.keep : 1), 'aria-label': 'Keep listed' });
      const match = h('input', { type: 'text', value: it && it.match ? it.match.join(', ') : '', placeholder: 'Words in the trade title, comma separated (optional)', 'aria-label': 'Match words' });
      const cat = h('input', { type: 'text', value: it ? it.cat || '' : '', list: 'dk-tc-cats', placeholder: 'Herbs', 'aria-label': 'Category' });
      const err = h('div', { class: 'dk-note', style: 'margin-top:4px' });
      const commit = () => {
        const n = name.value.trim();
        const k = Math.max(1, Math.min(99, Math.round(Number(keep.value) || 1)));
        if (!n) { err.textContent = 'Give it a name first.'; name.focus(); return; }
        const entry = { id: it ? it.id : Date.now().toString(36), name: n, keep: k,
          match: match.value.split(',').map((s) => s.trim()).filter(Boolean), cat: cat.value.trim() || 'Other' };
        if (it) Object.assign(it, entry);
        else st.items.push(entry);
        editing = null;
        persist();
        paintCard();
        render();
      };
      [name, keep, match, cat].forEach((el) => el.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); }));

      sheet.append(
        catList,
        h('div', { class: 'dk-lb', text: it ? 'Edit ' + it.name : 'Add something to keep listed' }),
        h('label', { text: 'Name' }), name,
        h('div', { class: 'dk-two' },
          h('div', {}, h('label', { text: 'Keep listed' }), keep),
          h('div', {}, h('label', { text: 'Category' }), cat)),
        h('label', { text: 'Match words' }), match,
        err,
        h('div', { class: 'dk-btns' },
          h('button', { type: 'button', class: 'dk-btn dk-primary', text: it ? 'Save' : 'Add', onclick: commit }),
          it ? h('button', { type: 'button', class: 'dk-btn dk-quiet', text: 'Cancel', onclick: () => { editing = null; render(); } }) : null),
        h('div', { class: 'dk-note', text: 'The card on Manage Your Trades counts titles containing the name (or any of the match words), ignoring case, emoji, and punctuation.' })
      );
    }

    return {
      id: 'trades', name: 'Store Front', blurb: 'What to restock, and offers waiting',
      start() { if (!styleEl.isConnected) document.head.appendChild(styleEl); paintCard(); },
      stop() { if (card) card.remove(); card = null; styleEl.remove(); },
      // Data only. Painting is start()'s job, so a restore never draws the card
      // for a Store Front that is switched off.
      reload,
      settings
    };
  })());

  // ===================================================== module: genetics

  defineModule((() => {
    const TIERS = { 0: 'Common', 1: 'Grove', 2: 'Raffle', 3: 'Event', 4: 'Special breeding', 6: 'Breeding (combos)', 7: 'Random Marking Applicator', 8: 'Newly befriended wolves', 10: 'Special breeding (combos)' };

    const gst = {};
    const MARKS = ['bevel', 'bar', 'line', 'dot', 'rule'];
    const reloadGenes = () => Object.assign(gst,
      { explain: true, pips: true, events: 'one', mark: 'bevel' }, load('genes', {}));
    reloadGenes();

    /* ------------------------------------------------------------------ *
       The highlight colour system.

       One rule for the whole page, rather than a separate rule for every row:
         HUE says where a trait came from, and says it the same way everywhere.
         The card says how rare it is; only markings carry pips for that.

       The hue answers one question consistently: what is the easiest way to get
       one. Anything you can simply apply counts as Customization, however else
       it may also turn up, which leaves "born wild" meaning the only route is to
       go and find it. Saturation and lightness come from the theme.
     * ------------------------------------------------------------------ */
    const ORIGIN = {
      cata:     [8, 'Cataclysms', 'ember', 1],
      rma:      [24, 'Random Marking Applicator', 'carnelian'],
      raffle:   [52, 'Raffle Studs', 'amber'],
      echoes:   [72, 'Echoes of the Ancient', 'old gold', 1],
      spring:   [100, 'Springtide Howl Fayre', 'new leaf', 1],
      wild:     [140, 'NBW only', 'moss'],
      crafted:  [168, 'Crafted applicator', 'verdigris'],
      coig:     [192, 'Coigreach', 'frost', 1],
      custom:   [216, 'Customization or Grove', 'river stone'],
      lunar:    [244, 'Lunar Dreams', 'moonlight', 1],
      hallow:   [300, 'Halloween Spectacle', 'nightshade', 1],
      breeding: [330, 'Breeding only', 'garnet'],
      match:    [352, 'The Matchmaker', 'rose quartz', 1],
      chance:   [null, 'Pure chance', 'pewter'],
      unknown:  [null, 'Not in the snapshot', '']
    };
    // Thirteen hues is more than anyone holds in their head, so by default every
    // monthly event shares one and the card names which. Switchable in settings.
    const EVENT_HUE = 264;
    const hueOf = (key) => {
      const row = ORIGIN[key];
      if (!row) return null;
      return gst.events === 'each' ? row[0] : (row[3] ? EVENT_HUE : row[0]);
    };

    function sourceKey(src) {
      const s = String(src || '').toLowerCase();
      if (s.includes('lunar')) return 'lunar';
      if (s.includes('matchmaker')) return 'match';
      if (s.includes('springtide')) return 'spring';
      if (s.includes('cataclysm')) return 'cata';
      if (s.includes('halloween')) return 'hallow';
      if (s.includes('coigreach')) return 'coig';
      if (s.includes('echoes')) return 'echoes';
      if (s.includes('raffle')) return 'raffle';
      if (s.includes('craft')) return 'crafted';
      if (s.includes('rma')) return 'rma';
      if (s.includes('breed-only') || s.includes('breed only') ||
          s.includes('breeding') || s.includes('deviation')) return 'breeding';
      if (s.includes('special nbw')) return 'wild';
      if (s.includes('custom')) return 'custom';
      if (/\bnbws?\b/.test(s)) return 'custom';   // NBW traits can also be applied
      return null;
    }

    // Everything a highlight needs: a source, whether it is lethal, and for a
    // marking how rare it is. Nothing falls back to a real source, because a
    // wrong answer is worse than an obvious gap.
    function traitOf(label, name) {
      const key = k(name);
      const miss = { o: 'unknown' };
      if (label === 'Base') {
        const b = GENETICS.bases[key];
        if (!b) return miss;
        return { o: b.c || b.b ? 'breeding' : (sourceKey(b.s) || (b.a ? 'crafted' : 'custom')) };
      }
      // The genetics string describes the base, so it carries the base's colour.
      if (label === 'Base Genetics') {
        const b = wolfBase();
        return b ? traitOf('Base', b) : miss;
      }
      // Variants are unlocked with a crafted recipe.
      if (label === 'Variant') return { o: 'crafted' };
      if (label === 'Eyes') {
        const e = GENETICS.eyes[key];
        if (!e) return miss;
        return { o: e.b || /^hetero\s/i.test(e.n) ? 'breeding' : (sourceKey(e.s) || 'custom') };
      }
      if (/Mutation$/.test(label)) {
        const m = GENETICS.muts[key];
        if (!m) return miss;
        const o = m.t === 'genetic' ? 'breeding' : m.t === 'applicator' ? 'crafted' : 'chance';
        return { o, lethal: !!m.l };
      }
      if (label === 'Skin' || label === 'Nose' || label === 'Claws') {
        const src = GENETICS.snc[label === 'Claws' ? 'claw' : label.toLowerCase()][key];
        if (src == null) return miss;
        return { o: sourceKey(src) || 'custom' };
      }
      if (/^Slot \d+$/.test(label)) {
        const row = GENETICS.marks[key];
        if (!row) return miss;
        const [tier, src] = row;
        const lbl = GENETICS.markSources[src] || '';
        const combo = tier === 6 || tier === 10 || /combo/i.test(lbl);
        const rare = combo ? 4 : tier === 7 || tier === 8 || tier === 4 ? 3
          : tier === 3 ? 2 : tier === 2 || tier === 1 ? 1 : 0;
        return { o: combo ? 'breeding' : sourceKey(lbl) || 'unknown', rare, combo, breedOnly: tier === 10 };
      }
      return miss;
    }

    // Counting explains itself, so rarity is dots. The two kinds of hard-to-get
    // get their own mark instead: a star for a combo, a heart for breed-only.
    const PIPS = ['●', '●●', '●●●', '●●●●'];
    function pipsFor(t) {
      if (t.rare == null) return '';
      if (t.combo || t.breedOnly) return (t.combo ? '★' : '') + (t.breedOnly ? '♥' : '');
      return PIPS[t.rare] || '';
    }

    const wiki =(page) => ({ href: GENETICS.wiki + page, text: 'More on the Grouse House Wiki ›' });
    const k = (s) => String(s || '').toLowerCase().split(/\s+/).filter(Boolean).join(' ');
    const notFound = (name) => popCard(name, null, [
      'Not in Twill’s wiki snapshot (taken ' + GENETICS.exported + '), so it may be newer than that.'
    ], { href: GENETICS.wiki, text: 'Grouse House Wiki ›' });

    function groupWords(g) {
      const m = String(g || '').match(/^(\w+)\s+(Light|Medium|Dark)(?:\s+([IV]+))?$/);
      if (!m) return g ? 'Genetics: ' + g : null;
      if (m[1] === 'Special') return 'Special base, ' + m[2].toLowerCase() + ' shade. Special bases have no rarity.';
      return g + ': ' + m[1].toLowerCase() + ' colour, ' + m[2].toLowerCase() + ' shade, rarity ' + (m[3] || '?') + '.';
    }

    /* A source label is not one route, it is a set of them, and the wiki is
       explicit about which. Tier 0 markings turn up on befriended wolves AND
       apply from the Customiser AND from Grove applicators; NBW skins, noses and
       claws are the same. Only Tier 8 markings are befriend-only ("NBWs without
       a star indicator cannot have one of these"). Listing every route is the
       honest answer to "how do I get one". */
    const ROUTES = [
      [/special nbw/i, ['Special befriendable wolves, lead level 15+']],
      [/nbws? and custom/i, ['Befriending', 'Wolf Customiser', 'Grove Items']],
      [/^nbw$/i, ['Befriending', 'Wolf Customiser', 'Grove Items']],
      [/^custom(ization)?$/i, ['Wolf Customiser', 'Grove Items']],
      [/raffle/i, ['Raffle Studs', 'Deviation of a raffle marking']],
      [/special breeding combo/i, ['Breeding only, never a Random Marking Applicator']],
      [/combo/i, ['Breeding']],
      [/breed-only/i, ['Breeding']],
      [/applicator/i, null]   // the label already names the applicator
    ];
    const routesFor = (label) => {
      for (const [re, list] of ROUTES) if (re.test(String(label || ''))) return list;
      return null;
    };
    const sourceLine = (label) => {
      const r = routesFor(label);
      return r ? r.join(' · ') : label;
    };

    // "Monthly [Lunar Dreams]" -> "Lunar Dreams applicator"; "Crafted Applicators"
    // -> "crafted applicator". The wiki words these as section headings.
    function sourceWords(s) {
      const m = String(s || '').match(/\[([^\]]+)\]/);
      if (m) return m[1] + ' applicator';
      return /crafted/i.test(s) ? 'Crafted applicator' : s;
    }

    /* Every combo colour, and the two colours that make it, indexed the other way
       round: given a colour, what can it combine into. This is what turns a
       marking you own into "pair this with X and the pups can get Y". */
    let factorIndex = null;
    const FACTOR_OF = () => {
      // Built on first use: the generated GENETICS block sits further down the
      // file than this module, so it does not exist yet while this is defined.
      if (!factorIndex) {
        factorIndex = {};
        for (const [combo, pair] of Object.entries(GENETICS.combos || {})) {
          for (let i = 0; i < 2; i++) {
            const mine = k(pair[i]), other = pair[1 - i];
            (factorIndex[mine] || (factorIndex[mine] = [])).push({ combo, other });
          }
        }
      }
      return factorIndex;
    };

    // Every shape a combo colour already exists in, e.g. all the Deira markings.
    const shapesOf = (colour) => Object.keys(GENETICS.marks)
      .filter((key) => key.startsWith(k(colour) + ' '))
      .map((key) => key.slice(colour.length + 1))
      .sort();

    const title = (s) => String(s).replace(/\b\w/g, (c) => c.toUpperCase());

    // Split "Beige Orca" into its combo colour and its shape, when the colour is
    // one that can combine at all. Longest colour first, so "Dark Crystal" wins.
    function splitFactor(name) {
      const key = k(name);
      const colour = Object.keys(FACTOR_OF()).sort((a, b) => b.length - a.length)
        .find((c) => key.startsWith(c + ' '));
      return colour ? { colour, shape: key.slice(colour.length + 1) } : null;
    }

    // A section listing several values, each on its own line.
    const secList = (label, rows, why) => h('div', { class: 'dk-pop-sec' },
      h('div', { class: 'dk-pop-lb', text: label }),
      h('div', { class: 'dk-pop-list' }, ...rows),
      gst.explain && why ? h('div', { class: 'dk-muted', text: why }) : null);

    // This wolf's own base, read off the page it is on, so a combination can show
    // which half you already hold.
    function wolfBase() {
      for (const lab of document.querySelectorAll('#main td.b')) {
        if (lab.textContent.replace(/\s+/g, ' ').trim() !== 'Base') continue;
        const cell = lab.nextElementSibling;
        if (!cell) return null;
        // The name is the cell's first text. Genetics marks the cell itself and
        // only appends after the name, so the first text is always the name.
        const node = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
        return node ? k(node.textContent) : null;
      }
      return null;
    }

    // Pull a base's genetics string apart: "Warm Medium III" and "Special Dark".
    function genetics(g) {
      const m = String(g || '').match(/^(.+?)\s+(Light|Medium|Dark)(?:\s+([IVX]+))?$/);
      if (!m) return null;
      return { group: m[1], shade: m[2], tier: m[3] || '*' };
    }

    // The category line: what kind of thing this is, in the terms the game uses.
    function baseCategory(b) {
      const g = genetics(b.g);
      if (b.c) return 'Combo base' + (b.cn ? ', night only' : '');
      if (!g) return 'Base';
      return g.group === 'Special' ? 'Special base' : 'Base, tier ' + g.tier;
    }

    // One "Label: value" line, for cards that read as a short spec sheet.
    const field = (label, value, why) => (value == null || value === '' ? null
      : h('div', { class: 'dk-pop-f2' },
          h('b', { text: label + ': ' }),
          typeof value === 'string' ? document.createTextNode(value) : value,
          gst.explain && why ? h('div', { class: 'dk-muted', text: why }) : null));

    function baseCard(name) {
      const b = GENETICS.bases[k(name)];
      if (!b) return notFound(name);
      const g = genetics(b.g);
      // Which combo bases this one is a factor for, read back out of the table.
      const factorFor = Object.values(GENETICS.bases).filter((x) => x.c &&
        x.c.some((f) => k(f) === k(b.n)));
      // Crafted applicators are real recipes, so show the recipe rather than just
      // naming the item.
      const recipe = b.a && RECIPE_BOOK.recipes.find((r) => norm(r.n) === norm('Base Applicator [' + b.n + ']'));
      const source = b.s ? sourceWords(b.s) : b.b ? 'Breeding only' : b.a ? 'Applicator' : 'Customization or born wild';
      // Mark whichever half of a combination this wolf already has, so you can see
      // at a glance which factor you still need to breed to.
      const mine = k(b.n);
      const have = wolfBase() || mine;
      const side = (f) => (k(f) === have ? h('b', { class: 'dk-have', title: 'This wolf’s base', text: f }) : h('span', { text: f }));

      return popCard(b.n, b.c ? 'combo base' : 'base', [
        field('Category', baseCategory(b)),
        g ? field('Genetics', g.group + ' · ' + g.shade + (g.tier === '*' ? '' : ' · tier ' + g.tier)) : field('Genetics', b.g),
        field('Source', source),
        b.c ? h('div', { class: 'dk-pop-f2' }, h('b', { text: 'Combination: ' }), side(b.c[0]), h('span', { text: ' + ' }), side(b.c[1])) : null,
        b.cn ? field('Breeding condition', 'Must be bred at night', 'Wolvden time, not yours. The sidebar shows a moon when it is night.') : null,
        factorFor.length
          ? secList('Combines into', factorFor.map((x) => h('div', {},
              h('span', { text: x.n + '  ' }),
              h('span', { class: 'dk-muted' }, side(x.c[0]), h('span', { text: ' + ' }), side(x.c[1]),
                h('span', { text: x.cn ? ', at night' : '' })))),
            'Breed ' + b.n + ' to the other factor and the pups can take the combo base.')
          : (b.c ? null : field('Combines into', 'Nothing')),
        recipe ? h('div', { class: 'dk-pop-sec' },
          h('div', { class: 'dk-pop-lb', text: 'Recipe' }), recipeBlock(recipe)) : null
      ], wiki(b.c ? 'Combo_Bases' : 'Alphabetical_Base_Catalogue'));
    }

    /* The Base Genetics row is one string holding three separate things, and those
       three are what actually decide standard base breeding. */
    function geneticsCard(value) {
      const g = genetics(value);
      if (!g) return popCard(value, 'base genetics', [groupWords(value)], wiki('Base_Genetics'));
      const special = g.group === 'Special';
      return popCard(value, 'base genetics', [
        field('Category', special ? 'Special' : g.shade + ', tier ' + g.tier),
        field('Colour group', g.group),
        field('Shade', g.shade),
        field('Tier', special ? 'None. Special bases have no rarity tier.' : g.tier,
          special ? null : 'Higher tiers are rarer.')
      ], wiki('Base_Genetics'));
    }

    // Heterochromia eyes are named "Hetero A & B", so both the factor question and
    // the outcomes fall straight out of the catalogue's own names.
    let heteroIndex = null;
    const HETERO = () => {
      if (!heteroIndex) {
        heteroIndex = {};
        for (const e of Object.values(GENETICS.eyes)) {
          const m = String(e.n).match(/^Hetero\s+(.+?)\s*&\s*(.+)$/i);
          if (!m) continue;
          for (const part of [m[1], m[2]]) (heteroIndex[k(part)] || (heteroIndex[k(part)] = [])).push(e.n);
        }
      }
      return heteroIndex;
    };

    function eyeCard(name) {
      const e = GENETICS.eyes[k(name)];
      if (!e) return notFound(name);
      const produces = HETERO()[k(e.n)] || [];
      const isHetero = /^hetero\s/i.test(e.n);
      return popCard(e.n, 'eyes', [
        field('Category', isHetero ? 'Heterochromia' : e.b ? 'Breed-only eye' : e.a ? 'Applicator eye' : 'Eye'),
        field('Source', e.s || (e.b ? 'Breeding only' : '')),
        e.f && e.f.length ? field('Fails to', e.f.join(' · '),
          'A pup that doesn’t inherit ' + e.n + ' gets one of these instead.') : null,
        field('Hetero factor', produces.length ? 'Yes' : 'No'),
        produces.length ? secList('Can produce', produces.map((n) => h('div', { text: n })),
          'Bred to the other colour, in an established pairing.') : null
      ], wiki(isHetero ? 'Eye_Genetics' : 'Alphabetical_Eye_Catalogue'));
    }

    // Twill's own wording for the effects the wiki records, so none of its prose
    // travels. Each flag is one mechanical fact.
    const EFFECTS = {
      'layers': 'Drawn over every other visible gene.',
      'layers-not-eyes': 'Drawn over every other visible gene except the eyes.',
      'layers-dark': 'Its dark patches are drawn over every other visible gene.',
      'layers-light': 'Its light patches are drawn over every other visible gene.',
      'herbalist-only': 'Cannot lead, train, apprentice, or take any role but Herbalist.',
      'strength-finisher': 'Adds to Strength, and to Finisher success on a hunt.'
    };

    function mutCard(name, slotLabel) {
      const m = GENETICS.muts[k(name)];
      if (!m) return notFound(name);
      const how = {
        applicator: ['Applicator', 'It can also be passed down by a parent.'],
        genetic: ['Genetic', 'Passed down through breeding, and wolves can carry it.'],
        random: ['Random', 'It can turn up by chance.']
      }[m.t];
      const status = m.l ? 'Lethal, dies at ' + (m.age || 'a young age')
        : m.ad ? 'Adult only' : 'Not lethal';
      const details = (m.e || []).map((x) => EFFECTS[x]).filter(Boolean);
      return popCard(m.n, (m.slot || slotLabel || 'mutation').toLowerCase(), [
        field('Category', how ? how[0] + ' mutation' : 'Mutation', how ? how[1] : null),
        field('Source', how ? how[0] : ''),
        field('Slot', m.slot || slotLabel || ''),
        field('Status', status,
          m.l ? 'Always before adolescence. An Osha from Raccoon Wares can keep them longer.'
            : m.ad ? 'Hidden until the wolf turns one; the page warns that one is present.' : null),
        details.length ? secList('Details', details.map((d) => h('div', { text: d }))) : null
      ], wiki('Mutations'));
    }

    function markCard(name, extra) {
      const r = GENETICS.marks[k(name)];
      if (!r) return notFound(name);
      const [tier, src, item] = r;
      const S = GENETICS.markSources;
      const colour = Object.keys(GENETICS.combos).sort((a, b) => b.length - a.length).find((c) => k(name).startsWith(c + ' '));
      const pair = colour && GENETICS.combos[colour];
      const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

      /* If this marking's colour is a combination factor, say what it makes.
         The two parents' shapes do NOT have to match: the pup can take either
         parent's shape, so long as that shape exists in the combo colour. So the
         pairing is always on, and the same-type outcome is the extra prize when
         this marking's own shape has a combo version. */
      const me = !pair && splitFactor(name);
      const makes = me ? (FACTOR_OF()[me.colour] || []).map((x) => ({
        ...x,
        same: GENETICS.marks[k(x.combo + ' ' + me.shape)] ? title(x.combo + ' ' + me.shape) : null
      })) : [];
      const shapeWord = me ? title(me.shape) : '';

      return popCard(name, 'tier ' + tier + (TIERS[tier] ? ' · ' + TIERS[tier].toLowerCase() : ''), [
        field('Category', 'Tier ' + tier + (TIERS[tier] ? ' · ' + TIERS[tier] : '')),
        field('Source', S[src] && !(pair && /^combo$/i.test(S[src]))
          ? sourceLine(S[src]) + (item != null && S[item] ? ' (' + S[item] + ')' : '') : (pair ? 'Breeding' : ''),
          S[src] && routesFor(S[src]) && routesFor(S[src]).length > 1 ? 'Any of these gets you one.' : null),
        extra && extra.opacity ? field('Opacity', extra.opacity) : null,
        field('Combination status', pair ? 'Combo marking' : makes.length ? 'Combination factor' : 'Not a factor'),
        pair ? field('Combo factors', pair[0] + ' + ' + pair[1],
          cap(colour) + ' needs both colours in the same slot on the two parents.') : null,
        tier === 10 ? field('Breeding condition', 'Breeding only, never from a Random Marking Applicator',
          'Tier 10 combos use the special breed-only shapes, Brindle and Inverted Brindle.') : null,
        makes.length
          ? secList('Pairs with', makes.map((x) => h('div', {},
              h('span', { text: 'Any ' + x.other + ' marking' }),
              h('span', { class: 'dk-muted', text: '  makes ' + title(x.combo) }))),
            'Same slot on both parents. The shapes need not match: a pup can take either parent’s shape, if that shape exists in the combo colour.')
          : null,
        makes.length
          ? secList('Same-type outcome', makes.map((x) => h('div', {},
              h('span', { text: x.same || title(x.combo) + ' ' + shapeWord }),
              x.same ? null : h('span', { class: 'dk-muted', text: '  does not exist' }))),
            'What you get if the pup keeps this marking’s own shape.')
          : null,
        pair && gst.shapes !== false ? (() => {
          const all = shapesOf(colour).map(title);
          const shown = all.slice(0, 24);
          return secList('Existing ' + cap(colour) + ' markings',
            [h('span', { text: shown.join(', ') + (all.length > shown.length ? ', and ' + (all.length - shown.length) + ' more' : '') })],
            'Shapes this combo colour already exists in. Switch this list off in Genetics settings.');
        })() : null
      ], wiki(pair ? 'Combo_Markings' : 'Alphabetical_Marking_Catalogue'));
    }

    function traitCard(kind, name) {
      const src = GENETICS.snc[kind][k(name)];
      if (src == null) return notFound(name);
      const word = { skin: 'skin', nose: 'nose', claw: 'claws' }[kind];
      const category = /^NBW$/i.test(src) ? 'NBW, and Applicator'
        : /^Custom$/i.test(src) ? 'Customization' : 'Applicator';
      return popCard(name, word, [
        field('Category', category),
        field('Source', sourceLine(src),
          routesFor(src) && routesFor(src).length > 1 ? 'Any of these gets you one.' : null),
        field('Status', 'Not lethal'),
        field('Pass rate', '50% from either parent',
          'Each pup takes its ' + word + ' from its mother or its father, evenly.')
      ], wiki('WIP_Skin,_Nose,_and_Claw_Genetics'));
    }

    function variantCard(name) {
      const r = RECIPE_BOOK.recipes.find((x) => norm(x.n) === norm('Pose Variant [' + name + ']'));
      if (!r) return popCard(name, 'variant', ['No details yet: the wiki’s variants page is still being written.'], { href: GENETICS.wiki + 'WIP_Variants', text: 'Grouse House Wiki ›' });
      return popCard(name, 'pose variant', [h('div', { class: 'dk-muted', text: 'Unlocked with a crafted recipe:' }), recipeBlock(r)], null);
    }

    /* Personality is not a gene, but it is inherited like one: a pup takes a
       personality from one of its parents' dispositions 9 times in 10. Wolvden's
       page only ever names the personality, so Twill adds the disposition as a
       labelled pill in front of it, and the pill opens the card. Wolvden's own ?
       beside it (the lead wolf bonus) is left exactly where it is. */
    const DISP_COLOUR = { Aggressive: '#b0463a', Friendly: '#4f7a3a', Romantic: '#a8487a', Stoic: '#3f6a90' };
    const STAT_WORD = { STR: 'Strength', SPD: 'Speed', AGI: 'Agility', WIS: 'Wisdom', SMR: 'Smarts' };
    const dispDot = (d) => h('span', { class: 'dk-pe-dot', style: 'background:' + (DISP_COLOUR[d] || 'var(--dk-muted)') });
    const socialOf = (a, b) => (a === b ? PERSONALITY.social.same : PERSONALITY.social[[a, b].sort().join('|')]) || 0;

    function personalityCard(name) {
      const p = PERSONALITY.p[k(name)];
      if (!p) return notFound(name);
      const d = p.d;
      const stats = Object.entries(p.s).sort((a, b) => b[1] - a[1]).map(([st, v]) =>
        h('span', { class: v >= 7 ? 'dk-pe-up2' : v > 0 ? '' : 'dk-pe-dn',
          text: (v > 0 ? '+' : '−') + Math.abs(v) + ' ' + STAT_WORD[st] }));
      const foes = PERSONALITY.clash.filter((pair) => pair.includes(d)).map((pair) => pair.find((x) => x !== d));
      const fine = PERSONALITY.disp.filter((x) => !foes.includes(x));
      const list = (xs) => (xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : xs[0] || '');
      const soc = PERSONALITY.disp.slice().sort((a, b) => socialOf(d, b) - socialOf(d, a)).flatMap((x) => {
        const v = socialOf(d, x);
        return [h('span', {}, dispDot(x), x + (x === d ? ', the same' : '')), h('span', { text: (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) })];
      });
      const others = Object.values(PERSONALITY.p).filter((x) => x.d === d && x.n !== p.n).map((x) => x.n);
      // A sentence rather than a value, so it reads at body weight like the gene cards' fields.
      const secText = (label, text) => h('div', { class: 'dk-pop-sec' },
        h('div', { class: 'dk-pop-lb', text: label }), h('div', { text }));
      return popCard(p.n, d + ' disposition', [
        secList('Stats', [h('div', { class: 'dk-pe-stats' }, ...stats)],
          'Added to the wolf’s own stats. They change with the personality and are never passed to pups.'),
        secText('Pups', '9 in 10 take a personality from one of their parents’ dispositions. 1 in 10 get any of the 40.'),
        secText('Hunting', (foes.length ? 'Argues with ' + list(foes) + ' hunters, which can fail a hunt. ' : '') + 'Fine with ' + list(fine) + '.'),
        secList('Socializing with', [h('div', { class: 'dk-pe-soc' }, ...soc)],
          'How much a relationship moves each time the two socialize.'),
        secList('Also ' + d, [h('div', { class: 'dk-muted', text: others.join(' · ') })]),
        h('div', { class: 'dk-muted', style: 'margin-top:6px', text: 'The Personality Snake sells a Personality Changer to choose one, or a ' + d + ' Personality Randomiser for a random ' + d + ' one.' })
      ], { href: PERSONALITY.wiki, text: 'More on the Grouse House Wiki ›' });
    }

    function decoratePersonality() {
      for (const lab of document.querySelectorAll('#main td.b')) {
        if (lab.textContent.replace(/\s+/g, ' ').trim() !== 'Personality') continue;
        const cell = lab.nextElementSibling;
        if (!cell || cell.dataset.dkGene) continue;
        const node = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
        if (!node) continue;
        const name = node.textContent.replace(/\s+/g, ' ').trim();
        const p = PERSONALITY.p[k(name)];
        const pill = h('span', {
          class: 'dk-pe-pill', tabIndex: 0, role: 'button', text: p ? p.d : '?',
          'aria-label': p ? name + ', ' + p.d + ' disposition' : name
        });
        if (p) pill.style.setProperty('--pe', DISP_COLOUR[p.d]);
        const open = (pin) => showPop(pill, personalityCard(name), pin);
        const onEnter = () => { if (!popSticky) open(false); };
        const onClick = (e) => {
          e.stopPropagation();
          if (popSticky && popAnchor === pill) hidePop();
          else open(true);
        };
        pill.addEventListener('mouseenter', onEnter);
        pill.addEventListener('focus', onEnter);
        pill.addEventListener('mouseleave', hideSoon);
        pill.addEventListener('blur', hideSoon);
        pill.addEventListener('click', onClick);
        // In front of the name; nothing of Wolvden's is rewritten, and stop()
        // takes the pill away again along with its listeners.
        node.before(pill);
        cell.dataset.dkGene = '1';
        wrapped.push({ cell, added: [pill], handlers: { onEnter, onClick } });
      }
    }

    // Row label on Wolvden's wolf page -> how to explain its value.
    function cardFor(label, name, extra) {
      if (label === 'Base') return baseCard(name);
      if (label === 'Base Genetics') return geneticsCard(name);
      if (label === 'Eyes') return eyeCard(name);
      if (label === 'Skin') return traitCard('skin', name);
      if (label === 'Nose') return traitCard('nose', name);
      if (label === 'Claws') return traitCard('claw', name);
      if (/Mutation$/.test(label)) return mutCard(name, label);
      if (label === 'Variant') return variantCard(name);
      if (/^Slot \d+$/.test(label)) return markCard(name, extra);
      return null;
    }

    // The hub's search draws these too, so one query can answer "what is Deira"
    // as fully as hovering the gene on a wolf's page does.
    geneCards = { eyeCard, markCard, baseCard, mutCard, traitCard, variantCard, geneticsCard, personalityCard };

    // Test pages in dev/ (never real Wolvden pages) can draw these for previews.
    if (document.querySelector('meta[name="dk-fixture"]')) window.__denkitCards = geneCards;

    const LABELS = /^(Base|Base Genetics|Eyes|Skin|Nose|Claws|Mutation|Secondary Mutation|Tertiary Mutation|Variant|Slot \d+)$/;
    const wrapped = [];

    function decorate() {
      for (const lab of document.querySelectorAll('#main td.b')) {
        const label = lab.textContent.replace(/\s+/g, ' ').trim();
        if (!LABELS.test(label)) continue;
        const cell = lab.nextElementSibling;
        if (!cell || cell.dataset.dkGene) continue;
        // The name is the cell's first text; Wolvden adds (0.52%) or (65% : T6) after it.
        const node = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
        if (!node) continue;
        const name = node.textContent.replace(/\s+/g, ' ').trim();
        if (!name || /^none\.?$/i.test(name)) continue;
        // Every wolf has a Variant, and almost every wolf's is Default. Marking it
        // says nothing and puts a colour on ten rows in eleven, so the default
        // reads as what it is: an empty slot, exactly like "None".
        if (label === 'Variant' && /^default\.?$/i.test(name)) continue;
        const small = cell.querySelector('small');
        const om = small && small.textContent.match(/(\d+%)/);
        const extra = { opacity: om ? om[1] : null };

        /* The whole cell is the target, not just the name, so the colour wash
           spans the row the way it reads best. Nothing in the cell is rewritten;
           a marker and (on markings) the pips are appended, and taken away again
           by stop(). */
        const t = traitOf(label, name);
        const hue = hueOf(t.o);
        cell.dataset.dkGene = '1';
        cell.classList.add('dk-gene', 'dk-m-' + (MARKS.includes(gst.mark) ? gst.mark : 'bevel'));
        if (hue == null) cell.classList.add('dk-gene-none');
        else cell.style.setProperty('--gh', hue);
        if (t.lethal) cell.classList.add('dk-gene-lethal');
        cell.tabIndex = 0;

        const added = [];
        const pipText = gst.pips ? pipsFor(t) : '';
        if (pipText) {
          const pips = h('span', { class: 'dk-gene-pips', text: pipText,
            title: t.breedOnly ? 'Breed-only' : t.combo ? 'Combo' : 'Rarity' });
          cell.append(pips);
          added.push(pips);
        }
        const q = h('span', { class: 'dk-gene-q', text: '?', 'aria-hidden': 'true' });
        cell.append(q);
        added.push(q);

        const open = (pin) => { const c = cardFor(label, name, extra); if (c) showPop(cell, c, pin); };
        const onEnter = () => { if (!popSticky) open(false); };
        const onClick = (e) => {
          e.stopPropagation();
          if (popSticky && popAnchor === cell) hidePop();
          else open(true);
        };
        cell.addEventListener('mouseenter', onEnter);
        cell.addEventListener('focus', onEnter);
        cell.addEventListener('mouseleave', hideSoon);
        cell.addEventListener('blur', hideSoon);
        cell.addEventListener('click', onClick);
        wrapped.push({ cell, added, handlers: { onEnter, onClick } });
      }
    }

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* The whole value cell is the target. --gh is the hue for where this trait
         comes from; the saturation and lightness come from the theme, so every
         hue re-fits when you switch.

         Five ways to carry that colour, chosen in the module's settings and set
         on the cell as .dk-m-<name>. They all answer the same question - scan a
         column, see where each trait came from - and differ only in how loud
         they are and how much of Wolvden's own table they disturb. Lethal is a
         status, not a source, so it keeps the source hue and adds stripes; the
         mark is striped, never the row. Nothing else here is striped. */
      .dk-gene {
        --g: hsl(var(--gh, 216) var(--dk-gene-s, 72%) var(--dk-gene-l, 55%));
        --stripe: repeating-linear-gradient(45deg, #c0392b 0 3px, #7b241c 3px 6px);
        position: relative; cursor: help; outline: none;
        transition: background .15s ease, box-shadow .15s ease;
      }
      .dk-gene.dk-gene-none { --g: var(--dk-muted); }

      /* The fill, shared by bevel and bar, is always on and symmetric: the
         trait's colour at both ends of the cell, fading out through the middle.
         A one-way sweep from the left is the gesture every other script uses;
         holding the row between two soft edges is not, and it keeps the line
         readable in the middle where the words actually are. */
      .dk-m-bevel, .dk-m-bar {
        background: linear-gradient(90deg,
          color-mix(in srgb, var(--g) 13%, transparent),
          transparent 50%,
          color-mix(in srgb, var(--g) 13%, transparent));
      }
      .dk-m-bevel:hover, .dk-m-bevel:focus, .dk-m-bevel.dk-gene-on,
      .dk-m-bar:hover, .dk-m-bar:focus, .dk-m-bar.dk-gene-on {
        background: linear-gradient(90deg,
          color-mix(in srgb, var(--g) 24%, transparent),
          color-mix(in srgb, var(--g) 4%, transparent) 50%,
          color-mix(in srgb, var(--g) 24%, transparent));
      }

      /* bevel: a pill, not a border - inset from the cell edge and from the top
         and bottom, rounded, lit from above the way Twill's panels are. */
      .dk-m-bevel { padding-left: 26px !important; }
      .dk-m-bevel::before {
        content: ''; position: absolute; left: 5px; top: 4px; bottom: 4px;
        width: 5px; border-radius: 3px;
        background: linear-gradient(180deg,
          color-mix(in srgb, var(--g) 70%, white), var(--g) 38%,
          color-mix(in srgb, var(--g) 78%, black));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.5), inset 0 -1px 0 rgba(0,0,0,.35);
        transition: box-shadow .15s ease;
      }
      .dk-m-bevel:hover, .dk-m-bevel:focus, .dk-m-bevel.dk-gene-on {
        box-shadow:
          inset 0 1px 0 color-mix(in srgb, var(--g) 34%, transparent),
          inset 0 -1px 0 color-mix(in srgb, var(--g) 22%, transparent);
      }
      .dk-m-bevel:hover::before, .dk-m-bevel:focus::before, .dk-m-bevel.dk-gene-on::before {
        box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 -1px 0 rgba(0,0,0,.35),
                    0 0 10px -1px color-mix(in srgb, var(--g) 70%, transparent);
      }
      .dk-m-bevel.dk-gene-lethal::before { background: var(--stripe); }

      /* bar: a flush full-height rule on the cell's left edge, behind the same
         fill. The loudest of the five, and the shape most other Wolvden scripts
         use, so it is offered rather than assumed. */
      .dk-m-bar { box-shadow: inset 3px 0 0 var(--g); }
      .dk-m-bar:hover, .dk-m-bar:focus, .dk-m-bar.dk-gene-on {
        box-shadow: inset 5px 0 0 var(--g), 0 0 10px -2px color-mix(in srgb, var(--g) 55%, transparent);
      }
      /* border-image will not paint inside a border-collapse table, so a striped
         bar has to be a background layer pinned to the left edge instead, which
         means carrying the fill along with it. */
      .dk-m-bar.dk-gene-lethal {
        box-shadow: none;
        background-image: var(--stripe), linear-gradient(90deg,
          color-mix(in srgb, var(--g) 13%, transparent),
          transparent 50%,
          color-mix(in srgb, var(--g) 13%, transparent));
        background-size: 3px 100%, auto; background-repeat: no-repeat, no-repeat;
      }
      .dk-m-bar.dk-gene-lethal:hover, .dk-m-bar.dk-gene-lethal:focus,
      .dk-m-bar.dk-gene-lethal.dk-gene-on {
        background-size: 5px 100%, auto;
        box-shadow: 0 0 10px -2px color-mix(in srgb, #c0392b 55%, transparent);
      }

      /* line: the bar with the fill taken away. The table keeps its own colour. */
      .dk-m-line { box-shadow: inset 3px 0 0 var(--g); }
      .dk-m-line:hover, .dk-m-line:focus, .dk-m-line.dk-gene-on {
        box-shadow: inset 5px 0 0 var(--g), 0 0 10px -2px color-mix(in srgb, var(--g) 55%, transparent);
      }
      .dk-m-line.dk-gene-lethal {
        box-shadow: none; background-image: var(--stripe);
        background-size: 3px 100%; background-repeat: no-repeat;
      }
      .dk-m-line.dk-gene-lethal:hover, .dk-m-line.dk-gene-lethal:focus,
      .dk-m-line.dk-gene-lethal.dk-gene-on { background-size: 5px 100%; }

      /* dot: a token before the name. Dots still line up in a column to scan,
         but nothing touches the cell edge, so the table keeps its own shape. */
      .dk-m-dot::before {
        content: ''; display: inline-block; width: 8px; height: 8px; margin-right: 7px;
        border-radius: 50%; background: var(--g); vertical-align: 1px;
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--g) 22%, transparent);
        transition: box-shadow .15s ease;
      }
      .dk-m-dot:hover::before, .dk-m-dot:focus::before, .dk-m-dot.dk-gene-on::before {
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--g) 30%, transparent);
      }
      /* At 8px the 3px pitch reads as two stripes, so this one is drawn finer. */
      .dk-m-dot.dk-gene-lethal::before {
        background: repeating-linear-gradient(45deg, #c0392b 0 2px, #7b241c 2px 4px);
      }

      /* rule: the colour sits under the name, the width of the name. Closest to
         Twill's own hairline-edge habit, and furthest from a left border.
         Underlining the cell rather than wrapping the name keeps Wolvden's own
         text untouched; the tail, the pips and the ? escape it by not being
         inline boxes, which is what stops a propagated underline. */
      .dk-m-rule {
        text-decoration: underline;
        text-decoration-color: color-mix(in srgb, var(--g) 85%, transparent);
        text-decoration-thickness: 2px; text-underline-offset: 3px;
        transition: text-decoration-color .15s ease, background .15s ease;
      }
      .dk-m-rule small, .dk-m-rule .dk-gene-pips { display: inline-block; }
      .dk-m-rule:hover, .dk-m-rule:focus, .dk-m-rule.dk-gene-on {
        text-decoration-color: var(--g);
        background: linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--g) 20%, transparent));
      }
      /* A striped underline is not a thing CSS will draw, and a red one alone
         could be read as just another source hue, so lethal goes wavy: the one
         underline shape nothing else on the page uses. */
      .dk-m-rule.dk-gene-lethal { text-decoration-style: wavy; text-decoration-color: #c0392b; }

      .dk-gene-q {
        display: inline-grid; place-items: center; width: 14px; height: 14px; margin-left: 6px;
        border: 1px solid currentColor; border-radius: 50%; font: 700 9px/1 sans-serif;
        opacity: .6; vertical-align: 1px;
      }
      .dk-gene:hover .dk-gene-q, .dk-gene.dk-gene-on .dk-gene-q { opacity: 1; color: var(--g); }
      .dk-gene-pips { margin-left: 7px; color: var(--g); font-size: 13px; letter-spacing: 1px; vertical-align: -1px; }

      .dk-pe-pill {
        display: inline-block; margin-right: 6px; padding: 0 7px; border-radius: 9px; cursor: help;
        font: 700 9.5px/17px var(--dk-body-font); letter-spacing: .05em !important; text-transform: uppercase;
        color: #fff !important; text-shadow: none !important; background: var(--pe, #6b6b6b); vertical-align: 1px;
        transition: box-shadow .15s ease;
      }
      .dk-pe-pill:focus { outline: none; }
      .dk-pe-pill:hover, .dk-pe-pill:focus-visible, .dk-pe-pill.dk-gene-on {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--pe, #6b6b6b) 35%, transparent);
      }
    `;

    return {
      id: 'genes', name: 'Genetics', blurb: 'Explains the genes on wolf pages',
      start() {
        if (currentPage().kind !== 'wolf' || wrapped.length) return;
        document.head.appendChild(styleEl);
        decorate();
        decoratePersonality();
      },
      stop() {
        for (const w of wrapped) {
          // Wolvden's own text was never touched; only take back what was added.
          for (const el of w.added) el.remove();
          w.cell.removeEventListener('mouseenter', w.handlers.onEnter);
          w.cell.removeEventListener('focus', w.handlers.onEnter);
          w.cell.removeEventListener('mouseleave', hideSoon);
          w.cell.removeEventListener('blur', hideSoon);
          w.cell.removeEventListener('click', w.handlers.onClick);
          w.cell.classList.remove('dk-gene', 'dk-gene-none', 'dk-gene-lethal', 'dk-gene-on',
            ...MARKS.map((m) => 'dk-m-' + m));
          w.cell.style.removeProperty('--gh');
          w.cell.removeAttribute('tabindex');
          delete w.cell.dataset.dkGene;
        }
        wrapped.length = 0;
        styleEl.remove();
        hidePop();
      },
      reload: reloadGenes,
      settings(sheet) {
        const redraw = () => { this.stop(); this.start(); };
        sheet.append(
          h('div', { class: 'dk-note', style: 'margin-top:8px', text: 'On a wolf’s page, every gene gets a coloured mark saying where it came from, and the personality gets a pill naming its disposition. Hover for the card, click to pin it open and scroll, Escape to close.' }),
          check('Short explanations under each heading', gst.explain, (v) => { gst.explain = v; save('genes', gst); }),
          check('List every shape a combo colour exists in', gst.shapes !== false, (v) => { gst.shapes = v; save('genes', gst); }),
          check('Rarity pips on markings', gst.pips, (v) => { gst.pips = v; save('genes', gst); redraw(); })
        );

        // Five marks, same colour system. Which one reads best depends on the
        // theme and on how much of Wolvden's own table you want left alone.
        const MARK_NOTE = {
          bevel: 'A rounded pill inset from the edge, lit from above like Twill’s panels, over a fill that fades through the middle.',
          bar: 'A full-height rule flush to the cell’s left edge, over the same fill. The loudest, and the shape most other scripts use.',
          line: 'The same rule with the fill taken away, so the table keeps its own colour.',
          dot: 'A dot before the name. Still lines up in a column to scan, but nothing touches the cell edge.',
          rule: 'A coloured underline the width of the name. The quietest of the 5.'
        };
        sheet.append(h('div', { class: 'dk-lb', text: 'Mark style' }));
        const markNote = h('div', { class: 'dk-note', style: 'margin-top:5px', text: MARK_NOTE[gst.mark] || MARK_NOTE.bevel });
        const markSel = h('select', { 'aria-label': 'Mark style',
          onchange: (e) => {
            gst.mark = e.target.value; save('genes', gst);
            markNote.textContent = MARK_NOTE[gst.mark]; redraw();
          } },
          ...MARKS.map((m) => h('option', {
            value: m, selected: gst.mark === m,
            text: m[0].toUpperCase() + m.slice(1) })));
        sheet.append(markSel, markNote);

        sheet.append(h('div', { class: 'dk-lb', text: 'Event colours' }));
        const evSel = h('select', { 'aria-label': 'Event colours',
          onchange: (e) => { gst.events = e.target.value; save('genes', gst); redraw(); render(); } },
          h('option', { value: 'one', text: 'One colour for all events', selected: gst.events !== 'each' }),
          h('option', { value: 'each', text: 'A colour per event', selected: gst.events === 'each' }));
        // Counted from the table, so the note can never disagree with the legend.
        const hues = new Set(Object.values(ORIGIN)
          .map((row) => (gst.events === 'each' || !row[3] ? row[0] : EVENT_HUE))
          .filter((x) => x != null)).size;
        sheet.append(evSel, h('div', { class: 'dk-note', style: 'margin-top:5px',
          text: gst.events === 'each'
            ? hues + ' hues. Every monthly event is recognisable on sight, but some sit close together.'
            : hues + ' hues, spread wide. The card still names which event it came from.' }));

        // The legend, drawn in the colours this theme actually produces.
        sheet.append(h('div', { class: 'dk-lb', text: 'What the colours mean' }));
        const seen = new Set();
        for (const [key, row] of Object.entries(ORIGIN)) {
          const hue = hueOf(key);
          if (hue == null) continue;
          const event = !!row[3];
          if (event && gst.events !== 'each') {
            if (seen.has('event')) continue;
            seen.add('event');
          }
          sheet.append(h('div', { class: 'dk-gene-key' },
            h('i', { style: 'background: hsl(' + hue + ' var(--dk-gene-s) var(--dk-gene-l))' }),
            h('span', { text: event && gst.events !== 'each' ? 'Event applicator' : row[1] }),
            h('em', { text: event && gst.events !== 'each' ? 'the card names which' : row[2] })));
        }
        sheet.append(h('div', { class: 'dk-gene-key' },
          h('i', { style: 'background: var(--dk-muted)' }),
          h('span', { text: 'Pure chance, or not in the snapshot' })));

        if (gst.pips) {
          sheet.append(h('div', { class: 'dk-lb', text: 'Pips, on markings' }));
          for (const [glyph, label] of [['●', 'Common'], ['●●', 'Uncommon'],
            ['●●●', 'Notable'], ['●●●●', 'Rare'],
            ['★', 'Combo'], ['♥', 'Breed-only'], ['★♥', 'Breed-only combo, tier 10']]) {
            sheet.append(h('div', { class: 'dk-gene-key' },
              h('b', { text: glyph }), h('span', { text: label })));
          }
        }

        sheet.append(h('div', { class: 'dk-note' },
          'Facts from the ',
          h('a', { href: GENETICS.wiki, target: '_blank', rel: 'noopener', text: 'Grouse House Wiki' }),
          ' (CC BY-NC-SA), captured ' + GENETICS.exported + '. Twill words them itself.'));
      }
    };
  })());

  // ===================================================== module: notepad

  defineModule((() => {
    const st = {};
    function reload() {
      const s = load('notes', {});
      st.notes = Array.isArray(s.notes) ? s.notes : [];
      st.active = s.active || null;
      st.win = Object.assign({ x: 90, y: 90, w: 580, h: 400, open: false }, s.win);
    }
    reload();
    const persist = () => save('notes', st);

    // Notes are stored as a small, cleaned subset of HTML: bold, italic,
    // lists, line breaks, and links. Anything else is unwrapped or dropped.
    const KEEP = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'A', 'BR', 'DIV', 'P', 'SPAN', 'IMG']);
    const DROP = /^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|SVG|MATH|FORM|INPUT|TEXTAREA|BUTTON|SELECT|LINK|META|VIDEO|AUDIO)$/;
    /* Images are kept by address only. A note is stored in localStorage, which is
       about 5MB for the whole of Twill, shared with lore, pedigrees and your
       collection, and one pasted screenshot can be 2MB of data: URI. So the src
       must be an ordinary http(s) or site-relative URL: the picture stays where
       it already lives and the note costs a few dozen bytes. data: and blob: are
       refused for that reason, not a security one. */
    const IMG_SRC = /^(https?:\/\/|\/(?!\/))/i;
    function clean(html) {
      const tpl = document.createElement('template');
      tpl.innerHTML = String(html || '');
      const walk = (node) => {
        for (const child of [...node.childNodes]) {
          if (child.nodeType === 3) continue;
          if (child.nodeType !== 1 || DROP.test(child.tagName)) { child.remove(); continue; }
          walk(child);
          if (!KEEP.has(child.tagName)) { child.replaceWith(...child.childNodes); continue; }
          const href = child.tagName === 'A' ? child.getAttribute('href') || '' : '';
          const src = child.tagName === 'IMG' ? child.getAttribute('src') || '' : '';
          const alt = child.tagName === 'IMG' ? child.getAttribute('alt') || '' : '';
          for (const a of [...child.attributes]) child.removeAttribute(a.name);
          if (href && /^(https?:\/\/|\/(?!\/))/i.test(href)) {
            child.setAttribute('href', href);
            child.setAttribute('target', '_blank');
            child.setAttribute('rel', 'noopener noreferrer');
          }
          if (child.tagName === 'IMG') {
            // An img with no usable address is just an empty box; drop it.
            if (!IMG_SRC.test(src)) { child.remove(); continue; }
            child.setAttribute('src', src);
            child.setAttribute('alt', alt);
            child.setAttribute('loading', 'lazy');
            child.setAttribute('referrerpolicy', 'no-referrer');
          }
        }
      };
      walk(tpl.content);
      return tpl.innerHTML;
    }
    const textOf = (html) => {
      const tpl = document.createElement('template');
      tpl.innerHTML = String(html || '').replace(/<(br|\/div|\/p|\/li)>/gi, ' $&');
      return tpl.content.textContent.replace(/\s+/g, ' ').trim();
    };
    const words = (html) => { const t = textOf(html); return t ? t.split(' ').length : 0; };

    function when(ts) {
      const mins = Math.round((Date.now() - ts) / 60000);
      if (mins < 1) return 'Edited just now';
      if (mins < 60) return 'Edited ' + mins + ' min ago';
      const d = new Date(ts);
      const today = new Date();
      const yest = new Date(Date.now() - 864e5);
      if (d.toDateString() === today.toDateString()) return 'Today';
      if (d.toDateString() === yest.toDateString()) return 'Yesterday';
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    const noteById = (id) => st.notes.find((n) => n.id === id);
    function newNote(extra) {
      const n = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: 'Untitled note', html: '', updated: Date.now() }, extra);
      st.notes.unshift(n);
      st.active = n.id;
      persist();
      return n;
    }

    // --- which wolf this page is about, if any ---
    function pageWolf() {
      const p = currentPage();
      if (p.kind !== 'wolf') return null;
      const title = document.title.split('|:|')[0].replace(/\s+/g, ' ').trim();
      return { id: p.id, name: title || '#' + p.id };
    }

    // --- the slip at the top of a wolf's page ---
    let slip = null;
    function paintSlip() {
      if (slip) slip.remove();
      slip = null;
      const w = pageWolf();
      const note = w && st.notes.find((n) => n.wolf === w.id);
      const host = document.querySelector('#main');
      if (!note || !host || !textOf(note.html)) return;
      const body = h('div', { class: 'dk-slip-body' });
      body.innerHTML = clean(note.html);
      slip = h('div', { class: 'dk-slip', role: 'note' },
        h('div', { class: 'dk-slip-main' }, h('strong', { text: 'Your note on ' + (note.wolfName || w.name) }), body),
        h('button', { type: 'button', class: 'dk-slip-open', text: 'open in Notepad ›', onclick: () => { st.active = note.id; openWindow(); } })
      );
      host.prepend(slip);
    }

    // --- the window ---
    let win = null;
    let refs = {};
    let saveTimer = null;

    function clamp() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      st.win.w = Math.max(360, Math.min(st.win.w, vw - 16));
      st.win.h = Math.max(260, Math.min(st.win.h, vh - 16));
      st.win.x = Math.max(8, Math.min(st.win.x, vw - st.win.w - 8));
      st.win.y = Math.max(8, Math.min(st.win.y, vh - st.win.h - 8));
      if (win) Object.assign(win.style, { left: st.win.x + 'px', top: st.win.y + 'px', width: st.win.w + 'px', height: st.win.h + 'px' });
    }

    function flush() {
      clearTimeout(saveTimer);
      saveTimer = null;
      const n = noteById(st.active);
      if (!n || !refs.body) return;
      const html = clean(refs.body.innerHTML);
      if (html !== n.html) {
        n.html = html;
        n.updated = Date.now();
      }
      persist();
      refs.count.textContent = words(n.html) + (words(n.html) === 1 ? ' word' : ' words');
      refs.status.textContent = n.wolf ? 'Shows on #' + n.wolf + '’s page' : 'Saved in this browser';
      paintList();
      paintSlip();
    }

    // A note you opened and never touched shouldn't pile up in the list.
    function dropIfBlank(id) {
      const n = noteById(id);
      if (n && !n.wolf && (n.title || 'Untitled note') === 'Untitled note' && !textOf(n.html)) {
        st.notes = st.notes.filter((x) => x !== n);
      }
    }

    function select(id) {
      if (saveTimer) flush();
      if (st.active !== id) dropIfBlank(st.active);
      st.active = id;
      persist();
      paintList();
      paintEditor();
    }

    function paintList() {
      if (!win) return;
      const q = norm(refs.search.value);
      refs.list.textContent = '';
      const w = pageWolf();
      if (w) {
        const existing = st.notes.find((n) => n.wolf === w.id);
        refs.list.append(h('button', {
          type: 'button', class: 'dk-btn dk-np-wolfbtn',
          text: existing ? 'Your note on ' + (existing.wolfName || w.name) : '+ Note for this wolf',
          onclick: () => {
            if (existing) return select(existing.id);
            if (saveTimer) flush();
            dropIfBlank(st.active);
            select(newNote({ title: w.name, wolf: w.id, wolfName: w.name }).id);
          }
        }));
      }
      const shown = st.notes.filter((n) => !q || norm(n.title + ' ' + textOf(n.html)).includes(q));
      if (!shown.length) refs.list.append(h('div', { class: 'dk-empty', text: q ? 'No note matches.' : 'No notes yet.' }));
      for (const n of shown) {
        refs.list.append(h('button', {
          type: 'button', class: 'dk-np-item' + (n.id === st.active ? ' dk-on' : ''),
          onclick: () => select(n.id)
        },
          h('strong', {}, n.title || 'Untitled note', n.wolf ? h('span', { class: 'dk-np-pin', text: 'wolf' }) : null),
          h('span', { text: n.wolf ? 'Pinned to #' + n.wolf : when(n.updated) })
        ));
      }
    }

    function paintEditor() {
      const n = noteById(st.active);
      refs.title.value = n ? n.title : '';
      refs.title.disabled = !n;
      refs.body.innerHTML = n ? clean(n.html) : '';
      refs.body.contentEditable = n ? 'true' : 'false';
      refs.count.textContent = n ? words(n.html) + (words(n.html) === 1 ? ' word' : ' words') : '';
      refs.status.textContent = n && n.wolf ? 'Shows on #' + n.wolf + '’s page' : 'Saved in this browser';
      refs.del.hidden = !n;
    }

    function format(cmd) {
      if (cmd === 'link' || cmd === 'image') return openLinkRow(cmd);
      refs.body.focus();
      document.execCommand(cmd, false, null);
      queueSave();
    }

    // --- the inline address box under the toolbar, used by Link and Image ---
    let linkRange = null;
    let linkMode = 'link';
    const LINK_OK = /^(https?:\/\/\S+|\/(?!\/)\S*)$/i;

    function openLinkRow(mode) {
      linkMode = mode === 'image' ? 'image' : 'link';
      const sel = window.getSelection();
      linkRange = sel.rangeCount && refs.body.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
      refs.linkErr.textContent = '';
      refs.linkInput.classList.remove('dk-bad');
      refs.linkInput.value = '';
      refs.linkInput.placeholder = linkMode === 'image'
        ? 'https://… address of a picture'
        : 'https://… or /wolf/123';
      refs.linkInput.setAttribute('aria-label', linkMode === 'image' ? 'Picture address' : 'Link address');
      refs.linkRow.hidden = false;
      refs.linkInput.focus();
    }

    function closeLinkRow(keepFocus) {
      refs.linkRow.hidden = true;
      if (keepFocus) {
        refs.body.focus();
        if (linkRange) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(linkRange);
        }
      }
      linkRange = null;
    }

    function addLink() {
      const url = refs.linkInput.value.trim();
      if (!LINK_OK.test(url)) {
        refs.linkInput.classList.add('dk-bad');
        refs.linkErr.textContent = linkMode === 'image'
          ? 'Use the full https:// address of the picture itself, the one ending .png or .jpg.'
          : 'Use a full https:// address, or a Wolvden page like /wolf/123.';
        refs.linkInput.focus();
        return;
      }
      if (linkMode === 'image') {
        // Only the address is stored, never the picture, so a note stays a few
        // hundred bytes however many images it shows.
        closeLinkRow(true);
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        document.execCommand('insertHTML', false, img.outerHTML + '<br>');
        queueSave();
        return;
      }
      const range = linkRange;
      closeLinkRow(true);
      if (range && !range.collapsed) {
        document.execCommand('createLink', false, url);
      } else {
        // Nothing selected: drop the address in as its own link, with a space
        // before it if it would otherwise run into the previous word.
        let lead = '';
        if (range) {
          const before = document.createRange();
          before.selectNodeContents(refs.body);
          before.setEnd(range.startContainer, range.startOffset);
          const t = before.toString();
          if (t && !/\s$/.test(t)) lead = '&nbsp;';
        }
        const a = document.createElement('a');
        a.href = url;
        a.textContent = url;
        document.execCommand('insertHTML', false, lead + a.outerHTML + '&nbsp;');
      }
      queueSave();
    }

    function queueSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(flush, 400);
      refs.status.textContent = 'Saving…';
    }

    function build() {
      refs.search = h('input', { type: 'text', placeholder: 'Search notes', 'aria-label': 'Search notes', oninput: paintList });
      refs.list = h('div', { class: 'dk-np-items' });
      refs.title = h('input', {
        type: 'text', class: 'dk-np-title', 'aria-label': 'Note title', maxLength: 120,
        oninput: (e) => { const n = noteById(st.active); if (!n) return; n.title = e.target.value; n.updated = Date.now(); persist(); paintList(); }
      });
      refs.body = h('div', { class: 'dk-np-body', role: 'textbox', 'aria-multiline': 'true', spellcheck: true,
        oninput: queueSave, onblur: () => { if (saveTimer) flush(); } });
      refs.body.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); flush(); }
      });
      refs.status = h('span', {});
      refs.count = h('span', {});
      refs.del = h('button', {
        type: 'button', class: 'dk-np-del', text: 'Delete',
        onclick: () => {
          const n = noteById(st.active);
          if (!n || !confirm('Delete "' + (n.title || 'Untitled note') + '"? This can’t be undone.')) return;
          st.notes = st.notes.filter((x) => x !== n);
          st.active = st.notes[0] ? st.notes[0].id : null;
          persist();
          paintList();
          paintEditor();
          paintSlip();
        }
      });

      refs.linkInput = h('input', {
        type: 'text', placeholder: 'https://… or /wolf/123', 'aria-label': 'Link address', spellcheck: false,
        oninput: () => { refs.linkInput.classList.remove('dk-bad'); refs.linkErr.textContent = ''; }
      });
      refs.linkInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addLink(); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeLinkRow(true); }
      });
      refs.linkErr = h('div', { class: 'dk-np-linkerr', 'aria-live': 'polite' });
      refs.linkRow = h('div', { class: 'dk-np-linkrow', hidden: true },
        h('div', { class: 'dk-np-linkline' },
          refs.linkInput,
          h('button', { type: 'button', class: 'dk-btn dk-primary', text: 'Add', onclick: addLink }),
          h('button', { type: 'button', class: 'dk-btn dk-quiet', text: 'Cancel', onclick: () => closeLinkRow(true) })),
        refs.linkErr
      );

      const tool = (label, cmd, title, cls) => h('button', {
        type: 'button', class: 'dk-np-tool' + (cls ? ' ' + cls : ''), text: label, title,
        onmousedown: (e) => e.preventDefault(),         // keep the text selection
        onclick: () => format(cmd)
      });

      const head = h('div', { class: 'dk-np-head' },
        h('span', { class: 'dk-title', text: 'Notepad' }),
        h('button', { type: 'button', class: 'dk-x', text: '×', title: 'Close (Alt+N)', 'aria-label': 'Close', onclick: () => closeWindow() })
      );
      const grip = h('div', { class: 'dk-np-grip', 'aria-hidden': 'true' });

      win = h('section', { id: 'dk-np', role: 'dialog', 'aria-label': 'Notepad' },
        head,
        h('div', { class: 'dk-np-wrap' },
          h('div', { class: 'dk-np-list' }, refs.search, refs.list,
            h('button', { type: 'button', class: 'dk-btn', text: '+ New note', onclick: () => { if (saveTimer) flush(); dropIfBlank(st.active); newNote(); paintList(); paintEditor(); refs.title.select(); } })),
          h('div', { class: 'dk-np-ed' },
            refs.title,
            h('div', { class: 'dk-np-tools' },
              tool('B', 'bold', 'Bold (Ctrl+B)', 'dk-b'),
              tool('I', 'italic', 'Italic (Ctrl+I)', 'dk-i'),
              tool('• List', 'insertUnorderedList', 'Bulleted list'),
              tool('Link', 'link', 'Make the selection a link'),
              tool('Image', 'image', 'Show a picture by its web address')),
            refs.linkRow,
            refs.body,
            h('div', { class: 'dk-np-foot' }, refs.status, h('span', { class: 'dk-np-right' }, refs.count, refs.del)))
        ),
        grip
      );

      // Drag by the title bar, resize from the corner. Pointer capture keeps the
      // drag going even if the pointer races ahead of the window.
      const drag = (el, apply) => {
        el.addEventListener('pointerdown', (e) => {
          if (e.button !== 0 || e.target.closest('button')) return;
          e.preventDefault();
          const start = { x: e.clientX, y: e.clientY, win: { ...st.win } };
          el.setPointerCapture(e.pointerId);
          const move = (ev) => { apply(start, ev.clientX - start.x, ev.clientY - start.y); clamp(); };
          const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); persist(); };
          el.addEventListener('pointermove', move);
          el.addEventListener('pointerup', up);
        });
      };
      drag(head, (s, dx, dy) => { st.win.x = s.win.x + dx; st.win.y = s.win.y + dy; });
      drag(grip, (s, dx, dy) => { st.win.w = s.win.w + dx; st.win.h = s.win.h + dy; });

      document.body.append(win);
    }

    function openWindow() {
      if (!st.notes.length) newNote();
      if (!noteById(st.active)) st.active = st.notes[0].id;
      if (!win) build();
      win.hidden = false;
      st.win.open = true;
      clamp();
      persist();
      paintList();
      paintEditor();
      refs.body.focus();
    }

    function closeWindow() {
      if (saveTimer) flush();
      dropIfBlank(st.active);
      if (!noteById(st.active)) st.active = st.notes[0] ? st.notes[0].id : null;
      if (win) win.hidden = true;
      st.win.open = false;
      persist();
    }

    let running = false;
    const onKey = (e) => {
      if (!running || !e.altKey || e.ctrlKey || e.metaKey || !pressed(e, 'n')) return;
      const t = e.target;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) && !(win && win.contains(t))) return;
      e.preventDefault();
      if (win && !win.hidden) closeWindow();
      else openWindow();
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', () => { if (win && !win.hidden) { clamp(); } });
    window.addEventListener('beforeunload', () => { if (saveTimer) flush(); });

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      #dk-np {
        position: fixed; z-index: 2147482999; display: flex; flex-direction: column; overflow: hidden;
        background: var(--dk-panel); color: var(--dk-text); border: 1px solid var(--dk-line);
        border-radius: var(--dk-radius); box-shadow: var(--dk-shadow);
        font: 12px/1.5 var(--dk-body-font); text-align: left;
      }
      #dk-np[hidden] { display: none; }
      #dk-np *, #dk-np *::before, #dk-np *::after { box-sizing: border-box; }
      .dk-np-head {
        flex: none; display: flex; align-items: center; gap: 6px; padding: 7px 11px; cursor: move;
        user-select: none; touch-action: none; background: var(--dk-head); color: var(--dk-head-text);
        font: 600 13px/1.3 var(--dk-title-font);
      }
      .dk-np-head .dk-title { flex: 1; }
      .dk-np-head .dk-x { font: 16px/1 var(--dk-body-font); color: inherit; background: none; border: 0; margin: 0; padding: 0 4px; cursor: pointer; opacity: .8; }
      .dk-np-head .dk-x:hover { opacity: 1; }
      .dk-np-wrap { flex: 1; min-height: 0; display: grid; grid-template-columns: 180px minmax(0, 1fr); }
      .dk-np-list { display: flex; flex-direction: column; gap: 6px; min-height: 0; padding: 8px; border-right: 1px solid var(--dk-line); }
      .dk-np-items { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 2px; }
      #dk-np input[type=text] {
        display: block; width: 100%; margin: 0; padding: 4px 7px; font: 12px/1.4 var(--dk-body-font);
        color: var(--dk-text); background: var(--dk-surface); border: 1px solid var(--dk-line);
        border-radius: var(--dk-radius); outline: 0; box-shadow: none;
      }
      #dk-np input[type=text]:focus { border-color: var(--dk-accent); }
      #dk-np input::placeholder { color: var(--dk-muted); opacity: .7; }
      .dk-np-item {
        display: block; width: 100%; margin: 0; padding: 5px 7px; text-align: left; cursor: pointer;
        font: inherit; color: var(--dk-text); background: none; border: 0; border-left: 2px solid transparent;
        border-radius: 0;
      }
      .dk-np-item:hover { background: var(--dk-hover); }
      .dk-np-item.dk-on { background: var(--dk-surface); border-left-color: var(--dk-accent); }
      .dk-np-item strong { display: block; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .dk-np-item span { display: block; color: var(--dk-muted); font-size: 11px; }
      .dk-np-pin {
        display: inline !important; margin-left: 5px; padding: 0 4px; font-size: 10px !important; font-weight: 600;
        color: var(--dk-on-accent) !important; background: var(--dk-accent); border-radius: 2px;
      }
      .dk-np-wolfbtn { width: 100%; text-align: left; }
      .dk-np-ed { display: flex; flex-direction: column; min-height: 0; padding: 10px 12px; }
      #dk-np input.dk-np-title {
        font: 600 14px/1.3 var(--dk-title-font); padding: 2px 0 5px; margin-bottom: 6px;
        background: none; border: 0; border-bottom: 1px solid var(--dk-line); border-radius: 0;
      }
      .dk-np-tools { display: flex; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
      /* A note is a small window, so a picture is sized to fit it rather than
         setting the window's width. The address is all that is stored, so a
         broken or moved image shows its alt text and costs nothing. */
      .dk-np-body img, .dk-slip img {
        display: block; max-width: 100%; height: auto; margin: 6px 0;
        border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
      }
      .dk-np-tool {
        font: 12px/1 var(--dk-body-font); margin: 0; padding: 4px 8px; cursor: pointer; color: var(--dk-text);
        background: var(--dk-surface); border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
      }
      .dk-np-tool:hover { background: var(--dk-hover); }
      .dk-np-linkrow[hidden] { display: none; }
      .dk-np-linkrow { margin-bottom: 6px; }
      .dk-np-linkline { display: flex; gap: 4px; }
      .dk-np-linkline input { flex: 1; min-width: 0; }
      #dk-np input.dk-bad { border-color: var(--dk-warn-text); }
      .dk-np-linkerr { color: var(--dk-warn-text); font-size: 11px; margin-top: 2px; }
      .dk-np-linkerr:empty { display: none; }
      .dk-np-tool.dk-b { font-weight: 700; }
      .dk-np-tool.dk-i { font-style: italic; }
      .dk-np-body {
        flex: 1; min-height: 0; overflow: auto; padding: 8px 10px; outline: 0; cursor: text;
        background: var(--dk-surface); border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
        color: var(--dk-text); overflow-wrap: anywhere;
      }
      .dk-np-body:focus { border-color: var(--dk-accent); }
      #dk-np .dk-np-body a, .dk-slip a { color: var(--dk-accent) !important; }
      .dk-np-body ul, .dk-np-body ol, .dk-slip ul, .dk-slip ol { margin: 4px 0; padding-left: 20px; }
      .dk-np-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 7px; color: var(--dk-muted); font-size: 11px; }
      .dk-np-right { display: flex; align-items: center; gap: 10px; }
      .dk-np-del { font: inherit; margin: 0; padding: 0; color: var(--dk-muted); background: none; border: 0; cursor: pointer; }
      .dk-np-del:hover { color: var(--dk-warn-text); text-decoration: underline; }
      .dk-np-grip { position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize; touch-action: none; }
      .dk-np-grip::after {
        content: ""; position: absolute; right: 3px; bottom: 3px; width: 8px; height: 8px;
        border-right: 2px solid var(--dk-line); border-bottom: 2px solid var(--dk-line);
      }
      .dk-slip {
        display: flex; gap: 10px; align-items: flex-start; margin: 0 0 12px; padding: 8px 10px;
        background: var(--dk-surface); color: var(--dk-text); border: 1px solid var(--dk-line);
        border-left: 2px solid var(--dk-accent); font: 12px/1.5 var(--dk-body-font); text-align: left;
      }
      .dk-slip-main { flex: 1; min-width: 0; }
      .dk-slip-main strong { display: block; font-weight: 600; }
      .dk-slip-open {
        flex: none; font: inherit; font-size: 11px; margin: 0; padding: 0; cursor: pointer;
        color: var(--dk-muted); background: none; border: 0;
      }
      .dk-slip-open:hover { color: var(--dk-accent); }
      @media (max-width: 520px) { .dk-np-wrap { grid-template-columns: 1fr; } .dk-np-list { max-height: 35%; border-right: 0; border-bottom: 1px solid var(--dk-line); } }
    `;

    function start() {
      if (running) return;
      running = true;
      document.head.appendChild(styleEl);
      paintSlip();
      if (st.win.open) openWindow();
    }

    function stop() {
      if (saveTimer) flush();
      running = false;
      if (win) { win.remove(); win = null; refs = {}; }
      if (slip) { slip.remove(); slip = null; }
      styleEl.remove();
    }

    return {
      id: 'notes', name: 'Notepad', blurb: 'Notes on every page (Alt+N)',
      start, stop, reload: () => { reload(); if (running) { paintSlip(); if (win) { paintList(); paintEditor(); } } },
      open: openWindow, settings() {}
    };
  })());

  function check(label, value, onchange) {
    return h('label', { class: 'dk-check' },
      h('input', { type: 'checkbox', checked: value, onchange: (e) => onchange(e.target.checked) }),
      document.createTextNode(label)
    );
  }

  // ========================================================= module: lore

  defineModule((() => {
    let block = null;

    const styleEl = h('style', {}, `
      #dk-lore {
        margin: 12px 0 16px; background: var(--dk-panel); color: var(--dk-text);
        border-radius: var(--dk-radius); overflow: hidden;
        font: 12px/1.5 var(--dk-body-font); text-align: left;
      }
      #dk-lore * { box-sizing: border-box; }
      .dk-lore-h {
        display: flex; align-items: baseline; gap: 8px; width: 100%; margin: 0;
        padding: 7px 12px; border: 0; border-radius: 0; cursor: pointer; text-align: left;
        background: var(--dk-head); color: var(--dk-head-text); font: 600 14px/1.3 var(--dk-title-font);
      }
      .dk-lore-h .dk-dm-arrow { flex: none; width: 10px; font-size: 11px; }
      .dk-lore-h span { margin-left: auto; font: 400 11px var(--dk-body-font); opacity: .85; }
      .dk-lore-b { padding: 8px 12px 10px; }
      .dk-lore-f { display: grid; grid-template-columns: 104px 1fr; gap: 2px 12px; }
      .dk-lore-f dt {
        font: 700 10px/1.7 var(--dk-title-font); text-transform: uppercase; letter-spacing: .07em;
        color: var(--dk-muted); margin: 0;
      }
      .dk-lore-f dd { margin: 0; }
      .dk-lore-story { margin-top: 8px; padding-top: 7px; border-top: 1px solid var(--dk-line); }
      .dk-lore-story b {
        display: block; font: 700 10px/1.7 var(--dk-title-font); text-transform: uppercase;
        letter-spacing: .07em; color: var(--dk-muted);
      }
      .dk-lore-edit { margin-top: 10px; display: grid; gap: 7px; }
      .dk-lore-edit label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .07em; color: var(--dk-muted); }
      #dk-lore input[type=text], #dk-lore textarea {
        display: block; width: 100%; margin: 2px 0 0; padding: 4px 7px;
        font: 12px/1.4 var(--dk-body-font); color: var(--dk-text);
        background: var(--dk-surface); border: 1px solid var(--dk-line);
        border-radius: var(--dk-radius); outline: 0;
      }
      #dk-lore input:focus, #dk-lore textarea:focus { border-color: var(--dk-accent); }
      .dk-lore-btns { display: flex; gap: 6px; margin-top: 9px; }
      .dk-lore-tag {
        display: inline-block; font-size: 11px; padding: 0 6px; margin: 0 4px 3px 0;
        border-radius: var(--dk-radius); background: var(--dk-surface); border: 1px solid var(--dk-line);
      }
      .dk-lore-sec + .dk-lore-sec { margin-top: 9px; padding-top: 8px; border-top: 1px solid var(--dk-line); }
      .dk-lore-sh {
        font: 700 10px/1.7 var(--dk-title-font); text-transform: uppercase; letter-spacing: .07em;
        color: var(--dk-accent); margin-bottom: 3px;
      }
      .dk-lore-edit .dk-lore-sh { margin-top: 6px; }
      .dk-lore-wolf { border-bottom: 1px dotted var(--dk-muted); }
      .dk-lore-id { color: var(--dk-muted); font-size: 11px; }
      .dk-lore-brow { display: flex; justify-content: space-between; gap: 10px; padding: 2px 0; }
      .dk-lore-brow span { color: var(--dk-muted); font-size: 11px; }
      .dk-lore-f.dk-lore-own { grid-template-columns: 104px 1fr auto; align-items: baseline; }
      .dk-lore-pub {
        margin: 0; padding: 0 6px; cursor: pointer; font: 600 9.5px/1.6 var(--dk-body-font);
        letter-spacing: .05em; color: var(--dk-muted); background: transparent;
        border: 1px solid var(--dk-line); border-radius: var(--dk-radius); white-space: nowrap;
      }
      .dk-lore-pub[aria-pressed="true"] { color: var(--dk-good-text); background: var(--dk-good); border-color: var(--dk-good); }
      .dk-lore-msg { margin-top: 8px; padding: 7px 9px; font-size: 11.5px; border-left: 3px solid var(--dk-good);
        background: color-mix(in srgb, var(--dk-good) 22%, transparent); }
      .dk-lore-msg.dk-lore-warn { border-left-color: var(--dk-warn); background: color-mix(in srgb, var(--dk-warn) 28%, transparent); }
      .dk-lore-msg textarea { margin-top: 6px !important; font-size: 11px !important; }
      .dk-lore-theirs { border-left: 3px solid var(--dk-tip-title); padding-left: 9px; }
    `);

    const loreLink = (id, label) => h('a', { class: 'dk-lore-wolf', href: '/wolf/' + id, text: label });

    function valueOf(f, rec) {
      const raw = rec[f.id];
      if (!raw) return null;
      if (f.type === 'tags') {
        const tags = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
        return tags.length ? h('dd', {}, ...tags.map((x) => h('span', { class: 'dk-lore-tag', text: x }))) : null;
      }
      if (f.type === 'wolf') {
        const ref = wolfRef(raw);
        // An id becomes a real link; anything else stays exactly as written, so
        // a field that used to hold free text still reads correctly.
        if (!ref || !ref.id) return h('dd', { text: String(raw) });
        // wolfName falls back to "#id" when nothing here knows that wolf yet, and
        // printing the id after it would just say the same thing twice.
        const nm = wolfName(ref.id);
        return h('dd', {}, loreLink(ref.id, nm),
          nm === '#' + ref.id ? null : h('span', { class: 'dk-lore-id', text: ' #' + ref.id }));
      }
      return h('dd', { text: String(raw) });
    }

    function view(id, rec, redraw) {
      const body = h('div', { class: 'dk-lore-b' });
      const pub = new Set(rec._pub || []);
      // Every field starts private. The switch only marks what Make public may
      // copy; nothing leaves this browser until you paste it yourself.
      const pubSwitch = (f) => h('button', {
        type: 'button', class: 'dk-lore-pub', 'aria-pressed': String(pub.has(f.id)),
        text: pub.has(f.id) ? 'PUBLIC' : 'PRIVATE',
        title: pub.has(f.id) ? 'Make this field private again' : 'Include this field when you make lore public',
        onclick: () => { setPublic(id, f.id, !pub.has(f.id)); redraw(false); }
      });
      for (const sec of lorePlan.sections) {
        const dl = h('dl', { class: 'dk-lore-f dk-lore-own' });
        const longs = [];
        for (const f of sec.fields) {
          if (!rec[f.id]) continue;
          if (f.type === 'long') { longs.push(f); continue; }
          const val = valueOf(f, rec);
          if (val) dl.append(h('dt', { text: f.label }), val, pubSwitch(f));
        }
        if (!dl.children.length && !longs.length) continue;      // nothing written here
        body.append(h('div', { class: 'dk-lore-sec' },
          h('div', { class: 'dk-lore-sh', text: sec.label }),
          dl.children.length ? dl : null,
          ...longs.map((f) => h('div', { class: 'dk-lore-story' },
            // "Story" inside a section called "Story" reads as a stutter.
            h('div', { class: 'dk-lore-brow' },
              f.label.toLowerCase() === sec.label.toLowerCase() ? h('span') : h('b', { text: f.label }),
              pubSwitch(f)),
            h('div', { text: rec[f.id] })))));
      }

      const back = loreMentions(id);
      if (back.length) {
        const list = h('div', { class: 'dk-lore-back' });
        for (const m of back) {
          list.append(h('div', { class: 'dk-lore-brow' },
            loreLink(m.id, wolfName(m.id)), h('span', { text: m.label })));
        }
        body.append(h('div', { class: 'dk-lore-sec' },
          h('div', { class: 'dk-lore-sh', text: 'Mentioned by' }), list));
      }

      const msg = h('div');
      body.append(h('div', { class: 'dk-lore-btns' },
        pub.size ? h('button', { type: 'button', class: 'dk-btn dk-primary', text: 'Make public',
          onclick: () => copyPublic(publicBlock(rec), msg, false) }) : null,
        h('button', { type: 'button', class: 'dk-btn dk-quiet', text: 'Edit', onclick: () => redraw(true) })));
      body.append(msg);
      body.append(staleNote(rec));
      return body;
    }

    /* ---- public lore ----
       Made public by hand: Twill builds a small block from the fields you
       switched to Public and copies it, and you paste it at the end of the
       wolf's Biography on its Settings tab. Twill never touches the Biography
       box. Everyone then sees it there, Twill or not, and other copies of Twill
       recognise the block by its "Kept with Twill" line and show it in their
       Lore panel. Nothing is sent anywhere and nothing is kept. The HTML is
       what Wolvden posts keep: no quotes inside a style, no display, no style
       on a link, and one line, because a Biography can turn line breaks into
       blank lines. */
    const SIGNATURE = 'Kept with Twill';
    const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    function publicFields(rec) {
      const pub = new Set(rec._pub || []);
      const out = [];
      for (const f of loreFields()) {
        if (!pub.has(f.id) || !rec[f.id]) continue;
        const ref = f.type === 'wolf' ? wolfRef(rec[f.id]) : null;
        out.push(ref && ref.id
          ? { label: f.label, text: wolfName(ref.id), wolf: ref.id }
          : { label: f.label, text: String(rec[f.id]).trim() });
      }
      return out;
    }

    function publicBlock(rec) {
      const parts = publicFields(rec).map((x) => '<b>' + esc(x.label) + ':</b> ' + (x.wolf
        ? '<a href="/wolf/' + x.wolf + '"><span style="color:#734413;border-bottom:1px solid #734413;">' + esc(x.text) + '</span></a>'
        : esc(x.text).replace(/\r?\n/g, '<br>')));
      if (!parts.length) return '';
      return '<div style="background:#f7f0e2;border:1px solid #dccbab;color:#33261c;padding:10px 14px;font-family:Georgia,serif;font-size:13px;line-height:1.6;">'
        + '<div style="font-size:16px;color:#6b4a2f;border-bottom:1px solid #dccbab;margin-bottom:6px;"><b>Lore</b></div>'
        + parts.join('<br>')
        + '<div style="font-size:11px;color:#5f4c3a;margin-top:6px;">' + SIGNATURE + '</div></div>';
    }

    // The block in this wolf's Biography, read back into label and value pairs.
    // Only text and wolf links come out; nothing of the Biography's HTML is
    // ever put on the page.
    function readBioLore() {
      const bio = document.querySelector('#main .wolf-bio');
      if (!bio) return null;
      const sig = [...bio.querySelectorAll('div')].find((d) => d.textContent.trim() === SIGNATURE);
      const box = sig && sig.parentElement;
      if (!box || !bio.contains(box) || box === bio) return null;
      const fields = [];
      let cur = null;
      for (const node of box.childNodes) {
        if (node === sig) break;
        if (node.nodeType === 1 && node.tagName === 'B' && /:\s*$/.test(node.textContent)) {
          cur = { label: node.textContent.replace(/:\s*$/, '').trim(), text: '', wolf: null };
          fields.push(cur);
          continue;
        }
        if (!cur) continue;
        if (node.nodeType === 3) cur.text += node.textContent;
        else if (node.tagName === 'BR') cur.text += '\n';
        else if (node.nodeType === 1) {
          const link = node.matches('a[href]') ? node : node.querySelector('a[href]');
          const m = link && (link.getAttribute('href') || '').match(/\/wolf\/(\d+)/);
          if (m) cur.wolf = m[1];
          cur.text += node.textContent;
        }
      }
      for (const x of fields) x.text = x.text.replace(/^\s+|\s+$/g, '');
      return fields.filter((x) => x.label && x.text);
    }

    const sameLore = (a, b) => {
      const flat = (list) => JSON.stringify(list.map((x) => [x.label, x.text.replace(/\s+/g, ' ')]));
      return flat(a) === flat(b);
    };

    // On your own wolf: does the Biography still match what you made public?
    function staleNote(rec) {
      const inBio = readBioLore();
      const want = publicFields(rec);
      const box = h('div');
      if (inBio && inBio.length && !want.length) {
        box.append(h('div', { class: 'dk-lore-msg dk-lore-warn', text: 'This wolf’s Biography still has a Lore block, but no field is public any more. Delete the block from the Biography to make its lore private again.' }));
      } else if (inBio && want.length && !sameLore(inBio, want)) {
        const msg = h('div');
        box.append(h('div', { class: 'dk-lore-msg dk-lore-warn' },
          h('b', { text: 'The Biography has an older version of this lore. ' }),
          h('button', { type: 'button', class: 'dk-btn dk-quiet', text: 'Copy the new one',
            onclick: () => copyPublic(publicBlock(rec), msg, true) }),
          msg));
      }
      return box;
    }

    // Copy the block, or hand it over to copy by hand if the browser will not.
    function copyPublic(html, into, replacing) {
      into.textContent = '';
      const where = replacing
        ? 'Open this wolf’s Settings tab, replace the old Lore block at the end of the Biography with it, and press Update Wolf.'
        : 'Open this wolf’s Settings tab, paste it at the very end of the Biography, and press Update Wolf.';
      const size = 'About ' + html.length.toLocaleString('en-GB') + ' of the Biography’s 20,000 characters.';
      const done = () => into.append(h('div', { class: 'dk-lore-msg' }, h('b', { text: 'Copied. ' }), where + ' ' + size));
      const byHand = () => {
        const ta = h('textarea', { rows: 3, readonly: true, value: html, 'aria-label': 'Public lore to copy' });
        into.append(h('div', { class: 'dk-lore-msg' }, h('b', { text: 'Copy this. ' }), where + ' ' + size, ta));
        ta.focus();
        ta.select();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(html).then(done, byHand);
      else byHand();
    }

    // Someone else's wolf: only what its owner made public, read only.
    function theirs(owner, fields) {
      const host = h('section', { id: 'dk-lore', 'aria-label': 'Lore' });
      const dl = h('dl', { class: 'dk-lore-f' });
      for (const x of fields) {
        dl.append(h('dt', { text: x.label }),
          x.wolf ? h('dd', {}, loreLink(x.wolf, x.text)) : h('dd', { style: 'white-space:pre-line', text: x.text }));
      }
      host.append(
        h('div', { class: 'dk-lore-h', style: 'cursor:default' }, h('b', { text: 'Lore' }),
          h('span', { text: owner && owner.name ? owner.name + '’s lore' : 'the owner’s lore' })),
        h('div', { class: 'dk-lore-b' },
          h('div', { class: 'dk-lore-theirs' }, dl),
          h('div', { class: 'dk-muted', style: 'font-size:11px;margin-top:6px',
            text: 'Read from this wolf’s Biography, as its owner wrote it. Not saved anywhere.' })));
      return host;
    }

    function editor(id, rec, redraw) {
      const inputs = {};
      const wrap = h('div', { class: 'dk-lore-edit' });
      for (const sec of lorePlan.sections) {
        if (!sec.fields.length) continue;
        wrap.append(h('div', { class: 'dk-lore-sh', text: sec.label }));
        for (const f of sec.fields) {
          const el = f.type === 'long'
            ? h('textarea', { rows: 3, value: rec[f.id] || '', 'aria-label': f.label })
            : h('input', { type: 'text', value: rec[f.id] || '', placeholder: f.hint || '', 'aria-label': f.label });
          inputs[f.id] = el;
          wrap.append(h('div', {}, h('label', { text: f.label }), el));
        }
      }
      if (!Object.keys(inputs).length) {
        wrap.append(h('div', { class: 'dk-dm-none', text: 'No fields yet. Add some in Twill’s settings, under Lore.' }));
      }
      return h('div', { class: 'dk-lore-b' }, wrap,
        h('div', { class: 'dk-lore-btns' },
          h('button', {
            type: 'button', class: 'dk-btn dk-primary', text: 'Save',
            onclick: () => {
              const next = {};
              for (const f of loreFields()) {
                const v = inputs[f.id] ? inputs[f.id].value : '';
                // A wolf field is stored as a bare id when it is one, so the
                // backlinks on the other wolf's page can find it.
                if (f.type === 'wolf') {
                  const ref = wolfRef(v);
                  next[f.id] = ref ? (ref.id || ref.text) : '';
                } else next[f.id] = v;
              }
              saveLore(id, next, wolfPageName());
              redraw(false);
            }
          }),
          h('button', { type: 'button', class: 'dk-btn dk-quiet', text: 'Cancel', onclick: () => redraw(false) })));
    }

    function build(id) {
      let editing = false;
      const host = h('section', { id: 'dk-lore', 'aria-label': 'Lore' });
      const redraw = (edit) => {
        editing = edit;
        const rec = lore[id] || {};
        const filled = Object.keys(rec).filter((k) => loreField(k)).length;
        const open = lorePlan.open !== false;
        host.textContent = '';
        const bodyWrap = h('div', { hidden: !open });
        const arrow = h('span', { class: 'dk-dm-arrow', text: open ? '▾' : '▸' });
        const head = h('button', {
          type: 'button', class: 'dk-lore-h', 'aria-expanded': String(open),
          onclick: () => {
            const now = bodyWrap.hidden;
            bodyWrap.hidden = !now;
            arrow.textContent = now ? '▾' : '▸';
            head.setAttribute('aria-expanded', String(now));
            lorePlan.open = now;
            savePlan();
          }
        }, arrow, h('b', { text: 'Lore' }),
           h('span', { text: filled ? filled + (filled === 1 ? ' field written' : ' fields written') : 'nothing written yet' }));
        bodyWrap.append(editing || !filled ? editor(id, rec, redraw) : view(id, rec, redraw));
        host.append(head, bodyWrap);
      };
      redraw(false);
      return host;
    }

    function start() {
      const page = currentPage();
      if (page.kind !== 'wolf' || block) return;
      // Below the wolf's own tabs, so Twill never pushes Wolvden's page down.
      const tabs = document.querySelector('#main .tab-content');
      const last = [...document.querySelectorAll('#main table')].filter((t) => t.querySelector('td.b')).pop();
      const anchor = tabs || (last && last.closest('.row')) || null;
      if (!anchor) return;
      /* Lore is written by a wolf's owner. On a wolf that is certainly someone
         else's, any lore written for it before this rule is deleted; when Twill
         cannot tell whose wolf it is, nothing is deleted and nothing can be
         edited. Either way, what the owner made public is shown. */
      const mine = wolfIsMine();
      if (mine === false) {
        lore = load('lore', {});
        if (lore[page.id]) { delete lore[page.id]; save('lore', lore); }
      }
      if (mine === true) {
        block = build(page.id);
      } else {
        const fields = readBioLore();
        if (!fields || !fields.length) return;
        block = theirs(wolfOwner(), fields);
      }
      document.head.append(styleEl);
      anchor.parentNode.insertBefore(block, anchor.nextSibling);
    }

    function stop() {
      if (block) block.remove();
      block = null;
      styleEl.remove();
    }

    // ---- the layout editor ----

    const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'f';

    function freshId(base) {
      const taken = new Set(loreFields().map((f) => f.id)
        .concat(lorePlan.sections.map((s) => s.id))
        .concat(lorePlan.trash.map((x) => x.field.id)));
      let id = slug(base), n = 2;
      while (taken.has(id)) id = slug(base) + '-' + n++;
      return id;
    }

    function move(arr, i, by) {
      const j = i + by;
      if (j < 0 || j >= arr.length) return false;
      arr.splice(j, 0, arr.splice(i, 1)[0]);
      return true;
    }

    function settings(box) {
      const redraw = () => { savePlan(); stop(); start(); screen = 'lore'; render(); };
      const ids = Object.keys(lore);

      box.append(h('div', { class: 'dk-lb', text: 'Sections and fields' }));
      box.append(h('div', { class: 'dk-note', style: 'margin-top:0',
        text: 'Rename anything, reorder it, add what you need. What you have written is stored against a field id and not its name, so renaming a field never loses a word of it.' }));

      lorePlan.sections.forEach((sec, si) => {
        box.append(h('div', { class: 'dk-lore-row dk-lore-srow' },
          h('span', { class: 'dk-lore-nm' }, h('b', { text: sec.label })),
          h('button', { type: 'button', class: 'dk-lore-kb', text: '\u25b2', title: 'Move section up',
            onclick: () => { if (move(lorePlan.sections, si, -1)) redraw(); } }),
          h('button', { type: 'button', class: 'dk-lore-kb', text: '\u25bc', title: 'Move section down',
            onclick: () => { if (move(lorePlan.sections, si, 1)) redraw(); } }),
          h('button', { type: 'button', class: 'dk-lore-kb', text: '\u270e', title: 'Rename this section',
            onclick: () => {
              const name = prompt('Section name', sec.label);
              if (name && name.trim()) { sec.label = name.trim(); redraw(); }
            } }),
          h('button', { type: 'button', class: 'dk-lore-kb', text: '\u2715', title: 'Delete this section',
            onclick: () => {
              // Deleting a section must not silently bin what is written in it, so
              // its fields go to the trash one by one and can each be brought back.
              for (const f of sec.fields) lorePlan.trash.push({ field: f, at: Date.now(), from: sec.id, fromLabel: sec.label });
              lorePlan.sections.splice(si, 1);
              redraw();
            } })));

        sec.fields.forEach((f, fi) => {
          box.append(h('div', { class: 'dk-lore-row dk-lore-frow' },
            h('span', { class: 'dk-lore-nm' }, h('span', { text: f.label }),
              h('span', { class: 'dk-lore-type', text: LORE_TYPES[f.type] || 'Text' })),
            h('button', { type: 'button', class: 'dk-lore-kb', text: '\u25b2', title: 'Move up',
              onclick: () => {
                if (move(sec.fields, fi, -1)) return redraw();
                // Already at the top: step into the section above.
                const prev = lorePlan.sections[si - 1];
                if (prev) { prev.fields.push(sec.fields.splice(fi, 1)[0]); redraw(); }
              } }),
            h('button', { type: 'button', class: 'dk-lore-kb', text: '\u25bc', title: 'Move down',
              onclick: () => {
                if (move(sec.fields, fi, 1)) return redraw();
                const nxt = lorePlan.sections[si + 1];
                if (nxt) { nxt.fields.unshift(sec.fields.splice(fi, 1)[0]); redraw(); }
              } }),
            h('button', { type: 'button', class: 'dk-lore-kb', text: '\u270e', title: 'Rename this field',
              onclick: () => {
                const name = prompt('Field name', f.label);
                if (name && name.trim()) { f.label = name.trim(); redraw(); }
              } }),
            h('button', { type: 'button', class: 'dk-lore-kb', text: '\u2715', title: 'Delete this field',
              onclick: () => {
                lorePlan.trash.push({ field: f, at: Date.now(), from: sec.id, fromLabel: sec.label });
                sec.fields.splice(fi, 1);
                redraw();
              } })));
        });
        if (!sec.fields.length) {
          box.append(h('div', { class: 'dk-dm-none', style: 'padding-left:10px', text: 'No fields in this section.' }));
        }
      });

      // --- adding ---
      box.append(h('div', { class: 'dk-lb', text: 'Add a field' }));
      const nameIn = h('input', { type: 'text', placeholder: 'What to call it', 'aria-label': 'New field name' });
      const typeIn = h('select', { 'aria-label': 'Field type' },
        ...Object.entries(LORE_TYPES).map(([v, l]) => h('option', { value: v, text: l })));
      const secIn = h('select', { 'aria-label': 'Which section' },
        ...lorePlan.sections.map((s) => h('option', { value: s.id, text: s.label })));
      box.append(nameIn, h('div', { class: 'dk-lore-add' }, typeIn, secIn,
        h('button', {
          type: 'button', class: 'dk-btn dk-primary', text: 'Add',
          onclick: () => {
            const label = nameIn.value.trim();
            if (!label) { nameIn.focus(); return; }
            const sec = lorePlan.sections.find((s) => s.id === secIn.value) || lorePlan.sections[0];
            if (!sec) return;
            sec.fields.push({ id: freshId(label), label, type: typeIn.value, hint: '' });
            redraw();
          }
        })));
      box.append(h('button', {
        type: 'button', class: 'dk-btn', style: 'margin-top:8px', text: '+ Add a section',
        onclick: () => {
          const name = prompt('Section name', 'New section');
          if (!name || !name.trim()) return;
          lorePlan.sections.push({ id: freshId(name), label: name.trim(), fields: [] });
          redraw();
        }
      }));

      // --- the trash ---
      if (lorePlan.trash.length) {
        box.append(h('div', { class: 'dk-lb', text: 'Deleted  \u00b7  kept ' + TRASH_DAYS + ' days' }));
        lorePlan.trash.forEach((tr, i) => {
          const days = Math.max(0, TRASH_DAYS - Math.floor((Date.now() - (tr.at || 0)) / 864e5));
          const used = Object.values(lore).filter((r) => r[tr.field.id]).length;
          box.append(h('div', { class: 'dk-lore-row' },
            h('span', { class: 'dk-lore-nm' }, h('span', { text: tr.field.label }),
              h('span', { class: 'dk-lore-type',
                text: used ? used + ' still written  \u00b7  ' + days + 'd left' : days + 'd left' })),
            h('button', {
              type: 'button', class: 'dk-btn dk-quiet', text: 'Put it back',
              onclick: () => {
                // Home first: the section it was deleted from, if that still
                // exists. Otherwise recreate it, so a deleted section restores
                // itself rather than dumping its fields on an unrelated one.
                let sec = lorePlan.sections.find((s) => s.id === tr.from);
                if (!sec && tr.from) {
                  sec = { id: tr.from, label: tr.fromLabel || 'Restored', fields: [] };
                  lorePlan.sections.push(sec);
                }
                if (!sec) sec = lorePlan.sections[0];
                if (!sec) return;
                sec.fields.push(tr.field);
                lorePlan.trash.splice(i, 1);
                redraw();
              }
            })));
        });
      }

      // --- baselines ---
      box.append(h('div', { class: 'dk-lb', text: 'This layout' }));
      box.append(h('div', { class: 'dk-btns' },
        h('button', {
          type: 'button', class: 'dk-btn', text: 'Save as my default',
          onclick: () => {
            lorePlan.base = JSON.parse(JSON.stringify({ sections: lorePlan.sections }));
            redraw();
          }
        }),
        lorePlan.base ? h('button', {
          type: 'button', class: 'dk-btn dk-quiet', text: 'Back to my default',
          onclick: () => { lorePlan.sections = JSON.parse(JSON.stringify(lorePlan.base.sections)); redraw(); }
        }) : null,
        h('button', {
          type: 'button', class: 'dk-btn dk-quiet', text: 'Back to the 9',
          onclick: () => { lorePlan.sections = JSON.parse(JSON.stringify(DEFAULT_LORE.sections)); redraw(); }
        })));
      box.append(h('div', { class: 'dk-note', style: 'margin-top:5px',
        text: lorePlan.base
          ? 'Your default is saved. Either reset changes the layout only; nothing you have written is touched.'
          : 'Save the layout you have built and it becomes what a reset returns to. Resetting changes the layout only; nothing you have written is touched.' }));

      // --- who sees it ---
      box.append(h('div', { class: 'dk-lb', text: 'Your wolves, and public lore' }));
      box.append(h('div', { class: 'dk-note', style: 'margin-top:0',
        text: 'Lore is written on your own wolves only. Every field starts private. Switch a field to Public on the wolf’s page, press Make public, and paste what it copies at the end of that wolf’s Biography: everyone can then read it there, and other Twill users see it in their Lore panel. Twill never edits the Biography for you.' }));

      // --- what is written ---
      box.append(h('div', { class: 'dk-lb', text: 'Written so far  \u00b7  ' + ids.length }));
      if (!ids.length) box.append(h('div', { class: 'dk-empty', text: 'Open a wolf and write something.' }));
      for (const id of ids.slice(0, 20)) {
        const rec = lore[id];
        const live = Object.keys(rec).filter((k) => loreField(k)).length;
        box.append(h('a', { class: 'dk-find dk-find-link', href: '/wolf/' + id, title: 'Open this wolf' },
          h('strong', { text: rec.called || rec._n || rec.title || 'Wolf #' + id }),
          h('span', { text: live + (live === 1 ? ' field' : ' fields') + '  \u00b7  #' + id })));
      }
      box.append(h('div', { class: 'dk-note', text: 'Lore lives in this browser only. It is never shown to anyone else and never sent anywhere. Back it up from the Backup screen.' }));
    }

    return { id: 'lore', name: 'Lore', blurb: 'Your own fields on a wolf’s page', start, stop,
      reload: () => { lore = load('lore', {}); reloadPlan(); }, settings };
  })());

  // ===================================================== module: pedigree

  defineModule((() => {
    let card = null;

    const styleEl = h('style', {}, `
      #dk-ped {
        margin: 10px 0 14px; background: var(--dk-panel); color: var(--dk-text);
        border-radius: var(--dk-radius); overflow: hidden;
        font: 12px/1.5 var(--dk-body-font); text-align: left;
      }
      #dk-ped * { box-sizing: border-box; }
      .dk-ped-h {
        display: flex; align-items: baseline; gap: 8px; padding: 7px 12px;
        background: var(--dk-head); color: var(--dk-head-text); font: 600 14px/1.3 var(--dk-title-font);
      }
      .dk-ped-b { padding: 8px 12px 10px; }
      .dk-ped-b select {
        display: block; width: 100%; max-width: 280px; margin: 4px 0 0; padding: 4px 7px;
        font: 12px/1.4 var(--dk-body-font); color: var(--dk-text);
        background: var(--dk-surface); border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
      }
      .dk-ped-big { font: 700 20px/1.2 var(--dk-title-font); color: var(--dk-tip-title); }
      .dk-ped-row { padding: 4px 0; border-top: 1px solid var(--dk-line); }
      .dk-ped-row span { color: var(--dk-muted); font-size: 11px; }
      .dk-ped-note { margin-top: 8px; color: var(--dk-muted); font-size: 11px; line-height: 1.45; }
    `);

    /* Read the tree Wolvden draws. There are two .family-tree blocks, the
       sire's side and the dam's, each holding one column per generation, so an
       ancestor's depth is which column it sits in: 1 for a parent, 4 for a
       great-great-grandparent.

       Every slot is drawn, an Unknown included, and each carries a mars or
       venus icon, so a slot's place in its column also says whose parent it
       is: the parents of slot j sit at 2j and 2j+1 in the next column, sire
       first. That is kept as a path ('SDS' is the sire's dam's sire), because
       a COI needs to know which line an ancestor is on, not just how far back.
       If the layout is ever not the one described here, no paths are kept and
       the Pairing screen says so, rather than working from a wrong guess. */
    function readTree() {
      const main = document.querySelector('#main');
      const trees = main ? [...main.querySelectorAll('.family-tree')] : [];
      if (!trees.length) return null;
      const a = {};
      // Which side each tree is: its heading says, and failing that the order.
      const sides = trees.map((tree, i) => {
        const head = (tree.previousElementSibling && tree.previousElementSibling.textContent) || '';
        return /maternal/i.test(head) ? 'D' : /paternal/i.test(head) ? 'S' : (i ? 'D' : 'S');
      });
      let lines = trees.length === 2 && sides[0] !== sides[1];
      trees.forEach((tree, t) => {
        [...tree.children].forEach((col, i) => {
          const slots = [...col.children].filter((el) => el.querySelector('.fa-mars, .fa-venus'));
          if (slots.length !== 1 << i) lines = false;
          for (const link of col.querySelectorAll('a[href*="/family/"]')) {
            const m = (link.getAttribute('href') || '').match(/\/family\/(\d+)/);
            if (!m) continue;
            const rec = a[m[1]] || (a[m[1]] = { d: [], p: [], n: link.textContent.replace(/\s+/g, ' ').trim() });
            rec.d.push(i + 1);
            const j = slots.findIndex((el) => el.contains(link));
            if (j < 0) { lines = false; continue; }
            // The side, then one letter per generation: S where the slot is
            // even (a sire), D where it is odd (a dam).
            let path = '';
            for (let k = i, idx = j; k > 0; k--, idx >>= 1) path = (idx % 2 ? 'D' : 'S') + path;
            rec.p.push(sides[t] + path);
          }
        });
      });
      if (!lines) for (const r of Object.values(a)) delete r.p;
      const cardVal = (label) => {
        for (const c of main.querySelectorAll('.card-body')) {
          const b = c.querySelector('b');
          if (b && b.textContent.includes(label)) return c.textContent.replace(b.textContent, '').replace(/\s+/g, ' ').trim();
        }
        return '';
      };
      const h1 = main.querySelector('h1');
      return {
        n: h1 ? h1.textContent.replace(/^\s*Family of\s*/i, '').replace(/\s+/g, ' ').trim() : '',
        gen: cardVal('Generation'),
        coi: cardVal('Inbreeding Coefficient'),
        inst: cardVal('Instances of Inbreeding'),
        lines,
        a
      };
    }

    /* No answer is given here. A COI on its own tells you half of what a pairing
       raises, so the check happens in the tray's Pairing view, beside what the
       pups could actually inherit. This card only says whether the tree has
       been kept, which happens only for a wolf in the tray. */
    function build(me, kept) {
      const host = h('section', { id: 'dk-ped', 'aria-label': 'Pedigree' });
      const n = Object.keys(me.a).length;
      const facts = [me.gen ? me.gen + ' generation' : '', me.coi ? 'own COI ' + me.coi : '',
        kept ? n + ' named ancestor' + (n === 1 ? '' : 's') + ' kept' : ''].filter(Boolean).join('  ·  ');
      const body = h('div', { class: 'dk-ped-b' },
        h('div', {}, h('b', { text: me.n || 'This wolf' }),
          facts ? h('span', { class: 'dk-ped-note', style: 'display:block;margin-top:2px', text: facts }) : null),
        h('div', { class: 'dk-ped-note', text: kept
          ? 'Pair this wolf with another in the tray: the pups’ generation, the shared ancestors and the pup’s COI show up there, next to the markings, eyes, skin, nose and base the pups could get. Take it out of the tray and Twill forgets this tree.'
          : 'Not kept. Twill keeps a family tree only for a wolf in your tray. Pin this one with the button beside its name and its tree is kept straight away.' }));
      host.append(h('div', { class: 'dk-ped-h' }, h('b', { text: kept ? 'Pedigree kept' : 'Pedigree' })), body);
      return host;
    }

    // The tree on this Family page. It is read for the card either way, but only
    // saved while this wolf is in the tray.
    let pageTree = null;

    function keepTree(fresh) {
      const page = currentPage();
      if (!pageTree) return;
      const kept = tray.includes(page.id);
      if (kept && (fresh || !ped[page.id])) {
        // Start from the stored trees, not this tab's copy, so a tree read in
        // another tab since this one loaded is never written over.
        ped = load('ped', {});
        ped[page.id] = Object.assign({}, pageTree, { t: Date.now() });
        save('ped', ped);
      }
      const next = build(pageTree, kept);
      if (card) {
        card.replaceWith(next);
      } else {
        const anchor = document.querySelector('#main hr') || document.querySelector('#main .row');
        if (!anchor) return;
        anchor.parentNode.insertBefore(next, anchor);
      }
      card = next;
    }

    function start() {
      const page = currentPage();
      if (page.kind !== 'family' || card) return;
      pageTree = readTree();
      if (!pageTree) return;
      document.head.append(styleEl);
      keepTree(true);
    }

    function stop() {
      if (card) card.remove();
      card = pageTree = null;
      styleEl.remove();
    }

    function settings(box) {
      const ids = Object.keys(ped).sort((a, b) => (ped[b].t || 0) - (ped[a].t || 0));
      box.append(h('div', { class: 'dk-lb', text: 'Family trees kept  ·  ' + ids.length }));
      if (!ids.length) {
        box.append(h('div', { class: 'dk-empty', text: 'None yet. A wolf in your tray has its tree kept when you are on its Family page.' }));
      }
      for (const id of ids) {
        box.append(h('div', { class: 'dk-find' },
          h('strong', { text: ped[id].n || '#' + id }),
          h('span', { text: [ped[id].gen, ped[id].coi ? 'COI ' + ped[id].coi : '', Object.keys(ped[id].a).length + ' ancestors'].filter(Boolean).join('  ·  ') })));
      }
      box.append(h('div', { class: 'dk-btns' }, h('button', {
        type: 'button', class: 'dk-btn dk-quiet', text: 'Forget all',
        onclick: () => {
          const n = Object.keys(ped).length;
          if (!confirm('Forget all ' + n + (n === 1 ? ' family tree' : ' family trees') + '? The wolves stay in the tray.')) return;
          ped = {}; save('ped', ped); screen = 'pedigree'; render();
        }
      })));
      box.append(h('div', { class: 'dk-note', text: 'Twill keeps a family tree only for a wolf in your tray, 8 at most, read from its Family page while you are on it. Take the wolf out of the tray and its tree goes too. Twill never loads a page for you. The comparison itself lives in the tray’s Pairing view.' }));
    }

    return {
      id: 'pedigree', name: 'Pedigree', blurb: 'Keeps family trees for the tray', start, stop,
      reload: () => { ped = load('ped', {}); }, settings,
      // The tray changed: keep this page's tree if its wolf was just pinned, and
      // say so on the card either way.
      sync: () => keepTree(false)
    };
  })());

  // ===================================================== module: shopping list

  defineModule((() => {
    /* Two lists you keep yourself: what you are after, and what you would let
       go. Twill marks anything on either list wherever it sees it, so you stop
       re-checking the same names. Nothing is fetched and no trade is ever acted
       on: it reads item names already on the page in front of you. */
    let wish = Object.assign({ want: [], give: [] }, load('wish', {}));
    const saveWish = () => save('wish', wish);
    const listOf = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
    const hit = (name) => {
      const n = norm(name);
      if (wish.want.some((w) => norm(w) === n)) return 'want';
      if (wish.give.some((w) => norm(w) === n)) return 'give';
      return null;
    };

    let observer = null;
    const styleEl = h('style', {}, `
      .dk-wish-host { position: relative !important; }
      .dk-wish {
        position: absolute; left: 4px; bottom: 4px; z-index: 5;
        display: block !important; width: auto !important; height: auto !important;
        padding: 1px 6px !important; margin: 0 !important; border-radius: var(--dk-radius);
        font: 700 10px/1.5 var(--dk-body-font) !important; text-transform: uppercase; letter-spacing: .06em;
        overflow: visible !important;
        /* "IN STOCK" is twice the width of the old "SPARE", and an item card is
           narrow, so the badge must never break onto a second line. */
        white-space: nowrap !important;
      }
      .dk-wish-want { color: var(--dk-on-accent) !important; background: var(--dk-accent) !important; }
      .dk-wish-give {
        color: var(--dk-text) !important; background: var(--dk-panel) !important;
        border: 1px solid var(--dk-line) !important;
      }
      .dk-wish-row { display: flex; align-items: center; gap: 7px; padding: 3px 0; font-size: 12px; }
      .dk-wish-row span { flex: 1; min-width: 0; }
    `);

    // Every item Wolvden draws carries its name in .item-head or the image alt.
    function mark(item) {
      if (item.dataset.dkWish) return;
      // Trades list wolves in item markup too; a wolf is not on a shopping list.
      if (item.querySelector('a[href*="/wolf/"]')) return;
      const head = item.querySelector('.item-head');
      const img = item.querySelector('img[alt]');
      const name = ((head && head.textContent) || (img && img.alt) || '').replace(/\s+/g, ' ').trim();
      if (!name) return;
      const kind = hit(name);
      item.dataset.dkWish = '1';
      if (!kind) return;
      // A div, not a span: Wolvden's hoard styles collapse spans inside an item,
      // which is the same trap Item Lookup hit.
      const host = item.querySelector('.image') || item;
      host.classList.add('dk-wish-host');
      host.append(h('div', {
        class: 'dk-wish dk-wish-' + kind,
        text: kind === 'want' ? 'buy' : 'in stock',
        title: kind === 'want' ? name + ' is on your shopping list' : name + ' is in stock to trade away'
      }));
    }

    const scan = () => document.querySelectorAll('.item').forEach(mark);

    function start() {
      const page = currentPage();
      if (observer || !['hoard', 'trades', 'trade', 'other'].includes(page.kind)) return;
      if (!document.querySelector('.item')) return;
      document.head.append(styleEl);
      scan();
      // Hoard filtering and paging redraw in place.
      observer = new MutationObserver(scan);
      observer.observe(document.querySelector('#hoard') || document.body, { childList: true, subtree: true });
    }

    function stop() {
      if (observer) observer.disconnect();
      observer = null;
      document.querySelectorAll('.dk-wish').forEach((el) => el.remove());
      document.querySelectorAll('.dk-wish-host').forEach((el) => el.classList.remove('dk-wish-host'));
      document.querySelectorAll('[data-dk-wish]').forEach((el) => delete el.dataset.dkWish);
      styleEl.remove();
    }

    function settings(box) {
      box.append(h('div', { class: 'dk-note', style: 'margin-top:0' },
        'One item name per line. Twill tags them wherever it sees them, so a look through your own hoard or someone’s trade answers itself.'));

      for (const [key, label, hintText] of [['want', 'Buy', 'Items you are looking for'],
        ['give', 'In Stock', 'Items you have spare and would trade away']]) {
        box.append(h('div', { class: 'dk-lb', text: label + '  ·  ' + wish[key].length }));
        const ta = h('textarea', { rows: 5, spellcheck: false, value: wish[key].join('\n'), 'aria-label': label });
        ta.addEventListener('change', () => { wish[key] = listOf(ta.value); saveWish(); stop(); start(); render(); });
        box.append(ta, h('div', { class: 'dk-note', style: 'margin-top:4px', text: hintText }));
      }

      // Anything on the want list you already hold is worth knowing about.
      const owned = [];
      for (const name of wish.want) {
        const uses = recipesUsing(name, true).length;
        owned.push(h('div', { class: 'dk-wish-row' },
          h('span', { text: name }),
          h('span', { class: 'dk-muted', style: 'flex:none;font-size:11px',
            text: uses ? uses + (uses === 1 ? ' recipe uses it' : ' recipes use it') : '' })));
      }
      if (owned.length) {
        box.append(h('div', { class: 'dk-lb', text: 'On your Buy list' }));
        for (const row of owned.slice(0, 20)) box.append(row);
      }
      box.append(h('div', { class: 'dk-note', text: 'Tags show on any page that draws Wolvden’s item cards: your Hoard, and a single trade when you open it. The trading centre’s search and browse lists show only each trade’s title, never the items in it, so tags cannot appear there.' }));
    }

    return {
      id: 'wish', name: 'Shopping List', blurb: 'Tags what to buy and what you have in stock',
      start, stop, reload: () => { wish = Object.assign({ want: [], give: [] }, load('wish', {})); }, settings
    };
  })());

  // ========================================================= module: tray

  defineModule((() => {
    /* The tray is how two wolves ever meet. Wolvden has no page showing both, so
       you pin them as you browse and the pairing happens here. Pin buttons appear
       on a wolf's page and on its family page; the strip docks at the bottom. */
    let strip = null;
    let pin = null;
    let refreshPin = null;      // redraws the pin's label when the tray changes elsewhere

    const styleEl = h('style', {}, `
      #dk-tray {
        position: fixed; left: 12px; bottom: 12px; z-index: 2147483000;
        display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
        max-width: calc(100vw - 150px); padding: 6px 8px;
        background: var(--dk-panel); color: var(--dk-text);
        border-radius: var(--dk-radius); box-shadow: var(--dk-shadow);
        font: 12px/1.4 var(--dk-body-font);
      }
      #dk-tray[hidden] { display: none; }
      .dk-tray-lb {
        font: 700 10px var(--dk-title-font); text-transform: uppercase; letter-spacing: .08em;
        color: var(--dk-tip-title);
      }
      .dk-tray-chip {
        display: flex; align-items: center; gap: 6px; padding: 2px 4px 2px 8px;
        border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
        background: transparent; color: var(--dk-text); font: 12px/1.4 var(--dk-body-font); cursor: pointer;
      }
      .dk-tray-chip[aria-pressed="true"] { border-color: var(--dk-accent); background: var(--dk-hover); }
      .dk-tray-chip b { font-weight: 600; }
      .dk-tray-chip span { color: var(--dk-muted); font-size: 11px; }
      .dk-tray-x { padding: 0 2px; color: var(--dk-muted); background: none; border: 0; cursor: pointer; font-size: 13px; }
      .dk-tray-x:hover { color: var(--dk-text); }
      .dk-pin {
        margin-left: 8px; padding: 3px 9px; cursor: pointer; vertical-align: middle;
        font: 11px/1.3 var(--dk-body-font); color: var(--dk-on-accent);
        background: var(--dk-accent); border: 0; border-radius: var(--dk-radius);
      }
      .dk-pin[aria-pressed="true"] { color: var(--dk-text); background: var(--dk-surface); border: 1px solid var(--dk-line); }
      .dk-pair-sec {
        margin-top: 9px; padding-top: 7px; border-top: 1px solid var(--dk-line);
      }
      .dk-pair-sec:first-of-type { border-top: 0; }
    `);

    const nameFor = (id) => (coll[id] && coll[id].n) || (ped[id] && ped[id].n) || ('#' + id);
    // "1 year 6½ months (Adult)" is too long for a chip.
    const shortAge = (s) => {
      const m = String(s || '').match(/(\d+)\s*year/);
      const d = String(s || '').match(/(\d+)\s*month/);
      return m || d ? (m ? m[1] + 'y ' : '') + (d ? d[1] + 'm' : '') : '';
    };
    let picked = [];

    function paint() {
      if (!strip) return;
      // A wolf taken out of the tray, from here or from its own page, cannot
      // still be one of the two picked for Pair.
      picked = picked.filter((x) => tray.includes(x));
      strip.textContent = '';
      strip.hidden = !tray.length;
      if (!tray.length) return;
      strip.append(h('span', { class: 'dk-tray-lb', text: 'Tray ' + tray.length }));
      for (const id of tray) {
        const on = picked.includes(id);
        const chip = h('button', {
          type: 'button', class: 'dk-tray-chip', 'aria-pressed': String(on),
          title: 'Pick two, then Pair',
          onclick: () => {
            if (on) picked = picked.filter((x) => x !== id);
            else picked = picked.concat(id).slice(-2);
            paint();
          }
        }, h('b', { text: nameFor(id) }));
        const w = coll[id];
        if (w && (w.sx || w.ag)) chip.append(h('span', { text: (/female/i.test(w.sx || '') ? '♀' : /male/i.test(w.sx || '') ? '♂' : '') + ' ' + shortAge(w.ag) }));
        strip.append(chip, h('button', {
          type: 'button', class: 'dk-tray-x', text: '×', title: 'Take ' + nameFor(id) + ' out',
          'aria-label': 'Remove ' + nameFor(id),
          onclick: () => { tray = load('tray', []).filter((x) => x !== id); picked = picked.filter((x) => x !== id); saveTray(); trayChanged(); }
        }));
      }
      // Pair wants exactly two; Compare is happy with any of them.
      const go = (to, ids) => { pairIds = ids; toggleHub(true); screen = to; render(); };
      strip.append(h('button', {
        type: 'button', class: 'dk-pin', disabled: picked.length !== 2,
        text: picked.length === 2 ? 'Pair these two' : 'Pick two to pair',
        // toggleHub resets to home, so pick the screen after it opens.
        onclick: () => go('pair', picked.slice())
      }));
      if (tray.length > 1) {
        strip.append(h('button', {
          type: 'button', class: 'dk-pin', style: 'color:var(--dk-text);background:var(--dk-surface)',
          text: picked.length > 1 ? 'Compare ' + picked.length : 'Compare all ' + tray.length,
          onclick: () => go('compare', picked.length > 1 ? picked.slice() : tray.slice())
        }));
      }
    }

    /* A pinned wolf's genes are read from its own page, here and now, while you
       are on it. Nothing is read for a wolf that is not in the tray. */
    function keepThis(fresh) {
      const page = currentPage();
      if (page.kind !== 'wolf' || !tray.includes(page.id)) return;
      if (!fresh && coll[page.id]) return;
      const rec = readWolfPage();
      if (!rec) return;
      coll = load('coll', {});   // start from the stored copy, never this tab's
      coll[page.id] = rec;
      save('coll', coll);
    }

    // After any change to the tray: drop what left it, keep what joined it, and
    // let the Pedigree and any open screen catch up.
    function trayChanged() {
      pruneToTray();
      resync();
    }

    function addPin(id, host) {
      const set = () => {
        const on = tray.includes(id);
        pin.setAttribute('aria-pressed', String(on));
        pin.textContent = on ? '✓ In tray' : '+ Tray';
      };
      pin = h('button', {
        type: 'button', class: 'dk-pin', title: 'Pin this wolf so you can pair it with another',
        onclick: () => {
          // Start from the stored tray, in case another tab changed it.
          tray = load('tray', []);
          if (tray.includes(id)) tray = tray.filter((x) => x !== id);
          else tray = tray.concat(id).slice(-8);
          saveTray();
          trayChanged();
        }
      });
      refreshPin = set;
      set();
      host.append(pin);
    }

    function start() {
      const page = currentPage();
      if (strip) return;
      document.head.append(styleEl);
      strip = h('div', { id: 'dk-tray', 'aria-label': 'Wolf tray' });
      document.body.append(strip);
      picked = tray.slice(-2);
      paint();
      if (page.kind === 'wolf' || page.kind === 'family') {
        const head = document.querySelector('#main h1');
        if (head) addPin(page.id, head);
      }
      keepThis(true);   // refresh a pinned wolf's age and genes while on its page
    }

    function stop() {
      if (strip) strip.remove();
      if (pin) pin.remove();
      strip = pin = refreshPin = null;
      styleEl.remove();
    }

    function settings(box) {
      box.append(h('div', { class: 'dk-note', style: 'margin-top:0' },
        'Wolvden has no page that shows two wolves at once, so pin them as you browse. The tray keeps up to 8; pick two and Pair reads across everything Twill has of them. A pinned wolf’s genes come from its own page and its family tree from its Family page, read while you are on them. Take a wolf out and Twill forgets both.'));
      box.append(h('div', { class: 'dk-lb', text: 'In the tray  ·  ' + tray.length }));
      for (const id of tray) {
        box.append(h('div', { class: 'dk-find' },
          h('strong', { text: nameFor(id) }),
          h('span', { text: (coll[id] ? 'genes read' : 'no genes yet') + '  ·  ' + (ped[id] ? 'tree read' : 'no tree yet') })));
      }
      if (!tray.length) box.append(h('div', { class: 'dk-empty', text: 'Nothing pinned. The button sits beside a wolf’s name.' }));
      box.append(h('div', { class: 'dk-btns' }, h('button', {
        type: 'button', class: 'dk-btn dk-quiet', text: 'Empty the tray',
        onclick: () => {
          if (!confirm('Take every wolf out of the tray? Twill forgets their genes and family trees too.')) return;
          tray = []; saveTray(); trayChanged(); screen = 'tray'; render();
        }
      })));
    }

    return {
      id: 'tray', name: 'Tray', blurb: 'Pin two wolves, then pair them',
      start, stop, reload: () => { tray = load('tray', []); }, settings,
      // The tray changed, here or in another tab, or a wolf in it was read: redraw,
      // and read this page's wolf if it has just been pinned.
      sync: () => { keepThis(false); paint(); if (refreshPin) refreshPin(); }
    };
  })());

  // =================================================== module: collection

  defineModule((() => {
    // No page furniture and nothing read from any page: the Collection is a
    // checklist you tick yourself, on its own screen in the hub.
    function settings(box) {
      box.append(h('div', { class: 'dk-note', style: 'margin-top:0' },
        'A checklist of every base, eye colour and marking in the game. Tick the ones you have and Twill counts them for you. You keep it yourself: Twill never fills it in from a page.'));
      box.append(h('div', { class: 'dk-lb', text: 'Ticked  ·  ' + haveCount().toLocaleString('en-GB') }));
      box.append(h('div', { class: 'dk-btns' },
        h('button', { type: 'button', class: 'dk-btn', text: 'Open Collection', onclick: () => { screen = 'collection'; render(); } })));
    }

    return {
      id: 'collect', name: 'Collection', blurb: 'A checklist of what you have',
      start() {}, stop() {}, reload: () => { have = loadHave(); }, settings
    };
  })());

  // =================================================== module: wardrobe

  /* The wardrobe, with the three things it does not do itself.

     What it ALREADY does, and Twill must not duplicate: every one of the
     ~2,200 decors is in those ten dropdowns whether you own it or not, each
     dropdown is searchable, and the preview stacks up to twenty layers live. So
     "see several decors on a wolf before buying" is a game feature already.

     What is missing:
       1. CUSTOM DECOR is not in the list at all, so there is no way to see a
          custom piece next to ordinary decor. Twill adds layers of its own
          from an image address, which works for a custom decor, for a piece an
          artist has only sent you a preview of, for anything.
       2. A LOOK IS NOT KEPT. Navigate away and it is gone, and two ideas can
          never be compared. Twill saves looks, and Try on draws one back into
          the picture without touching the form.
       3. NOTHING SAYS WHERE A DECOR COMES FROM, or whether you own it.

     The customiser rebuilds its whole <img> stack on a full update, so injected
     layers are wiped without warning. They are put back by an observer, the same
     way the Hoard's redraws are handled. Twill writes nothing to the form
     and never presses Customise: the preview is a picture, and changing a wolf
     stays a thing you do yourself. */
  defineModule((() => {
    const PREVIEW = '.customiser-preview';
    const MAX_CUSTOM = 6;

    let ws = {};
    const reloadWardrobe = () => Object.assign(ws, { custom: [], outfits: [] }, load('wardrobe', {}));
    reloadWardrobe();
    const saveWardrobe = () => save('wardrobe', ws);

    let panel = null, styleEl = null, obs = null, slotObs = null;

    const IMG_OK = /^https?:\/\/\S+$/i;
    const slots = () => [...document.querySelectorAll('select[name^="d"]')]
      .filter((s) => /^d\d+$/.test(s.name));

    // ---- the injected layers ----

    /* Try on draws a saved look into the picture and nowhere else. The game
       builds each decor layer from three things already on the page: the
       option's data-path, the wolf's variant and its age. Twill works out the
       same image address from them and draws it as one of its own layers. The
       game's own decor layers are hidden while a look is tried on, by a style
       Twill adds and takes away again, and the ten dropdowns are never touched:
       nothing is filled in, nothing is triggered, and nothing is sent. */
    let trying = null;        // { o: the outfit, at: the dropdown values when it started }
    const hideTheirs = h('style', {}, `
      ${PREVIEW} img[id^="preview-d"][id$="-below"],
      ${PREVIEW} img[id^="preview-d"][id$="-over"] { visibility: hidden !important; }
    `);

    // The game's own age values, and the folder each one draws decor from.
    const AGE_FOLDER = { 13: 'adolescent', 8: 'pup', 3: 'pupyoung', 1: 'pupnewborn' };

    function decorSrc(opt) {
      const path = opt.getAttribute('data-path') || '';
      if (!/^(below|over)\//.test(path)) return null;
      // The image host, read off the game's own preview so it follows Wolvden if
      // it ever moves, and the address it uses today when nothing says otherwise.
      let root = 'https://static.wolvden.com/images/';
      for (const img of document.querySelectorAll(PREVIEW + ' img[id^="preview-"]')) {
        const m = (img.getAttribute('src') || '').match(/^(https?:\/\/[^?#]*?\/images\/)/);
        if (m) { root = m[1]; break; }
      }
      const universal = opt.getAttribute('data-universal');
      if (universal && universal !== '0' && universal !== 'false') {
        return root + 'wolves/decor/default/adult/' + path + '.png';
      }
      const variantSel = document.querySelector('select[name="variant"]');
      const ageSel = document.querySelector('select[name="age"]');
      const variant = (variantSel && variantSel.value) || 'default';
      return root + 'wolves/decor/' + variant + '/' + (AGE_FOLDER[Number(ageSel && ageSel.value)] || 'adult') + '/' + path + '.png';
    }

    // A saved look's decor, slot by slot, as the options it names.
    function lookDecor(o) {
      const ss = slots();
      const out = [];
      (o.d || []).forEach((v, i) => {
        const opt = v && ss[i] && [...ss[i].options].find((x) => x.value === v);
        if (opt) out.push({ slot: i + 1, opt, below: (opt.getAttribute('data-path') || '').startsWith('below') });
      });
      return out;
    }

    /* Every layer Twill draws is an <img> put straight into the game's own
       preview stack, so it scales and sits with everything else. "Below" goes in
       front of the backdrop but behind the wolf; "over" goes last of all. While
       a look is tried on, its decor goes in first, in slot order, and its own
       custom layers stand in for the ones you are building now. */
    function inject() {
      const host = document.querySelector(PREVIEW);
      if (!host) return;
      for (const el of host.querySelectorAll('.dk-wd-layer')) el.remove();
      const base = host.querySelector('#preview-shadow') || host.querySelector('#preview-base');
      const put = (src, below, extra) => {
        const img = h('img', Object.assign({ class: 'dk-wd-layer', src, alt: '' }, extra));
        if (!below || !base) host.append(img);
        else host.insertBefore(img, base);
      };
      if (trying) {
        for (const d of lookDecor(trying.o)) {
          const src = decorSrc(d.opt);
          if (src) put(src, d.below);
        }
      }
      for (const [i, c] of (trying ? trying.o.c || [] : ws.custom).entries()) {
        if (!c.on || !IMG_OK.test(c.url || '')) continue;
        put(c.url, !c.over, { 'data-dk-i': String(i) });
      }
    }

    function tryOn(o) {
      trying = { o, at: slots().map((s) => s.value) };
      if (!hideTheirs.isConnected) document.head.appendChild(hideTheirs);
      inject();
      paint();
    }

    function stopTrying() {
      if (!trying) return;
      trying = null;
      hideTheirs.remove();
      inject();
      paint();
    }

    function watch() {
      const host = document.querySelector(PREVIEW);
      if (!host || obs) return;
      obs = new MutationObserver((recs) => {
        // Only react to the game replacing the stack, never to our own inserts,
        // or the observer would chase its own tail.
        const theirs = recs.some((r) => [...r.addedNodes].some(
          (n) => n.nodeType === 1 && !n.classList.contains('dk-wd-layer')));
        if (theirs) inject();
      });
      obs.observe(host, { childList: true });
    }

    // ---- what the game knows about the current selection ----

    const chosenOf = (sel) => {
      const o = sel.options[sel.selectedIndex];
      return o && o.value ? { name: o.textContent.trim(), path: o.getAttribute('data-path') || '' } : null;
    };

    const normName = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    function recipeFor(name) {
      const want = normName(name);
      return (RECIPE_BOOK.recipes || []).find((r) => normName(r.n) === want) || null;
    }

    /* What is in the ten slots right now, drawn in Twill's own panel.

       An earlier build wrote a small note into each of Wolvden's table cells
       instead. It appended cleanly, the node reported itself connected, and it
       was gone a moment later: something on that page strips what it did not
       put there. Not worth fighting, and one tidy list beats ten notes scattered
       through someone else's table anyway. Nothing is written into the game's
       DOM now except the preview layers, which have their own observer. */
    function slotList(into) {
      const rows = [];
      for (const sel of slots()) {
        const pick = chosenOf(sel);
        if (!pick) continue;
        const r = recipeFor(pick.name);
        const line = h('div', { class: 'dk-wd-slot' },
          h('div', { class: 'dk-wd-sname' },
            h('strong', { text: pick.name }),
            h('span', { text: sel.name.toUpperCase() + (pick.path.startsWith('below/') ? '  \u00b7  behind' : '') })));
        if (r) {
          line.append(h('div', { class: 'dk-wd-rec',
            text: 'crafted  \u00b7  ' + r.i.map(([n, q]) => n + (q > 1 ? ' \u00d7' + q : '')).join(', ') }));
        }
        rows.push(line);
      }
      into.append(h('div', { class: 'dk-lb', text: 'On this wolf  \u00b7  ' + rows.length }));
      if (!rows.length) {
        into.append(h('div', { class: 'dk-wd-hint', text: 'Nothing picked yet. Choose decor in the slots above and it is listed here, with what it is made from.' }));
      }
      for (const r of rows) into.append(r);
    }

    /* Chosen sits over these selects and a plain change listener on them proved
       unreliable, so the decor table is watched instead: whatever moves, native
       select or Chosen's own display, the list is redrawn from the selects. The
       redraw is coalesced so a burst of mutations costs one pass. */
    let slotTimer = null;
    const onAnyChange = () => {
      clearTimeout(slotTimer);
      slotTimer = setTimeout(() => {
        // Picking a decor yourself ends a try-on: you are building your own look
        // now, and it should show. The variant or age changing does not, since
        // the picture simply redraws the tried-on look for the new one.
        if (trying && slots().some((s, i) => s.value !== trying.at[i])) { stopTrying(); return; }
        if (body && !body.hidden) paint();
      }, 80);
    };

    // ---- outfits ----

    const readLook = () => ({
      d: slots().map((s) => s.value),
      c: ws.custom.map((c) => ({ url: c.url, over: !!c.over, on: c.on !== false }))
    });

    // ---- the panel ----

    // While a look is tried on: what it is, how to stop, and what is in it, slot
    // by slot, so it can be set by hand if it is the one.
    function tryingBlock() {
      const o = trying.o;
      body.append(h('div', { class: 'dk-wd-trying' },
        h('div', { class: 'dk-wd-trying-t' },
          h('strong', { text: 'Trying on ' + o.n }),
          h('span', { text: 'The picture shows this look. Your dropdowns are untouched.' })),
        h('button', { type: 'button', class: 'dk-btn dk-primary', text: 'Stop trying on', onclick: stopTrying })));
      const rows = lookDecor(o).map((d) => h('div', { class: 'dk-wd-slot' },
        h('div', { class: 'dk-wd-sname' },
          h('strong', { text: d.opt.textContent.trim() }),
          h('span', { text: 'SLOT ' + d.slot + (d.below ? '  ·  behind' : '') }))));
      for (const c of o.c || []) {
        if (!c.on) continue;
        rows.push(h('div', { class: 'dk-wd-slot' }, h('div', { class: 'dk-wd-sname' },
          h('strong', { text: 'Custom layer' }), h('span', { text: c.over ? 'IN FRONT' : 'BEHIND' }))));
      }
      body.append(h('div', { class: 'dk-lb', text: 'In this look  ·  ' + rows.length }), ...rows,
        h('div', { class: 'dk-wd-hint', style: 'margin-top:6px',
          text: 'To keep it, pick these in the slots yourself. Changing any slot ends the try-on.' }));
    }

    let body = null;
    function paint() {
      if (!body) return;
      body.textContent = '';

      if (trying) tryingBlock();

      body.append(h('div', { class: 'dk-lb', text: 'Custom decor and other art' }));
      body.append(h('div', { class: 'dk-wd-hint',
        text: 'Paste the address of an image and it is drawn into the preview with everything else. Custom decor is not in Wolvden\u2019s own list, so this is the only way to see one beside ordinary decor.' }));

      for (const [i, c] of ws.custom.entries()) {
        const row = h('div', { class: 'dk-wd-row' });
        const tick = h('input', { type: 'checkbox', checked: c.on !== false, 'aria-label': 'Show this layer' });
        tick.addEventListener('change', () => { c.on = tick.checked; saveWardrobe(); inject(); });
        const where = h('select', { 'aria-label': 'Above or below the wolf' },
          h('option', { value: 'below', text: 'behind', selected: !c.over }),
          h('option', { value: 'over', text: 'in front', selected: !!c.over }));
        where.addEventListener('change', () => { c.over = where.value === 'over'; saveWardrobe(); inject(); });
        row.append(tick,
          h('span', { class: 'dk-wd-url', text: c.url, title: c.url }),
          where,
          h('button', { type: 'button', class: 'dk-wd-x', text: '\u2715', title: 'Remove this layer',
            onclick: () => { ws.custom.splice(i, 1); saveWardrobe(); inject(); paint(); } }));
        body.append(row);
      }

      if (ws.custom.length < MAX_CUSTOM) {
        const url = h('input', { type: 'text', placeholder: 'https://\u2026 image address', 'aria-label': 'Image address' });
        const err = h('div', { class: 'dk-wd-err', 'aria-live': 'polite' });
        const add = () => {
          const v = url.value.trim();
          if (!IMG_OK.test(v)) { err.textContent = 'Needs a full https:// address that points at an image.'; return; }
          ws.custom.push({ url: v, over: true, on: true });
          saveWardrobe(); inject(); paint();
        };
        url.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
        body.append(h('div', { class: 'dk-wd-row' }, url,
          h('button', { type: 'button', class: 'dk-btn dk-primary', text: 'Add', onclick: add })), err);
      }

      body.append(h('div', { class: 'dk-lb', text: 'Outfits  \u00b7  ' + ws.outfits.length }));
      if (!ws.outfits.length) {
        body.append(h('div', { class: 'dk-wd-hint', text: 'A look is gone the moment you leave this page. Save one and it keeps, so two ideas can be put next to each other.' }));
      }
      for (const [i, o] of ws.outfits.entries()) {
        const n = (o.d || []).filter(Boolean).length + (o.c || []).length;
        const on = !!trying && trying.o === o;
        body.append(h('div', { class: 'dk-wd-row' },
          h('span', { class: 'dk-wd-name' }, h('strong', { text: o.n }),
            h('span', { text: n + (n === 1 ? ' layer' : ' layers') })),
          on ? h('span', { class: 'dk-wd-on', text: 'trying on' })
            : h('button', { type: 'button', class: 'dk-btn dk-quiet', text: 'Try on',
              title: 'Draw this look in the picture. Your dropdowns stay as they are.', onclick: () => tryOn(o) }),
          h('button', { type: 'button', class: 'dk-wd-x', text: '\u2715', title: 'Forget this outfit',
            onclick: () => { if (on) stopTrying(); ws.outfits.splice(i, 1); saveWardrobe(); paint(); } })));
      }
      const nameIn = h('input', { type: 'text', placeholder: 'Call this look\u2026', 'aria-label': 'Outfit name' });
      const keep = () => {
        const nm = nameIn.value.trim();
        if (!nm) { nameIn.focus(); return; }
        ws.outfits.push(Object.assign({ n: nm }, readLook()));
        saveWardrobe(); paint();
      };
      nameIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); keep(); } });
      body.append(h('div', { class: 'dk-wd-row' }, nameIn,
        h('button', { type: 'button', class: 'dk-btn dk-primary', text: 'Save look', onclick: keep })));

      slotList(body);
    }

    function build() {
      const head = h('button', {
        type: 'button', class: 'dk-wd-h',
        onclick: () => { body.hidden = !body.hidden; ws.open = !body.hidden; saveWardrobe(); }
      }, h('b', { text: 'Twill' }), h('span', { text: 'custom decor, outfits' }));
      body = h('div', { class: 'dk-wd-b', hidden: ws.open === false });
      paint();
      return h('section', { id: 'dk-wd', 'aria-label': 'Wardrobe extras' }, head, body);
    }

    function start() {
      if (currentPage().kind !== 'wardrobe' || panel) return;
      const host = document.querySelector(PREVIEW);
      if (!host) return;
      if (!styleEl) styleEl = h('style', {}, `
        #dk-wd {
          margin: 12px auto 16px; max-width: 420px; background: var(--dk-panel); color: var(--dk-text);
          border: 1px solid var(--dk-line); border-radius: var(--dk-radius); overflow: hidden;
          font: 12px/1.5 var(--dk-body-font); text-align: left;
        }
        #dk-wd * { box-sizing: border-box; }
        .dk-wd-h {
          display: flex; align-items: baseline; gap: 8px; width: 100%; margin: 0; cursor: pointer;
          padding: 7px 12px; border: 0; border-radius: 0; text-align: left;
          background: var(--dk-head); color: var(--dk-head-text); font: 600 13px/1.3 var(--dk-title-font);
        }
        .dk-wd-h span { margin-left: auto; font: 400 11px var(--dk-body-font); opacity: .85; }
        .dk-wd-b { padding: 4px 12px 12px; }
        .dk-wd-row { display: flex; align-items: center; gap: 6px; padding: 4px 0; }
        .dk-wd-row input[type=text] {
          flex: 1; min-width: 0; height: auto; margin: 0; padding: 4px 7px;
          font: 12px/1.4 var(--dk-body-font); color: var(--dk-text);
          background: var(--dk-surface); border: 1px solid var(--dk-line);
          border-radius: var(--dk-radius); box-shadow: none; outline: 0;
        }
        .dk-wd-row select {
          flex: none; width: auto; height: auto; margin: 0; padding: 3px 5px;
          font: 11px/1.3 var(--dk-body-font); color: var(--dk-text);
          background: var(--dk-surface); border: 1px solid var(--dk-line);
          border-radius: var(--dk-radius); box-shadow: none;
        }
        .dk-wd-url { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }
        .dk-wd-name { flex: 1; min-width: 0; }
        .dk-wd-name span { display: block; color: var(--dk-muted); font-size: 10.5px; }
        .dk-wd-x { flex: none; background: none; border: 0; margin: 0; padding: 0 4px; cursor: pointer; color: var(--dk-muted); }
        .dk-wd-x:hover { color: var(--dk-warn-text); }
        .dk-wd-hint { color: var(--dk-muted); font-size: 11px; margin: 2px 0 4px; }
        .dk-wd-err { color: var(--dk-warn-text); font-size: 11px; }
        .dk-wd-layer { position: absolute; top: 0; left: 0; width: 100%; }
        .dk-wd-slot { padding: 4px 0; border-bottom: 1px solid var(--dk-line); }
        .dk-wd-slot:last-child { border-bottom: 0; }
        .dk-wd-sname { display: flex; align-items: baseline; gap: 8px; }
        .dk-wd-sname strong { font-weight: 600; }
        .dk-wd-sname span { margin-left: auto; flex: none; color: var(--dk-muted); font-size: 10px; letter-spacing: .05em; }
        .dk-wd-rec { color: var(--dk-muted); font-size: 10.5px; line-height: 1.45; }
        .dk-wd-trying {
          display: flex; align-items: center; gap: 8px; margin: 8px 0 6px; padding: 8px 10px;
          background: var(--dk-surface); border-left: 3px solid var(--dk-accent); border-radius: 0;
        }
        .dk-wd-trying-t { flex: 1; min-width: 0; }
        .dk-wd-trying-t strong { display: block; font-weight: 600; }
        .dk-wd-trying-t span { display: block; color: var(--dk-muted); font-size: 11px; }
        .dk-wd-on { flex: none; color: var(--dk-accent); font-size: 11px; }
      `);
      if (!styleEl.isConnected) document.head.appendChild(styleEl);
      panel = build();
      host.parentNode.insertBefore(panel, host.nextSibling);
      inject();
      watch();
      /* Delegated, on the document, in the capture phase. Binding to each select
         looks tidier and does not survive: Chosen rebuilds these controls, and a
         listener on the old element goes with it. Delegation catches the change
         whatever element is carrying it by then. */
      document.addEventListener('change', onAnyChange, true);
      const table = document.querySelector('.customiser-decors');
      if (table) {
        slotObs = new MutationObserver(onAnyChange);
        slotObs.observe(table, { childList: true, subtree: true, characterData: true, attributes: true });
      }
    }

    function stop() {
      if (obs) { obs.disconnect(); obs = null; }
      document.removeEventListener('change', onAnyChange, true);
      if (slotObs) { slotObs.disconnect(); slotObs = null; }
      clearTimeout(slotTimer);
      // A try-on never outlives the module: the game's own decor comes back.
      trying = null;
      hideTheirs.remove();
      document.querySelectorAll('.dk-wd-layer, .dk-wd-note').forEach((el) => el.remove());
      if (panel) panel.remove();
      panel = null; body = null;
      if (styleEl) styleEl.remove();
    }

    function settings(box) {
      box.append(h('div', { class: 'dk-note', style: 'margin-top:0', text:
        'Wolvden\u2019s wardrobe already lets you preview every decor, owned or not, 10 at a time. Twill adds the 3 things it does not: custom decor as extra layers, looks you can keep and compare, and a line under each slot saying where that decor comes from.' }));
      box.append(h('div', { class: 'dk-lb', text: 'Saved' }));
      box.append(h('div', { class: 'dk-note', style: 'margin-top:0',
        text: ws.outfits.length + (ws.outfits.length === 1 ? ' outfit' : ' outfits') + ', '
          + ws.custom.length + (ws.custom.length === 1 ? ' custom layer' : ' custom layers') + '.' }));
      box.append(h('div', { class: 'dk-btns' }, h('button', {
        type: 'button', class: 'dk-btn dk-quiet', text: 'Forget all outfits',
        onclick: () => {
          const n = ws.outfits.length;
          if (!confirm('Forget all ' + n + (n === 1 ? ' saved outfit' : ' saved outfits') + '? This can’t be undone.')) return;
          if (trying) stopTrying();
          ws.outfits = []; saveWardrobe(); screen = 'wardrobe'; render();
        }
      })));
      box.append(h('div', { class: 'dk-note', text:
        'Try on draws a saved look into the picture and nowhere else. Twill never fills in the form and never presses Customise, so changing a wolf stays something you do yourself.' }));
    }

    return {
      id: 'wardrobe', name: 'Wardrobe', blurb: 'Custom decor layers, and looks you can keep',
      start, stop, reload: reloadWardrobe, settings
    };
  })());

  // ================================================== module: explore bars

  defineModule((() => {
    /* On a phone Wolvden stacks its sidebar under everything else, so the Energy
       and HP bars end up at the very bottom of the explore page, a long scroll
       from the explore box. This draws a small copy of them just above the box.
       It is only a copy: Wolvden's own bars are never moved or touched, and the
       copy reads their width and number again whenever the game changes them.
       Nothing is clicked, fetched, timed or stored. */
    const BARS = { energy: 'Energy', hp: 'HP', hunger: 'Hunger', xp: 'EXP' };
    const SHOW = { two: ['energy', 'hp'], four: ['energy', 'hp', 'hunger', 'xp'] };
    const xst = {};
    const reloadXb = () => Object.assign(xst, { narrow: true, wide: false, show: 'two' }, load('xbars', {}));
    reloadXb();
    const saveXb = () => save('xbars', { narrow: xst.narrow, wide: xst.wide, show: xst.show });

    let strip = null, observer = null;
    const cells = {};

    // 992px is where Wolvden's own layout moves the sidebar below everything.
    const styleEl = h('style', {}, `
      #dk-xb {
        display: none; margin: 0 0 8px; padding: 6px 9px 7px;
        background: color-mix(in srgb, var(--dk-panel) 94%, transparent);
        border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
        color: var(--dk-text); font: 11px/1.2 var(--dk-body-font); text-align: left;
      }
      @media (max-width: 991.98px) { #dk-xb.dk-xb-narrow { display: block; } }
      @media (min-width: 992px) { #dk-xb.dk-xb-wide { display: block; } }
      #dk-xb * { box-sizing: border-box; }
      .dk-xb-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 12px; }
      .dk-xb-lab {
        display: flex; justify-content: space-between; gap: 6px; margin-bottom: 3px;
        text-transform: uppercase; letter-spacing: .06em !important;
        color: var(--dk-muted) !important; text-shadow: none !important;
      }
      .dk-xb-lab b {
        color: var(--dk-text) !important; font-weight: 600 !important;
        letter-spacing: normal !important; text-transform: none; font-variant-numeric: tabular-nums;
      }
      .dk-xb-track { height: 7px; border-radius: 4px; overflow: hidden; background: color-mix(in srgb, var(--dk-text) 13%, transparent); }
      .dk-xb-track i { display: block; height: 100%; border-radius: 4px; transition: width .3s ease; }
    `);

    // Copy one bar across: its number, its width, and Wolvden's own colour for it.
    function paint() {
      for (const [key, c] of Object.entries(cells)) {
        const bar = document.getElementById('progress-' + key);
        const num = document.getElementById('percent-' + key);
        c.wrap.hidden = !bar;
        if (!bar) continue;
        const now = bar.getAttribute('aria-valuenow');
        c.fill.style.width = bar.style.width || (now != null ? now + '%' : '0%');
        c.fill.style.background = getComputedStyle(bar).backgroundColor;
        c.num.textContent = num ? num.textContent.replace(/\s+/g, ' ').trim() : '';
      }
    }

    function start() {
      if (strip || currentPage().kind !== 'explore') return;
      if (!xst.narrow && !xst.wide) return;
      const box = document.getElementById('explore-wrapper');
      // Wolvden's page has two elements called card-user, and only one holds the
      // bars, so the energy bar itself is the anchor.
      const energy = document.getElementById('progress-energy');
      if (!box || !energy) return;
      document.head.append(styleEl);
      const row = h('div', { class: 'dk-xb-row' });
      for (const key of SHOW[xst.show] || SHOW.two) {
        const num = h('b');
        const fill = h('i');
        const wrap = h('div', {},
          h('div', { class: 'dk-xb-lab' }, h('span', { text: BARS[key] }), num),
          h('div', { class: 'dk-xb-track' }, fill));
        cells[key] = { wrap, num, fill };
        row.append(wrap);
      }
      // A duplicate of bars a screen reader already reads in the sidebar.
      strip = h('div', { id: 'dk-xb', 'aria-hidden': 'true',
        class: (xst.narrow ? 'dk-xb-narrow' : '') + (xst.wide ? ' dk-xb-wide' : '') }, row);
      box.before(strip);
      paint();
      // Watch the sidebar rather than the card, in case the game swaps the card
      // whole. The observer already hands over every change made in one go as a
      // single batch, and nothing painted here sits inside the sidebar, so a
      // repaint can never set it off again.
      observer = new MutationObserver(paint);
      observer.observe(document.getElementById('sidebar') || (energy.closest('.card') || energy).parentNode,
        { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style', 'aria-valuenow'] });
    }

    function stop() {
      if (observer) observer.disconnect();
      if (strip) strip.remove();
      observer = strip = null;
      for (const key of Object.keys(cells)) delete cells[key];
      styleEl.remove();
    }

    function settings(sheet) {
      const redraw = () => { saveXb(); stop(); start(); };
      sheet.append(
        h('div', { class: 'dk-note', style: 'margin-top:0', text: 'A copy of Wolvden’s own bars from the sidebar, drawn above the explore picture. It follows them as they change. The game’s bars stay where they are.' }),
        check('On phones and narrow windows', xst.narrow, (v) => { xst.narrow = v; redraw(); }),
        check('On a computer too', xst.wide, (v) => { xst.wide = v; redraw(); }),
        h('div', { class: 'dk-lb', text: 'Show' }),
        h('select', { 'aria-label': 'Which bars', onchange: (e) => { xst.show = e.target.value; redraw(); } },
          h('option', { value: 'two', text: 'Energy and HP', selected: xst.show !== 'four' }),
          h('option', { value: 'four', text: 'Energy, HP, Hunger and EXP', selected: xst.show === 'four' })),
        h('div', { class: 'dk-note', text: 'Narrow means under 992 pixels wide, where Wolvden moves its sidebar below the page. On a computer the sidebar already sits beside the picture, so this is off there unless you want it.' })
      );
    }

    return {
      id: 'xbars', name: 'Explore bars', blurb: 'Energy and HP above the explore box',
      start, stop, reload: reloadXb, settings
    };
  })());

  // ===================================================== module: fishing

  /* Fishing, made readable, for red-blind and green-blind vision and for anyone
     who struggles to pick the ripple out of the water.

     It is a CSS filter on the canvas element and nothing more. The browser
     composites it. Twill never reads a pixel, never calls getImageData,
     never touches the game's own code and never says where anything is. This is
     the same thing it does everywhere else, restyle what is already on screen.

     HOW THE MODES WERE CHOSEN. The first build used textbook daltonization
     (R = I + S(I - Sim)). Measuring it killed it: take the game's red marker and
     green bar, push both through the filter, then through a simulation of how a
     protanope actually sees, and the two colours came out CLOSER than with no
     filter at all (0.5x for protan, 0.7x for deutan). The classic error-shift
     moves red error into green and blue, and for this pair that flattens a blue
     gap that was already doing the work. Correct in general, wrong here.

     What replaced it was chosen by measuring the same way: the distance between
     marker and bar as a protanope and a deuteranope would see them, after the
     filter. A 240 degree hue rotation turns the marker blue and the bar warm,
     which is the pairing colourblind design has always reached for, and it
     measures 1.6x for both. The gentler options trade some of that for a picture
     that looks less strange.

     Deliberately NOT built: anything that finds the ripple for you. Detecting it
     and marking it would be telling you where to click, which is playing the
     game rather than showing it. Clarity lifts the whole picture uniformly, so
     the ripple stands off the water without Twill knowing it is there. */
  defineModule((() => {
    /* [label, css filter, svg matrix, measured gain]. The gain is the distance
       between the red marker and the green bar as a protanope/deuteranope sees
       them, after the filter, over the same distance with no filter. 1.0 is no
       help at all. */
    const CVD = {
      off:    ['Off', null, null, ''],
      blue:   ['Marker to blue', 'hue-rotate(240deg)', null, '1.6x apart'],
      soft:   ['Marker to blue, gentler', 'hue-rotate(200deg)', null, '1.3x apart'],
      swap:   ['Swap red and blue', null, '0 0 1 0 0  0 1 0 0 0  1 0 0 0 0  0 0 0 1 0', '1.1x apart, keeps the scenery green']
    };

    let fst = {};
    const reloadFish = () => Object.assign(fst, { mode: 'off', clarity: 0, panel: true }, load('fish', {}));
    reloadFish();

    let svg = null, styleEl = null, panel = null;

    // One <svg> holding a filter per mode, referenced by CSS. Defined once and
    // left alone; switching modes only changes which url() the canvas points at.
    function ensureFilters() {
      if (svg && svg.isConnected) return;
      const ns = 'http://www.w3.org/2000/svg';
      svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      // Only a channel swap needs SVG; hue-rotate is a CSS filter already.
      for (const [key, row] of Object.entries(CVD)) {
        if (!row[2]) continue;
        const f = document.createElementNS(ns, 'filter');
        f.setAttribute('id', 'dk-cvd-' + key);
        f.setAttribute('color-interpolation-filters', 'sRGB');
        const m = document.createElementNS(ns, 'feColorMatrix');
        m.setAttribute('type', 'matrix');
        m.setAttribute('values', row[2]);
        f.appendChild(m);
        svg.appendChild(f);
      }
      document.body.appendChild(svg);
    }

    const canvasEl = () => document.querySelector('#fishingGame canvas, #fishingContainer canvas');

    function paint() {
      const c = canvasEl();
      if (!c) return;
      const parts = [];
      const row = CVD[fst.mode];
      if (row && row[1]) parts.push(row[1]);
      else if (row && row[2]) parts.push('url(#dk-cvd-' + fst.mode + ')');
      const k = Math.max(0, Math.min(100, Number(fst.clarity) || 0)) / 100;
      // Saturation and contrast only, both gentle at the top end: pushed harder
      // the water turns to poster paint and the ripple is lost in the banding.
      if (k > 0) parts.push('saturate(' + (1 + k * 1.1).toFixed(2) + ') contrast(' + (1 + k * 0.45).toFixed(2) + ')');
      c.style.filter = parts.join(' ');
      // The filter is the only thing this module ever sets on the game.
      c.dataset.dkFish = parts.length ? '1' : '';
    }

    /* The same two settings live on the fishing page and in the hub. Whichever
       one you move, the other follows, so the two can never disagree. */
    let pageCtl = null, hubCtl = null;
    function syncControls() {
      for (const c of [pageCtl, hubCtl]) {
        if (!c || !c.mode.isConnected) continue;
        c.mode.value = fst.mode;
        c.clarity.value = String(fst.clarity || 0);
        if (c.out) c.out.textContent = (fst.clarity || 0) + '%';
      }
    }

    function buildPanel() {
      const wrap = h('section', { id: 'dk-fish', 'aria-label': 'Fishing, made readable' });
      const modeSel = h('select', { 'aria-label': 'Colour vision' },
        ...Object.entries(CVD).map(([v, row]) => h('option', { value: v, text: row[0], selected: fst.mode === v })));
      modeSel.addEventListener('change', () => { fst.mode = modeSel.value; save('fish', fst); paint(); syncControls(); });

      const clarity = h('input', {
        type: 'range', min: '0', max: '100', step: '5', value: String(fst.clarity || 0),
        'aria-label': 'Clarity'
      });
      const out = h('span', { class: 'dk-fish-val', text: (fst.clarity || 0) + '%' });
      clarity.addEventListener('input', () => {
        fst.clarity = Number(clarity.value);
        paint();
        syncControls();
      });
      clarity.addEventListener('change', () => save('fish', fst));
      pageCtl = { mode: modeSel, clarity, out };

      wrap.append(
        h('div', { class: 'dk-fish-row' },
          h('label', { text: 'Colour vision' }), modeSel),
        h('div', { class: 'dk-fish-row' },
          h('label', { text: 'Clarity' }), clarity, out),
        h('div', { class: 'dk-fish-note', text:
          'Moves the red marker away from the green bar, and lifts the whole picture so the ripple reads against the water. Twill only restyles the canvas: it never reads it, and never points anything out.' })
      );
      return wrap;
    }

    function start() {
      if (currentPage().kind !== 'fishing' || panel) return;
      const host = document.querySelector('#fishingContainer');
      if (!host) return;
      ensureFilters();
      if (!styleEl) styleEl = h('style', {}, `
        #dk-fish {
          margin: 10px 0 14px; padding: 9px 12px 10px;
          background: var(--dk-panel); color: var(--dk-text);
          border: 1px solid var(--dk-line); border-radius: var(--dk-radius);
          font: 12px/1.5 var(--dk-body-font); text-align: left; max-width: 825px;
        }
        #dk-fish * { box-sizing: border-box; }
        .dk-fish-row { display: flex; align-items: center; gap: 9px; margin-bottom: 6px; }
        .dk-fish-row label {
          flex: none; width: 92px; margin: 0; color: var(--dk-muted);
          font: 600 10px/1.6 var(--dk-body-font); text-transform: uppercase; letter-spacing: .07em;
        }
        #dk-fish select {
          flex: 1; max-width: 280px; height: auto; margin: 0; padding: 4px 7px;
          font: 12px/1.4 var(--dk-body-font); color: var(--dk-text);
          background: var(--dk-surface); border: 1px solid var(--dk-line);
          border-radius: var(--dk-radius); box-shadow: none; outline: 0;
        }
        #dk-fish input[type=range] { flex: 1; max-width: 240px; margin: 0; accent-color: var(--dk-accent); }
        .dk-fish-val { flex: none; width: 38px; color: var(--dk-muted); font-size: 11px; }
        .dk-fish-note { color: var(--dk-muted); font-size: 11px; margin-top: 4px; }
      `);
      if (!styleEl.isConnected) document.head.appendChild(styleEl);
      panel = buildPanel();
      host.parentNode.insertBefore(panel, host);
      paint();
      // The game builds its canvas after the page settles, so the filter is
      // re-applied when it appears rather than assumed to be there already.
      waitForCanvas();
    }

    let watcher = null;
    function waitForCanvas() {
      if (canvasEl()) return;
      if (watcher) watcher.disconnect();
      watcher = new MutationObserver(() => {
        if (!canvasEl()) return;
        paint();
        watcher.disconnect();
        watcher = null;
      });
      const host = document.querySelector('#fishingContainer');
      if (host) watcher.observe(host, { childList: true, subtree: true });
    }

    function stop() {
      if (watcher) { watcher.disconnect(); watcher = null; }
      const c = canvasEl();
      if (c) { c.style.filter = ''; delete c.dataset.dkFish; }
      if (panel) panel.remove();
      panel = null;
      if (svg) svg.remove();
      svg = null;
      if (styleEl) styleEl.remove();
    }

    function settings(box) {
      box.append(h('div', { class: 'dk-note', style: 'margin-top:0', text:
        'Fishing colours are now given an upgrade for those with red-blind or green-blind colour vision, or those who may struggle to see the ripple during fishing. Twill does not point to the fish, but merely acts as a coloured pane put over the browser to add a little more contrast.' }));

      box.append(h('div', { class: 'dk-lb', text: 'Colour vision' }));
      const sel = h('select', { 'aria-label': 'Colour vision',
        onchange: (e) => { fst.mode = e.target.value; save('fish', fst); paint(); syncControls(); } },
        ...Object.entries(CVD).map(([v, row]) => h('option', { value: v, text: row[0], selected: fst.mode === v })));
      box.append(sel);
      box.append(h('div', { class: 'dk-note', style: 'margin-top:5px', text:
        'Each one was picked by measuring: how far apart the red marker and the green bar end up, as a red-blind or green-blind eye would see them, compared with no filter. Marker to blue wins on the numbers and looks the strangest; Swap red and blue helps least but leaves the scenery green. Which is actually comfortable is yours to judge.' }));
      for (const [, row] of Object.entries(CVD)) {
        if (!row[3]) continue;
        box.append(h('div', { class: 'dk-gene-key' },
          h('span', { text: row[0] }), h('em', { text: row[3] })));
      }

      box.append(h('div', { class: 'dk-lb', text: 'Clarity' }));
      const rng = h('input', { type: 'range', min: '0', max: '100', step: '5',
        value: String(fst.clarity || 0), 'aria-label': 'Clarity' });
      rng.addEventListener('input', () => { fst.clarity = Number(rng.value); paint(); syncControls(); });
      rng.addEventListener('change', () => save('fish', fst));
      box.append(rng);
      hubCtl = { mode: sel, clarity: rng };
      box.append(h('div', { class: 'dk-note', style: 'margin-top:5px', text:
        'Saturation and contrast over the whole picture, which is what makes the ripple stand off the water. It lifts everything equally and finds nothing, so it is a brighter window on the same game.' }));

      box.append(h('div', { class: 'dk-lb', text: 'What it will not do' }));
      box.append(h('div', { class: 'dk-note', style: 'margin-top:0', text:
        'It never reads the canvas, never clicks, and never marks where a ripple is. Spotting the ripple and timing the release stay yours; this only makes them possible to see.' }));
    }

    return {
      id: 'fishing', name: 'Fishing colours', blurb: 'Makes the red, green and ripples readable',
      start, stop, reload: reloadFish, settings
    };
  })());

  // ==================================================================== data

  // Glyph's recipe catalogue. Regenerate with: python tools/export_recipes.py
  /* @recipes-begin: generated by tools/export_recipes.py, do not edit by hand */
  const RECIPE_BOOK = {"exported":"2026-09-22","known":284,"wiki":"https://grousehouse.wiki/Crafting_and_Recipes","recipes":[{"k":"Abandonedden","n":"Abandoned Den","t":"background","i":[["Large Rock",10],["Remnant: Bone",10]],"s":["Drops rarely out exploring, from encounters that give bones."]},{"k":"Acornbundledecor","n":"Acorn Bundle Decor","t":"scenery","i":[["Remnant: Acorn",5]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Angeloak","n":"Angel Oak","t":"background","i":[["Remnant: Acorn",6]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Arcticdrabaandamethystfields","n":"Arctic Draba and Amethyst Fields","t":"background","i":[["Flower: Arctic Draba",10],["Gem: Amethyst",10],["Large Leaf",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Arizonawhiteoaksapling","n":"Arizona White Oak Sapling","t":"foliage","i":[["Remnant: Acorn",6]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Arnicaflowerdecor","n":"Arnica Flower Decor","t":"trinket","i":[["Arnica",5]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Arnicameadow","n":"Arnica Meadow","t":"background","i":[["Arnica",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Azurehoodedjay","n":"Azure-Hooded Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Backgroundrocksbrown","n":"Background Rocks [Brown]","t":"scenery","i":[["Large Rock",15]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Backgroundrocksgray","n":"Background Rocks [Gray]","t":"scenery","i":[["Large Rock",15]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Baseapplicatorbadger","n":"Base Applicator [Badger]","t":"applicator","i":[["Mustelid Claws",15],["Mustelid Fangs",15],["Remnant: Badger Pelt",3],["Remnant: Badger Skull",1],["Remnant: Bone",20]],"s":["Drops rarely as a trophy, from seeing off any Badger enemy."]},{"k":"Baseapplicatorcaribou","n":"Base Applicator [Caribou]","t":"applicator","i":[["Broken Antler",10],["Butterfly Wing",30],["Remnant: Caribou Antlers",5],["Remnant: Caribou Calf Carcass",2],["Remnant: Gnawing Hoof",15],["Thick Fur Tuft",15]],"s":["Drops rarely as a trophy, from seeing off any Caribou enemy."]},{"k":"Baseapplicatorfossil","n":"Base Applicator [Fossil]","t":"applicator","i":[["Boneset",10],["Fossilized Bone Dust",50],["Large Rock",10],["Odd Teeth",4],["Remnant: Bone",20],["Remnant: Rattling Spine",2]],"s":["Drops occasionally when you choose to investigate the strange markings during the September event."]},{"k":"Baseapplicatorfox","n":"Base Applicator [Fox]","t":"applicator","i":[["Canine Claw",20],["Canine Fang",20],["Remnant: Fox Pelt [Red]",5],["Remnant: Fox Skull",1],["Remnant: Fox Tail [Red]",10]],"s":["Drops rarely as a trophy, from seeing off any Fox enemy."]},{"k":"Baseapplicatorlynx","n":"Base Applicator [Lynx]","t":"applicator","i":[["Charcoal",20],["Remnant: Lynx Pelt",1],["Remnant: Lynx Skull",2],["Remnant: Lynx Tail",2],["Remnant: Massive Pinecone",10],["Remnant: Rattling Spine",10],["Thick Fur Tuft",20]],"s":["Drops rarely as a trophy, from seeing off any Lynx enemy."]},{"k":"Baseapplicatornarwhal","n":"Base Applicator [Narwhal]","t":"applicator","i":[["Remnant: Blubber",1],["Remnant: Bone",50],["Remnant: Narwhal Tooth",2],["Remnant: Rugged Flipper",1],["Remnant: Whale Rib Bone",30]],"s":["Drops rarely as a trophy, from seeing off any Narwhal enemy."]},{"k":"Baseapplicatorskull","n":"Base Applicator [Skull]","t":"applicator","i":[["Aloe",15],["Remnant: Delicate Meat",10],["Remnant: Wolf Pelt [Brown]",1],["Remnant: Wolf Pelt [Red]",2],["Remnant: Wolf Skull",15],["Remnant: Wolf Tail",1]],"s":["Drops rarely as a trophy, from seeing off any Wolf Pack enemy."]},{"k":"Bearpawpeltblack","n":"Bear Paw Pelt [Black]","t":"ornament","i":[["Bear Fangs",2],["Dandelion",10],["Large Branch",5],["Remnant: Bear Paw [Black]",3],["Remnant: Bear Pelt [Black]",1]],"s":["Drops rarely as a trophy, from seeing off any Black Bear enemy."]},{"k":"Bearpawpeltbrown","n":"Bear Paw Pelt [Brown]","t":"ornament","i":[["Bear Fangs",2],["Dandelion",10],["Large Branch",5],["Remnant: Bear Paw [Brown]",3],["Remnant: Bear Pelt [Brown]",1]],"s":["Drops rarely as a trophy, from seeing off any Brown Bear enemy."]},{"k":"Bearpawpeltcinnamon","n":"Bear Paw Pelt [Cinnamon]","t":"ornament","i":[["Bear Fangs",2],["Dandelion",10],["Large Branch",5],["Remnant: Bear Paw [Cinnamon]",3],["Remnant: Bear Pelt [Cinnamon]",1]],"s":["Drops rarely as a trophy, from seeing off any Cinnamon Bear enemy."]},{"k":"Bearpawpeltgrizzly","n":"Bear Paw Pelt [Grizzly]","t":"ornament","i":[["Bear Fangs",2],["Dandelion",10],["Large Branch",5],["Remnant: Bear Paw [Grizzly]",3],["Remnant: Bear Pelt [Grizzly]",1]],"s":["Drops rarely as a trophy, from seeing off any Grizzly Bear enemy."]},{"k":"Bearpawpeltkermode","n":"Bear Paw Pelt [Kermode]","t":"ornament","i":[["Bear Fangs",2],["Dandelion",10],["Large Branch",5],["Remnant: Bear Paw [Kermode]",3],["Remnant: Bear Pelt [Kermode]",1]],"s":["Drops rarely as a trophy, from seeing off any Kermode Bear enemy."]},{"k":"Bearpawpeltpolar","n":"Bear Paw Pelt [Polar]","t":"ornament","i":[["Bear Fangs",2],["Dandelion",10],["Large Branch",5],["Remnant: Bear Paw [Polar]",3],["Remnant: Bear Pelt [Polar]",1]],"s":["Drops rarely as a trophy, from seeing off any Polar Bear enemy."]},{"k":"Bearpawpeltspectacled","n":"Bear Paw Pelt [Spectacled]","t":"ornament","i":[["Bear Fangs",2],["Dandelion",10],["Large Branch",5],["Remnant: Bear Paw [Spectacled]",3],["Remnant: Bear Pelt [Spectacled]",1]],"s":["Drops rarely as a trophy, from seeing off any Spectacled Bear enemy."]},{"k":"Bearberryherbcrown","n":"Bearberry Herb Crown","t":"ornament","i":[["Bearberry",5],["Remnant: Parrot Feather",5]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Bigcatclawnecklace","n":"Big Cat Claw Necklace","t":"ornament","i":[["Remnant: Big Cat Claw",5],["Remnant: Cougar Tail",5],["Yarrow",5]],"s":["Drops rarely as a trophy, from seeing off any Cougar or Jaguar enemy."]},{"k":"Birdsnestbranch","n":"Bird's Nest [Branch]","t":"foliage","i":[["Remnant: Acorn",2],["Remnant: Blue Jay Feather",5],["Remnant: Owl Feather",5],["Remnant: Puffin Feather",3],["Remnant: Roadrunner Feather",3]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Birdsnestbush","n":"Bird's Nest [Bush]","t":"foliage","i":[["Large Leaf",4],["Remnant: Blue Jay Feather",5],["Remnant: Duck Feather",5],["Remnant: Peregrine Falcon Feather",3],["Remnant: Skua Feather",3]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Birdsnesttree","n":"Bird's Nest [Tree]","t":"scenery","i":[["Large Branch",4],["Remnant: Blue Jay Feather",5],["Remnant: Grouse Feather",5],["Remnant: Owl Feather",3],["Remnant: Swan Feather",3]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Blackthroatedmagpiejay","n":"Black-Throated Magpie-Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Blindedsphinx","n":"Blinded Sphinx","t":"animal","i":[["Butterfly Wing",5],["Banded Sphinx Moth",5]],"s":["Drops rarely when you choose to chomp or watch the Butterfly."]},{"k":"Bloominggarlic","n":"Blooming Garlic","t":"background","i":[["Garlic",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Blossomingguaiactree","n":"Blossoming Guaiac Tree","t":"background","i":[["Guaiacum",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Bluejayfeatherdecor","n":"Blue Jay Feather Decor","t":"trinket","i":[["Remnant: Blue Jay Feather",30]],"s":["Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to take the Blue Jay feather."]},{"k":"Bluelunarbacklinefluffbody","n":"Blue Lunar Backline Fluff [Body]","t":"lunar","i":[["Charged Core",1],["Charged Eyeball",2],["Essence-Covered Fur Clump",10],["Glowing Spores",15]],"s":["Drops rarely as a trophy, from seeing off any Charged enemy in the Dreamlands."]},{"k":"Bluelunarbacklinefluffhead","n":"Blue Lunar Backline Fluff [Head]","t":"lunar","i":[["Charged Core",1],["Charged Eyeball",2],["Essence-Covered Fur Clump",10],["Glowing Spores",15]],"s":["Drops rarely as a trophy, from seeing off any Charged enemy in the Dreamlands."]},{"k":"Bluelunarbacklineflufftail","n":"Blue Lunar Backline Fluff [Tail]","t":"lunar","i":[["Charged Core",1],["Charged Eyeball",2],["Essence-Covered Fur Clump",10],["Glowing Spores",15]],"s":["Drops rarely as a trophy, from seeing off any Charged enemy in the Dreamlands."]},{"k":"Bonedecor","n":"Bone Decor","t":"trinket","i":[["Remnant: Bone",5]],"s":["Drops rarely out exploring, from encounters that give bones."]},{"k":"Brokenantlerdecor","n":"Broken Antler Decor","t":"trinket","i":[["Broken Antler",5]],"s":["Drops rarely as a trophy, from seeing off any enemy."],"x":"Excludes Cataclysms event enemies"},{"k":"Brownlongtail","n":"Brown Longtail","t":"animal","i":[["Butterfly Wing",5],["Banded Sphinx Moth",5]],"s":["Drops rarely when you choose to chomp or watch the Butterfly."]},{"k":"Burningbushcrown","n":"Burning Bush Crown","t":"ornament","i":[["Burning Bush",5],["Remnant: Toucan Feather",5]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Burningbushtree","n":"Burning Bush Tree","t":"background","i":[["Burning Bush",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Burrowsamongtheroots","n":"Burrows Among the Roots","t":"background","i":[["Large Branch",15],["Large Leaf",15],["Large Rock",15]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Bushycrestedjay","n":"Bushy-Crested Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Californiascrubjay","n":"California Scrub Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Caninefangnecklace","n":"Canine Fang Necklace","t":"ornament","i":[["Canine Fang",5],["Remnant: Ibis Feather",5]],"s":["Drops rarely as a trophy, from seeing off any Coyote enemy.","Drops occasionally when you choose to interrupt the Wolf and Coyote Pair during the February event."]},{"k":"Canyonrubyspot","n":"Canyon Rubyspot","t":"animal","i":[["Butterfly Wing",5],["Ebony Jewelwing",5]],"s":["Drops rarely when you choose to chomp or watch the Butterfly."]},{"k":"Carrionflowerherbcrown","n":"Carrionflower Herb Crown","t":"ornament","i":[["Carrionflower",5],["Remnant: Duck Feather",5]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Cedarbarkcrown","n":"Cedar Bark Crown","t":"ornament","i":[["Cedar Bark",5],["Remnant: Roadrunner Feather",5]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Cedartrees","n":"Cedar Trees","t":"background","i":[["Cedar Bark",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Chaparralherbcrown","n":"Chaparral Herb Crown","t":"ornament","i":[["Chaparral",5],["Remnant: Gull Feather",5]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Chargedeyes","n":"Charged Eyes","t":"lunar","i":[["Charged Eyeball",2],["Glowing Spores",20]],"s":["Drops now and then when you choose to offer acorns to one of: Crested Lunar Chipmunk, Lunar Amphiuma, Resting Lunar Petrel, Stalking Lunar Oncilla, Striped Lunar Chipmunk, Spotted Lunar Chipmunk in the Dreamlands."]},{"k":"Chargedparticles","n":"Charged Particles","t":"lunar","i":[["Charged Eyeball",5],["Essence-Covered Egg",1],["Glowing Spores",10]],"s":["Drops rarely as a trophy, from seeing off any Charged enemy in the Dreamlands."]},{"k":"Chargedthrowingball","n":"Charged Throwing Ball","t":"lunar","i":[["Charged Core",1],["Charged Eyeball",2],["Flickering Flower",5],["Remnant: Hiker's Rope",2]],"s":["Drops now and then when you choose to give Delicate Meat to the Toy Trader in the Dreamlands."]},{"k":"Chatteringparakeets","n":"Chattering Parakeets","t":"background","i":[["Large Branch",20],["Remnant: Parrot Feather",20]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Chillingbluejays","n":"Chilling Blue Jays","t":"background","i":[["Large Branch",20],["Remnant: Blue Jay Feather",20]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Cnitharianfrillaccents","n":"Cnitharian Frill Accents","t":"lunar","i":[["Aloe",5],["Charcoal",5],["Glowing Spores",20],["Growth Root",3],["Remnant: Essence-Covered Feather",5]],"s":["Drops now and then when you choose to say hello to the Cnitharian Pair in the Dreamlands."]},{"k":"Cnitharianfrillaccentspurple","n":"Cnitharian Frill Accents [Purple]","t":"lunar","i":[["Aloe",5],["Charcoal",5],["Glowing Spores",20],["Growth Root",3],["Remnant: Essence-Covered Feather",5]],"s":["Drops now and then when you choose to say hello to the Cnitharian Pair in the Dreamlands."]},{"k":"Cnithariantuggytendriltoy","n":"Cnitharian Tuggy Tendril Toy","t":"lunar","i":[["Remnant: Cnitharian Tuggy Tendril",3],["Remnant: Essence-Covered Feather",5],["Remnant: Whale Rib Bone",4]],"s":["Drops now and then when you choose to give Delicate Meat to the Toy Trader in the Dreamlands."]},{"k":"Coldcave","n":"Cold Cave","t":"background","i":[["Large Rock",30]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Cozyden","n":"Cozy Den","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Cozynest","n":"Cozy Nest","t":"lunar","i":[["Large Branch",15],["Remnant: Essence-Covered Feather",15],["Turmeric",5]],"s":["Drops now and then when you choose to offer acorns to one of: Crested Lunar Chipmunk, Lunar Amphiuma, Resting Lunar Petrel, Stalking Lunar Oncilla, Striped Lunar Chipmunk, Spotted Lunar Chipmunk in the Dreamlands."]},{"k":"Dandeliondecor","n":"Dandelion Decor","t":"foliage","i":[["Dandelion",10]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Deerearaccessory","n":"Deer Ear Accessory","t":"ornament","i":[["Deer Ear",5]],"s":["Drops rarely as a trophy, from seeing off any enemy."],"x":"Excludes Cataclysms enemies"},{"k":"Denofpelts","n":"Den of Pelts","t":"background","i":[["Remnant: Coyote Pelt",5],["Remnant: Wolf Pelt [Brown]",5],["Remnant: Wolf Pelt [Red]",5]],"s":["Drops rarely as a trophy, from seeing off any enemy."],"x":"Excludes Cataclysms enemies"},{"k":"Deserttraveler","n":"Desert Traveler","t":"background","i":[["Large Rock",10],["Remnant: Tortoise Shell",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Desolatecave","n":"Desolate Cave","t":"background","i":[["Large Rock",30]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Dianafritillary","n":"Diana Fritillary","t":"animal","i":[["Butterfly Wing",5],["Regal Fritillary",5]],"s":["Drops rarely when you choose to chomp or watch the Butterfly."]},{"k":"Dwarfjay","n":"Dwarf Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Elkbullmask","n":"Elk Bull Mask","t":"ornament","i":[["Elk Ear",4],["Remnant: Elk Antlers",6]],"s":["Drops rarely as a trophy, from seeing off any Elk enemy."]},{"k":"Elkbullmaskmelanistic","n":"Elk Bull Mask [Melanistic]","t":"ornament","i":[["Charcoal",10],["Elk Ear",4],["Remnant: Elk Antlers",6]],"s":["Drops rarely as a trophy, from seeing off any Elk enemy."]},{"k":"Elkcowmask","n":"Elk Cow Mask","t":"ornament","i":[["Elk Ear",4],["Remnant: Elk Antlers",6]],"s":["Drops rarely as a trophy, from seeing off any Elk enemy."]},{"k":"Elkcowmaskmelanistic","n":"Elk Cow Mask [Melanistic]","t":"ornament","i":[["Charcoal",10],["Elk Ear",4],["Remnant: Elk Antlers",6]],"s":["Drops rarely as a trophy, from seeing off any Elk enemy."]},{"k":"Elkearaccessory","n":"Elk Ear Accessory","t":"ornament","i":[["Elk Ear",5]],"s":["Drops rarely as a trophy, from seeing off any enemy."],"x":"Excludes Cataclysms enemies"},{"k":"Eternalslumber","n":"Eternal Slumber","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Remnant: Elk Antlers",2]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Eyeapplicatorbone","n":"Eye Applicator [Bone]","t":"applicator","i":[["Glowing Spores",15],["Remnant: Bone",50],["Winterfat",5]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Eyeapplicatorcarapace","n":"Eye Applicator [Carapace]","t":"applicator","i":[["Charcoal",10],["Glowing Spores",15],["Remnant: Tortoise Shell",30]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Eyeapplicatorcetacean","n":"Eye Applicator [Cetacean]","t":"applicator","i":[["Charcoal",10],["Glowing Spores",15],["Remnant: Walrus Tusk",5],["Remnant: Whale Rib Bone",15]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Eyeapplicatorcrotalus","n":"Eye Applicator [Crotalus]","t":"applicator","i":[["Chaparral",5],["Glowing Spores",15],["Remnant: Rattle",30],["Remnant: Rattlesnake Skull",5]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Eyeapplicatorfox","n":"Eye Applicator [Fox]","t":"applicator","i":[["Canine Claw",10],["Canine Fang",10],["Remnant: Fox Pelt [Gray]",3],["Remnant: Fox Skull",2],["Remnant: Fox Tail [Gray]",5]],"s":["Drops rarely as a trophy, from seeing off any Fox enemy."]},{"k":"Eyeapplicatorpuma","n":"Eye Applicator [Puma]","t":"applicator","i":[["Dandelion",5],["Glowing Spores",15],["Remnant: Cougar Skull",15],["Remnant: Cougar Tail",10]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Eyeapplicatorrangifer","n":"Eye Applicator [Rangifer]","t":"applicator","i":[["Broken Antler",10],["Butterfly Wing",30],["Remnant: Caribou Antlers",2],["Remnant: Caribou Calf Carcass",1],["Remnant: Gnawing Hoof",10],["Thick Fur Tuft",5]],"s":["Drops rarely as a trophy, from seeing off any Caribou enemy."]},{"k":"Eyeapplicatorscallop","n":"Eye Applicator [Scallop]","t":"applicator","i":[["Aloe",10],["Glowing Spores",15],["Remnant: Mollusk Shell",30]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Eyeapplicatoryagou","n":"Eye Applicator [Yagou]","t":"applicator","i":[["Glowing Spores",15],["Remnant: Jaguarundi Skull",5],["Remnant: Jaguarundi Tail",10],["Yarrow",10]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Falconsnest","n":"Falcon's Nest","t":"background","i":[["Large Rock",20],["Remnant: Peregrine Falcon Feather",20]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Fallentree","n":"Fallen Tree","t":"background","i":[["Large Branch",30]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Fallentreeden","n":"Fallen Tree Den","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Fieldsoftansy","n":"Fields of Tansy","t":"background","i":[["Tansy",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Fieryskipper","n":"Fiery Skipper","t":"animal","i":[["Butterfly Wing",5],["Spicebush Swallowtail",5]],"s":["Drops rarely when you choose to chomp or watch the Butterfly."]},{"k":"Fireweedandmoonstonecliffs","n":"Fireweed and Moonstone Cliffs","t":"background","i":[["Flower: Fireweed",10],["Gem: Moonstone",10],["Large Rock",10]],"s":["Drops occasionally when you choose to admire the Courting Birds during the February event."]},{"k":"Flickeringmeadow","n":"Flickering Meadow","t":"lunar","i":[["Dandelion",10],["Flickering Flower",15],["Large Leaf",15]],"s":["Drops now and then when you choose to offer acorns to one of: Crested Lunar Chipmunk, Lunar Amphiuma, Resting Lunar Petrel, Stalking Lunar Oncilla, Striped Lunar Chipmunk, Spotted Lunar Chipmunk in the Dreamlands."]},{"k":"Floridascrubjay","n":"Florida Scrub Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Foregroundrocksbrown","n":"Foreground Rocks [Brown]","t":"scenery","i":[["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Foregroundrocksgray","n":"Foreground Rocks [Gray]","t":"scenery","i":[["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Forestdwelling","n":"Forest Dwelling","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Frozenpearlfetch","n":"Frozen Pearl Fetch","t":"lunar","i":[["Flickering Flower",10],["Frozen Pearl",2],["Lunar Oil",2],["Remnant: Bone",10]],"s":["Drops now and then when you choose to give Delicate Meat to the Toy Trader in the Dreamlands."]},{"k":"Gambeloaksapling","n":"Gambel Oak Sapling","t":"foliage","i":[["Remnant: Acorn",6]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Gatheringlunarbutterflies","n":"Gathering Lunar Butterflies","t":"lunar","i":[["Butterfly Wing",15],["Large Leaf",15],["St. John's Wort",5]],"s":["Drops now and then when you choose to offer acorns to one of: Crested Lunar Chipmunk, Lunar Amphiuma, Resting Lunar Petrel, Stalking Lunar Oncilla, Striped Lunar Chipmunk, Spotted Lunar Chipmunk in the Dreamlands."]},{"k":"Gemcave","n":"Gem Cave","t":"lunar","i":[["Charged Core",1],["Glowing Spores",10],["Large Rock",15]],"s":["Drops now and then when you choose to offer acorns to one of: Crested Lunar Chipmunk, Lunar Amphiuma, Resting Lunar Petrel, Stalking Lunar Oncilla, Striped Lunar Chipmunk, Spotted Lunar Chipmunk in the Dreamlands."]},{"k":"Giantswallowtail","n":"Giant Swallowtail","t":"animal","i":[["Butterfly Wing",5],["Cliff Swallowtail",5]],"s":["Drops rarely when you choose to chomp or watch the Butterfly."]},{"k":"Gnawinghooftrinket","n":"Gnawing Hoof Trinket","t":"trinket","i":[["Remnant: Gnawing Hoof",5]],"s":["Drops rarely as a trophy, from seeing off any Deer enemy."]},{"k":"Goldensealaccent","n":"Goldenseal Accent","t":"ornament","i":[["Goldenseal",10]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Greenjay","n":"Green Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Greenmeadow","n":"Green Meadow","t":"background","i":[["St. John's Wort",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Grousefeatherdecor","n":"Grouse Feather Decor","t":"trinket","i":[["Remnant: Grouse Feather",30]],"s":["Drops rarely when you choose to take a chance on the Greater Sage-Grouse.","Drops rarely when you choose to watch the Sharp-Tailed Grouse."]},{"k":"Growthroottreat","n":"Growth Root Treat","t":"lunar","i":[["Growth Root",3],["Remnant: Growth Chunk",2],["Remnant: Muskrat Carcass",10]],"s":["Drops now and then when you choose to give Delicate Meat to the Toy Trader in the Dreamlands."]},{"k":"Guaiacumcrown","n":"Guaiacum Crown","t":"ornament","i":[["Guaiacum",10]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Gulffritillary","n":"Gulf Fritillary","t":"animal","i":[["Butterfly Wing",5],["Baltimore Checkerspot",5]],"s":["Drops rarely when you choose to chomp or watch the Butterfly."]},{"k":"Gunnisonsagegrousefeatherfemale","n":"Gunnison Sage-Grouse Feather [Female]","t":"ornament","i":[["Remnant: Grouse Feather",30]],"s":["Drops rarely when you choose to take a chance on the Greater Sage-Grouse.","Drops rarely when you choose to watch the Sharp-Tailed Grouse."]},{"k":"Gunnisonsagegrousefeathermale","n":"Gunnison Sage-Grouse Feather [Male]","t":"ornament","i":[["Remnant: Grouse Feather",30]],"s":["Drops rarely when you choose to take a chance on the Greater Sage-Grouse.","Drops rarely when you choose to watch the Sharp-Tailed Grouse."]},{"k":"Gypsumcrystalcave","n":"Gypsum Crystal Cave","t":"background","i":[["Charcoal",5],["Gem: Diamond",5],["Gem: Emerald",5],["Gem: Opal",5],["Gem: Ruby",5],["Remnant: Growth Chunk",2]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Gyrfalconobserver","n":"Gyrfalcon Observer","t":"background","i":[["Remnant: Gyrfalcon Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Hollowtreeden","n":"Hollow Tree Den","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Huntingbarnowl","n":"Hunting Barn Owl","t":"background","i":[["Large Leaf",20],["Remnant: Owl Feather",20]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Islandscrubjay","n":"Island Scrub Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Largebranchdecor","n":"Large Branch Decor","t":"scenery","i":[["Large Branch",15]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Largerocksdecor","n":"Large Rocks Decor","t":"scenery","i":[["Large Rock",15]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Leatherstrapsarcticdrabahead","n":"Leather Straps - Arctic Draba [Head]","t":"ornament","i":[["Flower: Arctic Draba",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsarcticdrabalegs","n":"Leather Straps - Arctic Draba [Legs]","t":"ornament","i":[["Flower: Arctic Draba",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsarcticdrabaneck","n":"Leather Straps - Arctic Draba [Neck]","t":"ornament","i":[["Flower: Arctic Draba",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsfireweedhead","n":"Leather Straps - Fireweed [Head]","t":"ornament","i":[["Flower: Fireweed",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsfireweedlegs","n":"Leather Straps - Fireweed [Legs]","t":"ornament","i":[["Flower: Fireweed",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsfireweedneck","n":"Leather Straps - Fireweed [Neck]","t":"ornament","i":[["Flower: Fireweed",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsgoldenpoppyhead","n":"Leather Straps - Golden Poppy [Head]","t":"ornament","i":[["Flower: Golden Poppy",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsgoldenpoppylegs","n":"Leather Straps - Golden Poppy [Legs]","t":"ornament","i":[["Flower: Golden Poppy",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsgoldenpoppyneck","n":"Leather Straps - Golden Poppy [Neck]","t":"ornament","i":[["Flower: Golden Poppy",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsmossysaxifragehead","n":"Leather Straps - Mossy Saxifrage [Head]","t":"ornament","i":[["Flower: Mossy Saxifrage",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsmossysaxifragelegs","n":"Leather Straps - Mossy Saxifrage [Legs]","t":"ornament","i":[["Flower: Mossy Saxifrage",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsmossysaxifrageneck","n":"Leather Straps - Mossy Saxifrage [Neck]","t":"ornament","i":[["Flower: Mossy Saxifrage",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapspelicanflowerhead","n":"Leather Straps - Pelican Flower [Head]","t":"ornament","i":[["Flower: Pelican Flower",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapspelicanflowerlegs","n":"Leather Straps - Pelican Flower [Legs]","t":"ornament","i":[["Flower: Pelican Flower",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapspelicanflowerneck","n":"Leather Straps - Pelican Flower [Neck]","t":"ornament","i":[["Flower: Pelican Flower",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsphantomorchidhead","n":"Leather Straps - Phantom Orchid [Head]","t":"ornament","i":[["Flower: Phantom Orchid",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsphantomorchidlegs","n":"Leather Straps - Phantom Orchid [Legs]","t":"ornament","i":[["Flower: Phantom Orchid",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsphantomorchidneck","n":"Leather Straps - Phantom Orchid [Neck]","t":"ornament","i":[["Flower: Phantom Orchid",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapspurpleconeflowerhead","n":"Leather Straps - Purple Coneflower [Head]","t":"ornament","i":[["Flower: Purple Coneflower",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapspurpleconeflowerlegs","n":"Leather Straps - Purple Coneflower [Legs]","t":"ornament","i":[["Flower: Purple Coneflower",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapspurpleconeflowerneck","n":"Leather Straps - Purple Coneflower [Neck]","t":"ornament","i":[["Flower: Purple Coneflower",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsscarletladiestresseshead","n":"Leather Straps - Scarlet Ladies' Tresses [Head]","t":"ornament","i":[["Flower: Scarlet Ladies' Tresses",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsscarletladiestresseslegs","n":"Leather Straps - Scarlet Ladies' Tresses [Legs]","t":"ornament","i":[["Flower: Scarlet Ladies' Tresses",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsscarletladiestressesneck","n":"Leather Straps - Scarlet Ladies' Tresses [Neck]","t":"ornament","i":[["Flower: Scarlet Ladies' Tresses",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapssiskiyouirishead","n":"Leather Straps - Siskiyou Iris [Head]","t":"ornament","i":[["Flower: Siskiyou Iris",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapssiskiyouirislegs","n":"Leather Straps - Siskiyou Iris [Legs]","t":"ornament","i":[["Flower: Siskiyou Iris",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapssiskiyouirisneck","n":"Leather Straps - Siskiyou Iris [Neck]","t":"ornament","i":[["Flower: Siskiyou Iris",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapssnakemouthorchidhead","n":"Leather Straps - Snakemouth Orchid [Head]","t":"ornament","i":[["Flower: Snakemouth Orchid",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapssnakemouthorchidlegs","n":"Leather Straps - Snakemouth Orchid [Legs]","t":"ornament","i":[["Flower: Snakemouth Orchid",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapssnakemouthorchidneck","n":"Leather Straps - Snakemouth Orchid [Neck]","t":"ornament","i":[["Flower: Snakemouth Orchid",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapstularelavenderirishead","n":"Leather Straps - Tulare Lavender Iris [Head]","t":"ornament","i":[["Flower: Tulare Lavender Iris",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapstularelavenderirislegs","n":"Leather Straps - Tulare Lavender Iris [Legs]","t":"ornament","i":[["Flower: Tulare Lavender Iris",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapstularelavenderirisneck","n":"Leather Straps - Tulare Lavender Iris [Neck]","t":"ornament","i":[["Flower: Tulare Lavender Iris",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsvirginiabluebellshead","n":"Leather Straps - Virgina Bluebells [Head]","t":"ornament","i":[["Flower: Virginia Bluebells",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsvirginiabluebellslegs","n":"Leather Straps - Virgina Bluebells [Legs]","t":"ornament","i":[["Flower: Virginia Bluebells",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leatherstrapsvirginiabluebellsneck","n":"Leather Straps - Virgina Bluebells [Neck]","t":"ornament","i":[["Flower: Virginia Bluebells",7],["Remnant: Bone",5],["Charcoal",2]],"s":["Drops rarely out exploring during the February event, from Flower and Gem encounters."]},{"k":"Leftoverbones","n":"Leftover Bones","t":"background","i":[["Remnant: Bone",30]],"s":["Drops rarely out exploring, from encounters that give bones."]},{"k":"Lunarbutterflies","n":"Lunar Butterflies","t":"lunar","i":[["Butterfly Wing",20],["Glowing Spores",10]],"s":["Drops now and then when you choose to offer acorns to one of: Crested Lunar Chipmunk, Lunar Amphiuma, Resting Lunar Petrel, Stalking Lunar Oncilla, Striped Lunar Chipmunk, Spotted Lunar Chipmunk in the Dreamlands."]},{"k":"Lunarbutterflyden","n":"Lunar Butterfly Den","t":"lunar","i":[["Butterfly Wing",30],["Glowing Spores",10],["Large Leaf",20]],"s":["Drops rarely out exploring in the Dreamlands, from filler encounters in the Grasslands, Mountains, or Prairie."],"x":"Criteria bugged, drops rarely in any biome"},{"k":"Lunarchargedmane","n":"Lunar Charged Mane","t":"lunar","i":[["Charged Core",5],["Charged Eyeball",5],["Pherris Fur Tuft",15]],"s":["Drops rarely when a fight with any enemy goes badly in the Dreamlands."]},{"k":"Lunaressencecoveredfeatherearring","n":"Lunar Essence-Covered Feather Earring","t":"lunar","i":[["Glowing Spores",5],["Pherris Fur Tuft",2],["Remnant: Essence-Covered Feather",10]],"s":["Drops rarely when a fight with any enemy goes badly in the Dreamlands."]},{"k":"Lunaressencecoveredtailwrap","n":"Lunar Essence-Covered Tail Wrap","t":"lunar","i":[["Glowing Spores",5],["Pherris Fur Tuft",2],["Remnant: Essence-Covered Feather",10]],"s":["Drops rarely when a fight with any enemy goes badly in the Dreamlands."]},{"k":"Lunarflickeringflowerpin","n":"Lunar Flickering Flower Pin","t":"lunar","i":[["Flickering Flower",8],["Glowing Spores",5],["Remnant: Growth Chunk",3]],"s":["Drops rarely when a fight with any enemy goes badly in the Dreamlands."]},{"k":"Lunarfurdust","n":"Lunar Fur Dust","t":"lunar","i":[["Essence-Covered Fur Clump",15],["Glowing Spores",10]],"s":["Drops now and then when you choose to offer acorns to one of: Crested Lunar Chipmunk, Lunar Amphiuma, Resting Lunar Petrel, Stalking Lunar Oncilla, Striped Lunar Chipmunk, Spotted Lunar Chipmunk in the Dreamlands."]},{"k":"Lunarglowingclaws","n":"Lunar Glowing Claws","t":"lunar","i":[["Glowing Claw",5],["Glowing Spores",15]],"s":["Drops now and then when you choose to offer acorns to one of: Crested Lunar Chipmunk, Lunar Amphiuma, Resting Lunar Petrel, Stalking Lunar Oncilla, Striped Lunar Chipmunk, Spotted Lunar Chipmunk in the Dreamlands."]},{"k":"Lunarglowingtalonnecklace","n":"Lunar Glowing Talon Necklace","t":"lunar","i":[["Essence-Covered Fur Clump",10],["Glowing Spores",5],["Glowing Talon",5]],"s":["Drops rarely when a fight with any enemy goes badly in the Dreamlands."]},{"k":"Lunarnightsky","n":"Lunar Night Sky","t":"lunar","i":[["Essence-Covered Fur Clump",10],["Glowing Spores",10],["Yarrow",20]],"s":["Drops rarely out exploring in the Dreamlands, from filler encounters in the Desert, Glacier, or Tundra."],"x":"Criteria bugged, drops rarely in any biome"},{"k":"Lunaroakcrown","n":"Lunar Oak Crown","t":"lunar","i":[["Glowing Spores",10],["Remnant: Acorn",5],["Remnant: Essence-Covered Feather",10]],"s":["Drops rarely when you choose to offer acorns to one of: Cnitharian Fox, Lunar Alaska Marmot, Lunar Larks, Resting Petrel, Wandering Lunar Cat in the Dreamlands."]},{"k":"Lunaroaknecklace","n":"Lunar Oak Necklace","t":"lunar","i":[["Glowing Spores",10],["Remnant: Acorn",5],["Remnant: Essence-Covered Feather",10]],"s":["Drops rarely when you choose to offer acorns to one of: Cnitharian Fox, Lunar Alaska Marmot, Lunar Larks, Resting Petrel, Wandering Lunar Cat in the Dreamlands."]},{"k":"Lunaroaktailwrap","n":"Lunar Oak Tailwrap","t":"lunar","i":[["Glowing Spores",10],["Remnant: Acorn",5],["Remnant: Essence-Covered Feather",10]],"s":["Drops rarely when you choose to offer acorns to one of: Cnitharian Fox, Lunar Alaska Marmot, Lunar Larks, Resting Petrel, Wandering Lunar Cat in the Dreamlands."]},{"k":"Lynxmask","n":"Lynx Mask","t":"ornament","i":[["Remnant: Lynx Pelt",1],["Remnant: Lynx Skull",3],["Remnant: Lynx Tail",5],["Winterfat",10]],"s":["Drops rarely as a trophy, from seeing off a Canadian Lynx or Charged Lynx enemy."]},{"k":"Mexicanjay","n":"Mexican Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Mooseearaccessory","n":"Moose Ear Accessory","t":"ornament","i":[["Moose Ear",5]],"s":["Drops rarely as a trophy, from seeing off any enemy."],"x":"Excludes Cataclysms enemies"},{"k":"Mossybranchdecor","n":"Mossy Branch Decor","t":"scenery","i":[["Large Branch",5],["Large Leaf",5]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Mountainlaurelblossoms","n":"Mountain Laurel Blossoms","t":"background","i":[["Spoonwood",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Mouthfuloffeathers","n":"Mouthful of Feathers","t":"trinket","i":[["Remnant: Toucan Feather",7]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Mushroomgateway","n":"Mushroom Gateway","t":"lunar","i":[["Glowing Spores",10],["Large Branch",20],["Remnant: Growth Chunk",10]],"s":["Drops rarely out exploring in the Dreamlands, from filler encounters in the Rainforest, Swamp, or Taiga."],"x":"Criteria bugged, drops rarely in any biome"},{"k":"Mushroompath","n":"Mushroom Path","t":"lunar","i":[["Growth Root",1],["Large Leaf",15],["Remnant: Growth Chunk",5]],"s":["Drops now and then when you choose to offer acorns to one of: Crested Lunar Chipmunk, Lunar Amphiuma, Resting Lunar Petrel, Stalking Lunar Oncilla, Striped Lunar Chipmunk, Spotted Lunar Chipmunk in the Dreamlands."]},{"k":"Muskratcarcassdecor","n":"Muskrat Carcass Decor","t":"trinket","i":[["Remnant: Muskrat Carcass",10]],"s":["Drops rarely out exploring, from encounters that give bones."]},{"k":"Mustelidfangstailjewelry","n":"Mustelid Fangs Tail Jewelry","t":"ornament","i":[["Mustelid Fangs",5],["Remnant: Puffin Feather",5]],"s":["Drops rarely as a trophy, from seeing off any Badger or Wolverine enemy."]},{"k":"Mysteriousruins","n":"Mysterious Ruins","t":"lunar","i":[["Flickering Flower",20],["Glowing Spores",10],["Large Rock",20]],"s":["Drops rarely out exploring in the Dreamlands, from filler encounters in the Coniferous Forest, Deciduous Forest, or Riparian Woodland."],"x":"Criteria bugged, drops rarely in any biome"},{"k":"Northernredoaksapling","n":"Northern Red Oak Sapling","t":"foliage","i":[["Remnant: Acorn",6]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Oddteethbracelets","n":"Odd Teeth Bracelets","t":"ornament","i":[["Chaparral",5],["Odd Teeth",5],["Remnant: Owl Feather",5],["Winterfat",5]],"s":["Drops rarely as a trophy, from seeing off any Equine or Human enemy."]},{"k":"Oddteethtiara","n":"Odd Teeth Tiara","t":"ornament","i":[["Chaparral",5],["Odd Teeth",5],["Remnant: Owl Feather",5],["Winterfat",5]],"s":["Drops rarely as a trophy, from seeing off any Equine or Human enemy."]},{"k":"Oldrailway","n":"Old Railway","t":"background","i":[["Large Branch",15],["Large Leaf",15],["Large Rock",15]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Ornatefangnecklace","n":"Ornate Fang Necklace","t":"ornament","i":[["Bear Fangs",5],["Remnant: Coyote Pelt",1],["Yarrow",5]],"s":["Drops rarely as a trophy, from seeing off any Bear enemy."],"x":"Excludes Lunar enemies"},{"k":"Overgrownarches","n":"Overgrown Arches","t":"background","i":[["Large Leaf",10],["Large Rock",20]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Overgrowncar","n":"Overgrown Car","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Overgrowncave","n":"Overgrown Cave","t":"background","i":[["Large Leaf",10],["Large Rock",20]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Overgrownden","n":"Overgrown Den","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Owlfeatherdecor","n":"Owl Feather Decor","t":"trinket","i":[["Remnant: Owl Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Owltalonnecklace","n":"Owl Talon Necklace","t":"ornament","i":[["Remnant: Owl Talon",10]],"s":["Drops rarely out exploring, from encounters that give amusement items.","Drops occasionally when you choose to interrupt the Wolf and Coyote Pair during the February event."]},{"k":"Parrotfeatherdecor","n":"Parrot Feather Decor","t":"ornament","i":[["Remnant: Parrot Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Pasadenaoakbranch","n":"Pasadena Oak Branch","t":"foliage","i":[["Remnant: Acorn",6]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Pathofboulders","n":"Path of Boulders","t":"background","i":[["Large Rock",30]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Peltmerchantoutfit","n":"Pelt Merchant Outfit","t":"ornament","i":[["Ginger",7],["Large Leaf",10],["Remnant: Bone",5],["Remnant: Dog Pelt",1],["Remnant: Rattle",3],["Remnant: Wolf Pelt [Brown]",1]],"s":["Drops rarely as a trophy, from seeing off an Eastern Wolf or Guardian Sled Dogs enemy."]},{"k":"Pherishfurbody","n":"Pherish Fur Body","t":"lunar","i":[["Charcoal",2],["Essence-Covered Fur Clump",10],["Glowing Spores",10],["Pherris Fur Tuft",10]],"s":["Drops rarely as a trophy, from seeing off any Pherris enemy in the Dreamlands."]},{"k":"Pherishfurhead","n":"Pherish Fur Head","t":"lunar","i":[["Charcoal",2],["Essence-Covered Fur Clump",10],["Glowing Spores",10],["Pherris Fur Tuft",10]],"s":["Drops rarely as a trophy, from seeing off any Pherris enemy in the Dreamlands."]},{"k":"Pherrischewingtoy","n":"Pherris Chewing Toy","t":"lunar","i":[["Glowing Spores",3],["Large Branch",2],["Remnant: Essence-Covered Feather",5],["Remnant: Pherris Rolling Ball",3]],"s":["Drops now and then when you choose to give Delicate Meat to the Toy Trader in the Dreamlands."]},{"k":"Pherrisplushtoy","n":"Pherris Plush Toy","t":"lunar","i":[["Flickering Flower",5],["Glowing Spores",3],["Pherris Fur Tuft",10],["Remnant: Owl Feather",10]],"s":["Drops now and then when you choose to give Delicate Meat to the Toy Trader in the Dreamlands."]},{"k":"Pipevineswallowtailanklets","n":"Pipevine Swallowtail Anklets","t":"ornament","i":[["Arnica",5],["Butterfly Wing",10],["Remnant: Peregrine Falcon Feather",5]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Pipevineswallowtailbracelets","n":"Pipevine Swallowtail Bracelets","t":"ornament","i":[["Arnica",5],["Butterfly Wing",10],["Remnant: Peregrine Falcon Feather",5]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Pipevineswallowtailearrings","n":"Pipevine Swallowtail Earrings","t":"ornament","i":[["Arnica",5],["Butterfly Wing",10],["Remnant: Peregrine Falcon Feather",5]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Pipevineswallowtailtailwrap","n":"Pipevine Swallowtail Tailwrap","t":"ornament","i":[["Arnica",5],["Butterfly Wing",10],["Remnant: Peregrine Falcon Feather",5]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Pipevineswallowtailwingsbottom","n":"Pipevine Swallowtail Wings [Bottom]","t":"ornament","i":[["Butterfly Wing",20],["Cedar Bark",5],["Charcoal",5],["Remnant: Tortoise Shell",2]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."],"x":"Always drops at the same time as the other Pipevine Swallowtail wing recipe."},{"k":"Pipevineswallowtailwingstop","n":"Pipevine Swallowtail Wings [Top]","t":"ornament","i":[["Butterfly Wing",20],["Cedar Bark",5],["Charcoal",5],["Remnant: Tortoise Shell",2]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."],"x":"Always drops at the same time as the other Pipevine Swallowtail wing recipe."},{"k":"Playfulcacomistle","n":"Playful Cacomistle","t":"animal","i":[["Butterfly Wing",10],["Large Leaf",2],["Remnant: Toucan Feather",10],["Thick Fur Tuft",5]],"s":["Drops when you choose to offer acorns to the Cacomistle."]},{"k":"Playfuljaeger","n":"Playful Jaeger","t":"animal","i":[["Butterfly Wing",10],["Remnant: Dead Fish",5],["Remnant: Jaeger Feather",4],["Remnant: Puffin Feather",10]],"s":["Drops when you choose to offer acorns to the Parasitic Jaeger."]},{"k":"Playfulnorthamericanriverotter","n":"Playful North American River Otter","t":"animal","i":[["Butterfly Wing",10],["Large Rock",2],["Remnant: Dead Fish",5],["Remnant: Mollusk Shell",10]],"s":["Drops when you choose to offer acorns to the North American River Otter."]},{"k":"Playfulspottedskunk","n":"Playful Spotted Skunk","t":"animal","i":[["Butterfly Wing",10],["Large Branch",2],["Remnant: Acorn",5],["Remnant: Quail Egg",10]],"s":["Drops occasionally when you choose to approach the Spotted Skunk."]},{"k":"Posevariantsentinel","n":"Pose Variant [Sentinel]","t":"variant","i":[["Canine Claw",4],["Canine Fang",4],["Glowing Spores",15],["Remnant: Wolf Skull",2],["Remnant: Wolf Tail",2]],"s":["Drops rarely when a scout finishes rescouting a biome they'd already found."]},{"k":"Puffincolony","n":"Puffin Colony","t":"background","i":[["Remnant: Puffin Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Pupsitterden","n":"Pupsitter Den","t":"background","i":[["Large Rock",10],["Remnant: Gnawing Hoof",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Purplelunarbacklinefluffbody","n":"Purple Lunar Backline Fluff [Body]","t":"lunar","i":[["Charged Core",1],["Charged Eyeball",2],["Essence-Covered Fur Clump",10],["Glowing Spores",15]],"s":["Drops rarely as a trophy, from seeing off any Charged enemy in the Dreamlands."]},{"k":"Purplelunarbacklinefluffhead","n":"Purple Lunar Backline Fluff [Head]","t":"lunar","i":[["Charged Core",1],["Charged Eyeball",2],["Essence-Covered Fur Clump",10],["Glowing Spores",15]],"s":["Drops rarely as a trophy, from seeing off any Charged enemy in the Dreamlands."]},{"k":"Purplelunarbacklineflufftail","n":"Purple Lunar Backline Fluff [Tail]","t":"lunar","i":[["Charged Core",1],["Charged Eyeball",2],["Essence-Covered Fur Clump",10],["Glowing Spores",15]],"s":["Drops rarely as a trophy, from seeing off any Charged enemy in the Dreamlands."]},{"k":"Purplishbackedjay","n":"Purplish-Backed Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Quailtrail","n":"Quail Trail","t":"background","i":[["Remnant: Quail Egg",15]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Rabbitcarcassdecor","n":"Rabbit Carcass Decor","t":"trinket","i":[["Remnant: Rabbit Carcass",10]],"s":["Drops rarely out exploring, from encounters that give bones."]},{"k":"Rabbitfootden","n":"Rabbit Foot Den","t":"background","i":[["Large Branch",10],["Large Rock",10],["Lucky Foot",5]],"s":["Drops rarely out exploring, from encounters that give lucky feet."]},{"k":"Rattlesnakeden","n":"Rattlesnake Den","t":"background","i":[["Large Rock",10],["Rattlesnake Skin",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Redoakbranchgreen","n":"Red Oak Branch [Green]","t":"foliage","i":[["Remnant: Acorn",6]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Redoakbranchred","n":"Red Oak Branch [Red]","t":"foliage","i":[["Remnant: Acorn",6]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Redwoodsorrelherbcrown","n":"Redwood Sorrel Herb Crown","t":"ornament","i":[["Redwood Sorrel",5],["Remnant: Toucan Feather",5]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Redwoodsorrelmeadow","n":"Redwood Sorrel Meadow","t":"background","i":[["Redwood Sorrel",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Restinggrouseflock","n":"Resting Grouse Flock","t":"background","i":[["Remnant: Grouse Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Risingibis","n":"Rising Ibis","t":"background","i":[["Remnant: Ibis Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Roamingchickens","n":"Roaming Chickens","t":"background","i":[["Dandelion",20],["Remnant: Chicken Egg",20]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Rockyden","n":"Rocky Den","t":"background","i":[["Large Rock",30]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Rootcave","n":"Root Cave","t":"background","i":[["Large Branch",20],["Large Leaf",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Ruffedgrousefeatherfemale","n":"Ruffed Grouse Feather [Female]","t":"ornament","i":[["Remnant: Grouse Feather",30]],"s":["Drops rarely when you choose to take a chance on the Greater Sage-Grouse.","Drops rarely when you choose to watch the Sharp-Tailed Grouse."]},{"k":"Ruffedgrousefeathermale","n":"Ruffed Grouse Feather [Male]","t":"ornament","i":[["Remnant: Grouse Feather",30]],"s":["Drops rarely when you choose to take a chance on the Greater Sage-Grouse.","Drops rarely when you choose to watch the Sharp-Tailed Grouse."]},{"k":"Sanblasjay","n":"San Blas Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Sandstonecavern","n":"Sandstone Cavern","t":"background","i":[["Large Rock",30]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Scarceunderstorydry","n":"Scarce Understory [Dry]","t":"scenery","i":[["Large Branch",4],["Large Leaf",4]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Scarceunderstorygreen","n":"Scarce Understory [Green]","t":"scenery","i":[["Large Branch",4],["Large Leaf",4]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Scatteredbones","n":"Scattered Bones","t":"trinket","i":[["Remnant: Bone",10]],"s":["Drops rarely out exploring, from encounters that give bones."]},{"k":"Scatteredfoliagedry","n":"Scattered Foliage [Dry]","t":"scenery","i":[["Large Leaf",4]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Scatteredfoliagegreen","n":"Scattered Foliage [Green]","t":"scenery","i":[["Large Leaf",4]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Scatteredrocks","n":"Scattered Rocks","t":"scenery","i":[["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Scatteredsticks","n":"Scattered Sticks","t":"scenery","i":[["Large Branch",4]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Scoutscapelunar","n":"Scout's Cape [Lunar]","t":"lunar","i":[["Blue Skin",5],["Glowing Spores",10],["Glowing Talon",2],["Lunar Chitin",2],["Lunar Oil",2],["Pherris Fur Tuft",5],["Remnant: Volukros Feather",5]],"s":["Drops rarely as a trophy, from seeing off an Undercover Pherris Scout or Undercover Volukros Scout in the Dreamlands."]},{"k":"Scoutscapepurple","n":"Scout's Cape [Purple]","t":"lunar","i":[["Blue Skin",5],["Glowing Spores",10],["Glowing Talon",2],["Lunar Chitin",2],["Lunar Oil",2],["Pherris Fur Tuft",5],["Remnant: Volukros Feather",5]],"s":["Drops rarely as a trophy, from seeing off an Undercover Pherris Scout or Undercover Volukros Scout in the Dreamlands."]},{"k":"Seasidegullflock","n":"Seaside Gull Flock","t":"background","i":[["Large Rock",20],["Remnant: Gull Feather",20]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Secludedspringden","n":"Secluded Spring Den","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Silverythroatedjay","n":"Silvery-Throated Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Siskiyouirisandsunstonehills","n":"Siskiyou Iris and Sunstone Hills","t":"background","i":[["Flower: Siskiyou Iris",10],["Gem: Sunstone",10],["Large Rock",10]],"s":["Drops when you choose to approach the Flirting Wolves during the February event."]},{"k":"Skeletalremains","n":"Skeletal Remains","t":"trinket","i":[["Remnant: Bone",10]],"s":["Drops rarely out exploring, from encounters that give bones."]},{"k":"Soaringcondor","n":"Soaring Condor","t":"background","i":[["Remnant: Condor Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Sporechewingropetoy","n":"Spore Chewing Rope Toy","t":"lunar","i":[["Glowing Spores",10],["Lunar Chitin",3],["Lunar Oil",2],["Remnant: Hiker's Rope",2]],"s":["Drops now and then when you choose to give Delicate Meat to the Toy Trader in the Dreamlands."]},{"k":"Sprucegrousefeatherfemale","n":"Spruce Grouse Feather [Female]","t":"ornament","i":[["Remnant: Grouse Feather",30]],"s":["Drops rarely when you choose to take a chance on the Greater Sage-Grouse.","Drops rarely when you choose to watch the Sharp-Tailed Grouse."]},{"k":"Sprucegrousefeathermale","n":"Spruce Grouse Feather [Male]","t":"ornament","i":[["Remnant: Grouse Feather",30]],"s":["Drops rarely when you choose to take a chance on the Greater Sage-Grouse.","Drops rarely when you choose to watch the Sharp-Tailed Grouse."]},{"k":"Squirrelcarcassdecor","n":"Squirrel Carcass Decor","t":"trinket","i":[["Remnant: Squirrel Carcass",10]],"s":["Drops rarely out exploring, from encounters that give bones."]},{"k":"Stellersjay","n":"Steller's Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Stonepathcave","n":"Stone Path Cave","t":"background","i":[["Large Leaf",10],["Large Rock",20]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Sunlitcave","n":"Sunlit Cave","t":"background","i":[["Large Rock",30]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Superchargedarc","n":"Supercharged Arc","t":"lunar","i":[["Charged Core",3],["Charged Eyeball",7],["Glowing Spores",5]],"s":["Drops rarely as a trophy, from seeing off any Charged enemy in the Dreamlands."]},{"k":"Superchargedfur","n":"Supercharged Fur","t":"lunar","i":[["Charged Core",5],["Charged Eyeball",10],["Essence-Covered Fur Clump",10],["Glowing Spores",5]],"s":["Drops rarely as a trophy, from seeing off any Charged enemy in the Dreamlands."]},{"k":"Swanfeatherdecor","n":"Swan Feather Decor","t":"ornament","i":[["Remnant: Swan Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Swanlake","n":"Swan Lake","t":"background","i":[["Large Leaf",20],["Remnant: Swan Feather",20]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Swimmingmallardducks","n":"Swimming Mallard Ducks","t":"background","i":[["Remnant: Duck Egg",10],["Remnant: Duck Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Tansycrown","n":"Tansy Crown","t":"ornament","i":[["Tansy",10]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Transvolcanicjay","n":"Transvolcanic Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Tropicalcave","n":"Tropical Cave","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Tuftedjay","n":"Tufted Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Uhlersarctic","n":"Uhler's Arctic","t":"animal","i":[["Butterfly Wing",5],["Arctic White",5]],"s":["Drops rarely when you choose to chomp or watch the Butterfly."]},{"k":"Unicoloredjay","n":"Unicolored Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Valleyoak","n":"Valley Oak","t":"foliage","i":[["Remnant: Acorn",6]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Vinegrowthden","n":"Vine Growth Den","t":"background","i":[["Large Branch",10],["Large Leaf",10],["Large Rock",10]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Volukrosgentlefeathersbody","n":"Volukros Gentle Feathers [Body]","t":"lunar","i":[["Charcoal",2],["Glowing Spores",10],["Remnant: Essence-Covered Feather",10],["Remnant: Volukros Feather",10]],"s":["Drops rarely as a trophy, from seeing off any Volukros enemy in the Dreamlands."]},{"k":"Volukrosgentlefeathershead","n":"Volukros Gentle Feathers [Head]","t":"lunar","i":[["Charcoal",2],["Glowing Spores",10],["Remnant: Essence-Covered Feather",10],["Remnant: Volukros Feather",10]],"s":["Drops rarely as a trophy, from seeing off any Volukros enemy in the Dreamlands."]},{"k":"Volukrossqueakytoydecor","n":"Volukros Squeaky Toy Decor","t":"lunar","i":[["Remnant: Volukros Squeaky Toy",5]],"s":["Drops when you choose to bark at the Winged Fox in the Dreamlands."]},{"k":"Whiteoaksapling","n":"White Oak Sapling","t":"foliage","i":[["Remnant: Acorn",6]],"s":["Drops now and then when you choose to offer acorns to the Opossum, kindly or meanly.","Drops rarely when you choose to offer acorns to one of: Blue Jay, Cedar Waxwing, Great Skua, Greater Grison, Lesser Prairie Chicken, Little Auk, Mountain Beaver, Nutria, Oncilla, Red Squirrel, Red-bellied Woodpecker, Two-barred Crossbill."]},{"k":"Whitepeacock","n":"White Peacock","t":"animal","i":[["Butterfly Wing",5],["Zebra Longwing",5]],"s":["Drops rarely when you choose to chomp or watch the Butterfly."]},{"k":"Whitethroatedmagpiejay","n":"White-Throated Magpie-Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Wildtoucans","n":"Wild Toucans","t":"background","i":[["Remnant: Toucan Feather",10]],"s":["Drops rarely out exploring, from encounters that give amusement items."]},{"k":"Wintercave","n":"Winter Cave","t":"background","i":[["Large Rock",30]],"s":["Drops rarely out exploring, from encounters that give cave-building items."]},{"k":"Winterfattrail","n":"Winterfat Trail","t":"background","i":[["Winterfat",30]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Wolftrophytailbandblack","n":"Wolf Trophy Tail Band [Black]","t":"ornament","i":[["Charcoal",5],["Remnant: Owl Feather",10],["Remnant: Wolf Tail",2]],"s":["Drops rarely as a trophy, from seeing off any Wolf enemy."]},{"k":"Wolftrophytailbandtimber","n":"Wolf Trophy Tail Band [Timber]","t":"ornament","i":[["Remnant: Owl Feather",10],["Remnant: Wolf Pelt [Brown]",2],["Remnant: Wolf Tail",2]],"s":["Drops rarely as a trophy, from seeing off any Wolf enemy."]},{"k":"Wolftrophytailbandwhite","n":"Wolf Trophy Tail Band [White]","t":"ornament","i":[["Remnant: Bone",5],["Remnant: Owl Feather",10],["Remnant: Wolf Tail",2]],"s":["Drops rarely as a trophy, from seeing off any Wolf enemy."]},{"k":"Wolftrophytailnecklaceblack","n":"Wolf Trophy Tail Necklace [Black]","t":"ornament","i":[["Charcoal",5],["Remnant: Grouse Feather",10],["Remnant: Wolf Tail",2]],"s":["Drops rarely as a trophy, from seeing off any Wolf enemy."]},{"k":"Wolftrophytailnecklacetimber","n":"Wolf Trophy Tail Necklace [Timber]","t":"ornament","i":[["Remnant: Grouse Feather",10],["Remnant: Wolf Pelt [Brown]",2],["Remnant: Wolf Tail",2]],"s":["Drops rarely as a trophy, from seeing off any Wolf enemy."]},{"k":"Wolftrophytailnecklacewhite","n":"Wolf Trophy Tail Necklace [White]","t":"ornament","i":[["Remnant: Bone",5],["Remnant: Grouse Feather",10],["Remnant: Wolf Tail",2]],"s":["Drops rarely as a trophy, from seeing off any Wolf enemy."]},{"k":"Woodhousesscrubjay","n":"Woodhouse's Scrub Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]},{"k":"Yarrowdecor","n":"Yarrow Decor","t":"foliage","i":[["Yarrow",10]],"s":["Drops rarely when a herbalist comes back in from foraging."]},{"k":"Yucatanjay","n":"Yucatan Jay","t":"animal","i":[["Remnant: Blue Jay Feather",25]],"s":["Drops rarely when you choose to follow the Raven.","Drops rarely when you choose to growl at the Beaver.","Drops rarely when you choose to offer acorns to the Blue Jay.","Drops rarely when you choose to snatch the Arctic Woolly Bear Moth."]}]};
  /* @recipes-end */

  // The guides' facts from the Grouse House Wiki snapshot. Regenerate with: python tools/export_guides.py
  /* @guides-begin: generated by tools/export_guides.py, do not edit by hand */
  const GUIDES = {"exported":"2026-09-26","wiki":"https://grousehouse.wiki/","biomes":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"starters":["Deciduous Forest","Grasslands","Mountains"],"herbs":{"Aloe":{"m":[["Ringworm Salve",1],["Cure-for-All",1],["Rich Healing Salve",3]],"b":["Desert","Swamp","Rainforest"],"all":0},"Arnica":{"m":[["Mange Salve",1],["Cure-for-All",1]],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"all":1},"Bearberry":{"m":[["Constipation Cure",1],["Tapeworm Remedy",1]],"b":["Deciduous Forest","Mountains","Coniferous Forest","Taiga","Tundra"],"all":0},"Boneset":{"m":[["Hepatitis Cure",1],["Cure-for-All",1]],"b":["Deciduous Forest","Grasslands","Coniferous Forest","Prairie","Riparian Woodland","Taiga","Swamp"],"all":0},"Buffaloberry":{"m":[["Constipation Cure",1],["Rich Healing Salve",3]],"b":["Mountains","Coniferous Forest","Prairie","Riparian Woodland","Taiga"],"all":0},"Burning Bush":{"m":[["Constipation Cure",1],["Rich Healing Salve",3]],"b":["Deciduous Forest","Grasslands","Coniferous Forest","Prairie","Riparian Woodland"],"all":0},"Carrionflower":{"m":[["Ear Mites Ointment",1],["Cure-for-All",1]],"b":["Deciduous Forest","Grasslands","Mountains","Coniferous Forest","Riparian Woodland","Taiga"],"all":0},"Cedar Bark":{"m":[["Tick Remedy",1],["Cure-for-All",1]],"b":["Coniferous Forest","Mountains","Grasslands","Deciduous Forest","Riparian Woodland","Prairie","Desert","Swamp","Rainforest"],"all":0},"Chaparral":{"m":[["Antidote",3],["Rich Healing Salve",3]],"b":["Desert"],"all":0},"Charcoal":{"m":[["Diarrhea Cure",3],["Healing Salves",1],["Rich Healing Salve",3]],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"all":1},"Dandelion":{"m":[["Cystitis Cure",1],["Healing Salves",1],["Hepatitis Cure",1]],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"all":1},"Feverfew":{"m":[["Heatstroke Remedy",1],["Infection Balm",1]],"b":["Deciduous Forest","Grasslands","Mountains","Coniferous Forest","Prairie","Riparian Woodland","Rainforest"],"all":0},"Garlic":{"m":[["Tapeworm Remedy",1],["Tick Remedy",1]],"b":["Deciduous Forest","Grasslands","Mountains","Coniferous Forest","Prairie","Riparian Woodland","Swamp"],"all":0},"Ginger":{"m":[["Heatstroke Remedy",1],["Cure-for-All",1]],"b":["Deciduous Forest","Grasslands","Mountains","Coniferous Forest","Prairie","Riparian Woodland","Taiga"],"all":0},"Goldenseal":{"m":[["Cough Cure",1],["Distemper Cure",1]],"b":["Deciduous Forest","Grasslands","Coniferous Forest","Riparian Woodland"],"all":0},"Guaiacum":{"m":[["Distemper Cure",1],["Influenza Cure",2]],"b":["Swamp","Rainforest"],"all":0},"Kava":{"m":[["Cough Cure",1],["Cystitis Cure",1]],"b":["Rainforest"],"all":0},"Mullein":{"m":[["Distemper Cure",1],["Cure-for-All",1]],"b":["Deciduous Forest","Grasslands","Mountains","Coniferous Forest","Prairie","Riparian Woodland","Desert"],"all":0},"Oregano":{"m":[["Infection Balm",1],["Pox Balm",1],["Ringworm Salve",1]],"b":["Mountains","Prairie","Desert","Swamp","Rainforest"],"all":0},"Pineapple Leaf":{"m":[["Cough Cure",1],["Influenza Cure",2]],"b":["Rainforest"],"all":0},"Redwood Sorrel":{"m":[["Cystitis Cure",1],["Pox Balm",1]],"b":["Mountains","Coniferous Forest","Swamp"],"all":0},"Spoonwood":{"m":[["Hepatitis Cure",1],["Cure-for-All",1]],"b":["Deciduous Forest","Grasslands","Mountains","Coniferous Forest","Riparian Woodland","Swamp"],"all":0},"St. John's Wort":{"m":[["Infection Balm",1],["Open Wound Salve",1]],"b":["Deciduous Forest","Grasslands","Mountains","Coniferous Forest","Prairie","Riparian Woodland","Swamp"],"all":0},"Tansy":{"m":[["Tapeworm Remedy",1],["Cure-for-All",1]],"b":["Grasslands","Deciduous Forest","Mountains","Prairie","Riparian Woodland","Coniferous Forest","Desert"],"all":0},"Tobacco":{"m":[["Ear Mites Ointment",1],["Fleas Remedy",3],["Mange Salve",1],["Tick Remedy",1]],"b":["Mountains","Prairie","Desert"],"all":0},"Turmeric":{"m":[["Ringworm Salve",1],["Cure-for-All",1]],"b":["Swamp","Rainforest"],"all":0},"Winterfat":{"m":[["Ear Mites Ointment",1],["Heatstroke Remedy",1],["Open Wound Salve",1]],"b":["Mountains","Prairie","Desert"],"all":0},"Yarrow":{"m":[["Mange Salve",1],["Open Wound Salve",1],["Pox Balm",1]],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"all":1}},"meds":{"Antidote":{"u":"Cures Poison","r":[["Chaparral",3]]},"Constipation Cure":{"u":"Cures Constipation","r":[["Bearberry",1],["Buffaloberry",1],["Burning Bush",1]]},"Cough Cure":{"u":"Cures Cough","r":[["Goldenseal",1],["Kava",1],["Pineapple Leaf",1]]},"Cure-for-All":{"u":"Cures any illness and gives illness immunity for three rollovers.","r":[["Aloe",1],["Arnica",1],["Boneset",1],["Carrionflower",1],["Cedar Bark",1],["Ginger",1],["Mullein",1],["Spoonwood",1],["Tansy",1],["Turmeric",1]]},"Cystitis Cure":{"u":"Cures Cystitis","r":[["Dandelion",1],["Kava",1],["Redwood Sorrel",1]]},"Diarrhea Cure":{"u":"Cures Diarrhea","r":[["Charcoal",3]]},"Distemper Cure":{"u":"Cures Distemper","r":[["Goldenseal",1],["Guaiacum",1],["Mullein",1]]},"Ear Mites Ointment":{"u":"Cures Ear Mites","r":[["Carrionflower",1],["Tobacco",1],["Winterfat",1]]},"Fleas Remedy":{"u":"Cures Fleas","r":[["Tobacco",3]]},"Healing Salves":{"u":"Restores 20 HP","r":[["Charcoal",1],["Dandelion",1]]},"Heatstroke Remedy":{"u":"Cures Heatstroke","r":[["Feverfew",1],["Ginger",1],["Winterfat",1]]},"Hepatitis Cure":{"u":"Cures Hepatitis","r":[["Boneset",1],["Dandelion",1],["Spoonwood",1]]},"Infection Balm":{"u":"Cures Infection","r":[["Feverfew",1],["Oregano",1],["St. John's Wort",1]]},"Influenza Cure":{"u":"Cures Influenza","r":[["Guaiacum",2],["Pineapple Leaf",2]]},"Mange Salve":{"u":"Cures Mange","r":[["Arnica",1],["Tobacco",1],["Yarrow",1]]},"Open Wound Salve":{"u":"Cures Open Wound","r":[["St. John's Owrt",1],["Winterfat",1],["Yarrow",1]]},"Pox Balm":{"u":"Cures Pox","r":[["Oregano",1],["Redwood Sorrel",1],["Yarrow",1]]},"Rich Healing Salve":{"u":"Restores 50 HP and gives illness immunity for three rollovers.","r":[["Aloe",1],["Buffaloberry",1],["Burning Bush",1],["Chaparral",1],["Charcoal",1]]},"Ringworm Salve":{"u":"Cures Ringworm","r":[["Aloe",1],["Oregano",1],["Turmeric",1]]},"Tapeworm Remedy":{"u":"Cures Tapeworm","r":[["Bearberry",1],["Garlic",1],["Tansy",1]]},"Tick Remedy":{"u":"Cures Ticks","r":[["Cedar Bark",1],["Garlic",1],["Tobacco",1]]}},"renamed":13,"scout":{"Grasslands":"Speed","Deciduous Forest":"Speed","Mountains":"Speed","Riparian Woodland":"Wisdom","Prairie":"Speed","Coniferous Forest":"Smarts","Desert":"Strength","Taiga":"Agility","Swamp":"Agility","Tundra":"Smarts","Rainforest":"Strength","Glacier":"Wisdom"},"difficulty":{"Grasslands":"Easy","Deciduous Forest":"Easy","Mountains":"Easy","Riparian Woodland":"Medium","Prairie":"Medium","Coniferous Forest":"Medium","Desert":"Difficult","Taiga":"Difficult","Swamp":"Challenging","Tundra":"Challenging","Rainforest":"Challenging","Glacier":"Challenging"},"diffOrder":["Easy","Medium","Difficult","Challenging"],"rates":[{"p":["Non-carrier","Non-carrier"],"o":[["Non-carrier",100]]},{"p":["Carrier","Non-carrier"],"o":[["Non-carrier",90],["Carrier",10]]},{"p":["Mutation","Non-carrier"],"o":[["Non-carrier",85],["Carrier",15],["Mutation",0]]},{"p":["Carrier","Carrier"],"o":[["Non-carrier",80],["Carrier",10],["Mutation",10]]},{"p":["Mutation","Carrier"],"o":[["Non-carrier",70],["Carrier",15],["Mutation",15]]},{"p":["Mutation","Mutation"],"o":[["Non-carrier",70],["Mutation",20],["Carrier",10]]}],"genetic":{"Albinism":"Secondary Mutation","Brachycephaly":"Mutation","Hereditary Cataracts":"Secondary Mutation","Melanism":"Secondary Mutation"},"ills":[{"n":"Constipation","hp":"None","en":"Slows Regeneration","br":"Can't Breed","sp":"Not Contagious","o":"Won't eat, Low chance to cure on rollover","cure":"Constipation Cure"},{"n":"Cough","hp":"−2 HP","en":"None","br":"Contagious","sp":"21%","o":"Low chance to cure on rollover","cure":"Cough Cure"},{"n":"Cystitis","hp":"−2 HP","en":"Slows Regeneration","br":"Can't Breed","sp":"Not Contagious","o":"Low chance to cure on rollover","cure":"Cystitis Cure"},{"n":"Diarrhea","hp":"−4 HP","en":"Slows Regeneration","br":"Can't Breed","sp":"Not Contagious","o":"Low chance to cure on rollover","cure":"Diarrhea Cure"},{"n":"Distemper","hp":"−6 HP","en":"Slows Regeneration","br":"Can't Breed","sp":"18%","o":"Lethal","cure":"Distemper Cure"},{"n":"Ear Mites","hp":"None","en":"None","br":"Contagious","sp":"60%","o":"Can't hunt or scout","cure":"Ear Mites Ointment"},{"n":"Fleas","hp":"None","en":"None","br":"Contagious","sp":"36%","o":"−3 HP on contraction unless from breeding","cure":"Fleas Remedy"},{"n":"Heatstroke","hp":"−4 HP","en":"Slows Regeneration","br":"Can't Breed","sp":"Not Contagious","o":"Lethal","cure":"Heatstroke Remedy"},{"n":"Hepatitis","hp":"−6 HP","en":"None","br":"Contagious","sp":"18%","o":"None","cure":"Hepatitis Cure"},{"n":"Infection","hp":"−4 HP","en":"None","br":"Can't Breed","sp":"Not Contagious","o":"Lethal","cure":"Infection Balm"},{"n":"Influenza","hp":"−6 HP","en":"Slows Regeneration","br":"Can't Breed","sp":"90%","o":"Energy set to zero on contraction","cure":"Influenza Cure"},{"n":"Mange","hp":"−6 HP","en":"None","br":"Can't Breed","sp":"18%","o":"None","cure":"Mange Salve"},{"n":"Open Wound","hp":"−6 HP","en":"None","br":"Can't Breed","sp":"Not Contagious","o":"HP set to zero on contraction","cure":"Open Wound Salve"},{"n":"Poison","hp":"−10 HP","en":"None","br":"Can't Breed","sp":"Not Contagious","o":"Lethal","cure":"Antidote"},{"n":"Pox","hp":"−6 HP","en":"None","br":"Contagious","sp":"18%","o":"Lethal to pups after one rollover","cure":"Pox Balm"},{"n":"Ringworm","hp":"−2 HP","en":"None","br":"Contagious","sp":"18%","o":"None","cure":"Ringworm Salve"},{"n":"Tapeworms","hp":"None","en":"None","br":"None","sp":"Not Contagious","o":"Additional -10% hunger at rollover","cure":"Tapeworm Remedy"},{"n":"Ticks","hp":"Keeps HP max at −3 from full","en":"None","br":"None","sp":"Not Contagious","o":"None","cure":"Tick Remedy"}],"pairs":[[10,2,true],[10,3,false],[20,4,false],[30,5,false],[40,6,false],[50,7,false],[60,8,false],[70,9,false],[80,10,false],[90,11,false],[100,12,false],[110,13,false],[120,14,false],[130,15,false],[140,16,false],[150,17,false],[160,18,false],[170,19,false],[180,20,false],[190,21,false],[200,22,false]],"prey":[{"n":"Bat Carcass","c":"Critter Prey","u":1,"w":[["Grasslands","All trails"]]},{"n":"Ground Squirrel Carcass","c":"Critter Prey","u":1,"w":[["Tundra","All trails"]]},{"n":"Lemming Carcass","c":"Critter Prey","u":1,"w":[["Glacier","All trails"]]},{"n":"Woodpecker Carcass","c":"Critter Prey","u":1,"w":[["Mountains","All trails"]]},{"n":"Jacana Carcass","c":"Critter Prey","u":2,"w":[["Swamp","All trails"]]},{"n":"Merlin Carcass","c":"Critter Prey","u":2,"w":[["Coniferous Forest","All trails"]]},{"n":"Milk Snake Carcass","c":"Critter Prey","u":2,"w":[["Prairie","All trails"]]},{"n":"Mink Carcass","c":"Critter Prey","u":2,"w":[["Taiga","All trails"]]},{"n":"Woodcock Carcass","c":"Critter Prey","u":2,"w":[["Deciduous Forest","Ancient Woodland"],["Deciduous Forest","Rocky Waterfall"],["Deciduous Forest","Overgrown Valley"]]},{"n":"Jackrabbit Carcass","c":"Critter Prey","u":3,"w":[["Desert","All trails"]]},{"n":"Raccoon Carcass","c":"Critter Prey","u":3,"w":[["Riparian Woodland","All trails"]]},{"n":"Stoat Carcass","c":"Critter Prey","u":3,"w":[["Coniferous Forest","Northwoods"],["Coniferous Forest","Rapids"],["Coniferous Forest","Redwood Forest"],["Taiga","All trails"],["Tundra","Timberline"],["Tundra","Heathlands"],["Glacier","Moraine"],["Glacier","Fjord"],["Glacier","Coast"]]},{"n":"Agouti Carcass","c":"Critter Prey","u":4,"w":[["Rainforest","Tropical Coast"],["Rainforest","Broadleaf Forest"],["Rainforest","Highlands"]]},{"n":"Grouse Carcass","c":"Critter Prey","u":4,"w":[["Deciduous Forest","Ancient Woodland"],["Deciduous Forest","Rocky Waterfall"],["Deciduous Forest","Overgrown Valley"],["Mountains","All trails"],["Prairie","Pine Barrens"],["Prairie","Great Plains"],["Coniferous Forest","Aspen Parkland"],["Coniferous Forest","Rapids"],["Coniferous Forest","Redwood Forest"]]},{"n":"Gull Carcass","c":"Critter Prey","u":4,"w":[["Tundra","Highlands"],["Tundra","Heathlands"],["Tundra","Coast"],["Glacier","All trails"]]},{"n":"Hare Carcass","c":"Critter Prey","u":4,"w":[["Grasslands","Fields"],["Grasslands","Rangelands"],["Grasslands","Hills"],["Deciduous Forest","Meadows"],["Deciduous Forest","Rocky Waterfall"],["Mountains","All trails"],["Prairie","All trails"],["Coniferous Forest","Aspen Parkland"],["Coniferous Forest","Rapids"],["Coniferous Forest","Redwood Forest"],["Desert","All trails"],["Tundra","Timberline"],["Tundra","Heathlands"]]},{"n":"Muskrat Carcass","c":"Critter Prey","u":4,"w":[["Grasslands","Fields"],["Grasslands","Rangelands"],["Deciduous Forest","All trails"],["Riparian Woodland","Great Lakes"],["Riparian Woodland","Flood-Meadow"],["Riparian Woodland","Bosque"],["Taiga","Lichen Woodland"],["Taiga","Creek"],["Taiga","Larch Forest"]]},{"n":"Opossum Carcass","c":"Critter Prey","u":4,"w":[["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Grasslands","Hills"],["Riparian Woodland","Flood-Meadow"],["Riparian Woodland","Giant River"],["Swamp","Mangrove Forest"],["Swamp","Salt Marsh"],["Swamp","Cypress Basin"],["Rainforest","Tropical Coast"],["Rainforest","Jungle River"],["Rainforest","Highlands"]]},{"n":"Pheasant Hen Carcass","c":"Critter Prey","u":4,"w":[["Grasslands","Fields"],["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Deciduous Forest","Meadows"],["Deciduous Forest","Overgrown Valley"],["Riparian Woodland","Great Lakes"],["Riparian Woodland","Flood-Meadow"],["Riparian Woodland","Bosque"],["Prairie","All trails"],["Coniferous Forest","All trails"]]},{"n":"Pheasant Rooster Carcass","c":"Critter Prey","u":4,"w":[["Grasslands","Fields"],["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Deciduous Forest","Meadows"],["Deciduous Forest","Overgrown Valley"],["Riparian Woodland","Great Lakes"],["Riparian Woodland","Flood-Meadow"],["Riparian Woodland","Bosque"],["Prairie","All trails"],["Coniferous Forest","All trails"]]},{"n":"Quail Carcass","c":"Critter Prey","u":4,"w":[["Mountains","All trails"],["Desert","All trails"]]},{"n":"Rabbit Carcass","c":"Critter Prey","u":4,"w":[["Prairie","Pothole Wetlands"],["Prairie","Shrub Steppe"],["Swamp","Salt Marsh"],["Swamp","Cypress Basin"],["Swamp","Temperate Swamp"],["Rainforest","Broadleaf Forest"],["Rainforest","Jungle River"],["Rainforest","Highlands"]]},{"n":"Silky Anteater Carcass","c":"Critter Prey","u":4,"w":[["Rainforest","Broadleaf Forest"],["Rainforest","Jungle River"],["Rainforest","Highlands"]]},{"n":"Porcupine Carcass","c":"Small Prey","u":8,"w":[["Deciduous Forest","Ancient Woodland"],["Deciduous Forest","Overgrown Valley"],["Mountains","Mountains"],["Mountains","Lakes"],["Mountains","High Plains"],["Prairie","Pine Barrens"],["Prairie","Great Plains"],["Coniferous Forest","All trails"],["Desert","All trails"],["Taiga","All trails"],["Tundra","Timberline"],["Tundra","Highlands"],["Tundra","Heathlands"],["Rainforest","Tropical Coast"],["Rainforest","Highlands"]]},{"n":"Beaver Carcass","c":"Small Prey","u":8,"w":[["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Deciduous Forest","Overgrown Valley"],["Mountains","Lakes"],["Riparian Woodland","Great Lakes"],["Riparian Woodland","Bosque"],["Riparian Woodland","Giant River"],["Coniferous Forest","All trails"],["Taiga","Lichen Woodland"],["Taiga","Creek"],["Taiga","Larch Forest"],["Swamp","Cypress Basin"],["Swamp","Temperate Swamp"]]},{"n":"Boar Carcass","c":"Small Prey","u":8,"w":[["Deciduous Forest","Ancient Woodland"],["Deciduous Forest","Rocky Waterfall"],["Swamp","Cypress Basin"],["Swamp","Temperate Swamp"]]},{"n":"Muskox Calf Carcass","c":"Small Prey","u":8,"w":[["Tundra","All trails"],["Glacier","Moraine"],["Glacier","Fjord"]]},{"n":"Peccary Carcass","c":"Small Prey","u":8,"w":[["Desert","All trails"],["Rainforest","Tropical Coast"],["Rainforest","Broadleaf Forest"],["Rainforest","Jungle River"]]},{"n":"Turkey Hen Carcass","c":"Small Prey","u":8,"w":[["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Grasslands","Hills"],["Deciduous Forest","Meadows"],["Deciduous Forest","Overgrown Valley"],["Riparian Woodland","Great Lakes"],["Riparian Woodland","Flood-Meadow"],["Prairie","Pine Barrens"],["Prairie","Great Plains"],["Prairie","Pothole Wetlands"],["Swamp","Temperate Swamp"]]},{"n":"Turkey Tom Carcass","c":"Small Prey","u":8,"w":[["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Grasslands","Hills"],["Deciduous Forest","Meadows"],["Deciduous Forest","Overgrown Valley"],["Riparian Woodland","Great Lakes"],["Riparian Woodland","Flood-Meadow"],["Prairie","Pine Barrens"],["Prairie","Great Plains"],["Prairie","Pothole Wetlands"],["Swamp","Temperate Swamp"]]},{"n":"Small Doe Carcass","c":"Small Prey","u":8,"w":[["Grasslands","Fields"],["Grasslands","Rangelands"],["Grasslands","Hills"],["Deciduous Forest","Ancient Woodland"],["Mountains","Forest"],["Riparian Woodland","Flood-Meadow"],["Riparian Woodland","Bosque"],["Prairie","Great Plains Prairie (Pothole Wetlands"],["Prairie","Shrub Steppe"],["Coniferous Forest","All trails"],["Desert","Shrubland"],["Desert","Canyons"],["Desert","Desert"],["Swamp","Mangrove Forest"],["Swamp","Salt Marsh"],["Swamp","Temperate Swamp"],["Rainforest","Tropical Coast"]]},{"n":"Swine Carcass","c":"Small Prey","u":9,"w":[["Grasslands","Oak Savanna"],["Riparian Woodland","Great Lakes"],["Riparian Woodland","Flood-Meadow"],["Riparian Woodland","Bosque"],["Desert","Mesa"],["Desert","Canyons"],["Swamp","Mangrove Forest"],["Swamp","Salt Marsh"],["Swamp","Cypress Basin"],["Rainforest","Tropical Coast"],["Rainforest","Broadleaf Forest"],["Rainforest","Jungle River"]]},{"n":"Seal Pup Carcass","c":"Small Prey","u":9,"w":[["Tundra","Highlands"],["Tundra","Heathlands"],["Tundra","Coast"],["Glacier","Coast"],["Glacier","Sea Ice"]]},{"n":"Pronghorn Buck Carcass","c":"Medium Prey","u":10,"w":[["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Grasslands","Hills"],["Mountains","Mountains"],["Mountains","Lakes"],["Mountains","High Plains"],["Prairie","Great Plains"],["Prairie","Pothole Wetlands"],["Desert","Shrubland"],["Desert","Mesa"]]},{"n":"Pronghorn Doe Carcass","c":"Medium Prey","u":10,"w":[["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Grasslands","Hills"],["Mountains","Mountains"],["Mountains","Lakes"],["Mountains","High Plains"],["Prairie","Great Plains"],["Prairie","Pothole Wetlands"],["Desert","Shrubland"],["Desert","Mesa"]]},{"n":"Whitetail Carcass","c":"Medium Prey","u":10,"w":[["Grasslands","Fields"],["Grasslands","Oak Savanna"],["Deciduous Forest","All trails"],["Mountains","Mountains"],["Mountains","Forest"],["Mountains","Lakes"],["Riparian Woodland","All trails"],["Prairie","Pine Barrens"],["Prairie","Pothole Wetlands"],["Coniferous Forest","Northwoods"],["Coniferous Forest","Aspen Parkland"],["Coniferous Forest","Rapids"],["Desert","Shrubland"],["Taiga","Mossy Cliffs"],["Taiga","Lichen Woodland"],["Taiga","Creek"],["Swamp","Cypress Basin"],["Swamp","Temperate Swamp"],["Rainforest","Highlands"]]},{"n":"Bighorn Sheep Ewe Carcass","c":"Medium Prey","u":12,"w":[["Mountains","Mountains"],["Mountains","Lakes"],["Mountains","High Plains"],["Desert","Mesa"],["Desert","Canyons"],["Desert","Desert"],["Taiga","Mossy Cliffs"],["Taiga","Creek"],["Taiga","Larch Forest"]]},{"n":"Bighorn Sheep Ram Carcass","c":"Medium Prey","u":12,"w":[["Mountains","Mountains"],["Mountains","Lakes"],["Mountains","High Plains"],["Desert","Mesa"],["Desert","Canyons"],["Desert","Desert"],["Taiga","Mossy Cliffs"],["Taiga","Creek"],["Taiga","Larch Forest"]]},{"n":"Blacktail Carcass","c":"Medium Prey","u":12,"w":[["Grasslands","Fields"],["Grasslands","Oak Savanna"],["Deciduous Forest","All trails"],["Riparian Woodland","Great Lakes"],["Riparian Woodland","Bosque"],["Riparian Woodland","Giant River"],["Coniferous Forest","All trails"]]},{"n":"Doe Carcass","c":"Medium Prey","u":12,"w":[["Grasslands","Fields"],["Grasslands","Hills"],["Deciduous Forest","All trails"],["Mountains","Lakes"],["Riparian Woodland","All trails"],["Prairie","Pothole Wetlands"],["Prairie","Shrub Steppe"],["Coniferous Forest","All trails"],["Desert","Canyons"],["Swamp","Mangrove Forest"],["Swamp","Salt Marsh"],["Swamp","Cypress Basin"],["Rainforest","Tropical Coast"]]},{"n":"Mule Deer Carcass","c":"Medium Prey","u":12,"w":[["Mountains","Forest"],["Mountains","High Plains"],["Desert","Shrubland"],["Desert","Canyons"],["Taiga","Mossy Cliffs"],["Taiga","Lichen Woodland"],["Taiga","Larch Forest"]]},{"n":"Caribou Calf Carcass","c":"Medium Prey","u":12,"w":[["Tundra","Timberline"],["Tundra","Highlands"],["Tundra","Heathlands"],["Glacier","Moraine"],["Glacier","Fjord"]]},{"n":"Seal Carcass","c":"Medium Prey","u":15,"w":[["Tundra","Coast"],["Glacier","Coast"],["Glacier","Sea Ice"]]},{"n":"Donkey Carcass","c":"Medium Prey","u":16,"w":[["Desert","Shrubland"],["Desert","Canyons"],["Desert","Desert"]]},{"n":"Mountain Goat Carcass","c":"Medium Prey","u":16,"w":[["Mountains","Mountains"],["Taiga","Mossy Cliffs"],["Taiga","Lichen Woodland"],["Taiga","Larch Forest"]]},{"n":"Tapir Carcass","c":"Medium Prey","u":16,"w":[["Rainforest","Broadleaf Forest"],["Rainforest","Jungle River"],["Rainforest","Highlands"]]},{"n":"Walrus Pup Carcass","c":"Medium Prey","u":16,"w":[["Glacier","Coast"],["Glacier","Sea Ice"]]},{"n":"Dall Sheep Carcass","c":"Large Prey","u":17,"w":[["Tundra","Highlands"]]},{"n":"Elk Cow Carcass","c":"Large Prey","u":17,"w":[["Deciduous Forest","All trails"],["Mountains","All trails"],["Riparian Woodland","All trails"],["Prairie","Pine Barrens"],["Prairie","Great Plains"],["Prairie","Pothole Wetlands"],["Coniferous Forest","All trails"],["Desert","Shrubland"],["Desert","Mesa"],["Taiga","Creek"],["Taiga","Larch Forest"],["Swamp","Cypress Basin"],["Swamp","Temperate Swamp"]]},{"n":"Horse Carcass","c":"Large Prey","u":18,"w":[["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Grasslands","Hills"],["Prairie","Great Plains"],["Prairie","Pothole Wetlands"],["Prairie","Shrub Steppe"]]},{"n":"Alligator Carcass","c":"Large Prey","u":20,"w":[["Riparian Woodland","Great Lakes"],["Riparian Woodland","Bosque"],["Riparian Woodland","Giant River"],["Swamp","Salt Marsh"],["Swamp","Cypress Basin"]]},{"n":"Caribou Bull Carcass","c":"Large Prey","u":20,"w":[["Taiga","Lichen Woodland"],["Taiga","Large Forest"],["Tundra","Highlands"],["Tundra","Heathlands"],["Glacier","Moraine"],["Glacier","Fjord"]]},{"n":"Caribou Cow Carcass","c":"Large Prey","u":20,"w":[["Taiga","Lichen Woodland"],["Taiga","Large Forest"],["Tundra","Highlands"],["Tundra","Heathlands"],["Glacier","Moraine"],["Glacier","Fjord"]]},{"n":"Bovine Carcass","c":"Large Prey","u":20,"w":[["Grasslands","Fields"],["Grasslands","Rangelands"],["Grasslands","Oak Savanna"],["Riparian Woodland","All trails"],["Desert","All trails"],["Rainforest","Broadleaf Forest"],["Rainforest","Highlands"]]},{"n":"Elk Bull Carcass","c":"Large Prey","u":20,"w":[["Deciduous Forest","All trails"],["Mountains","All trails"],["Riparian Woodland","All trails"],["Prairie","Pine Barrens"],["Prairie","Great Plains"],["Prairie","Pothole Wetlands"],["Coniferous Forest","All trails"],["Desert","Shrubland"],["Desert","Mesa"],["Taiga","Creek"],["Taiga","Larch Forest"],["Swamp","Cypress Basin"],["Swamp","Temperate Swamp"]]},{"n":"Crocodile Carcass","c":"Large Prey","u":20,"w":[["Swamp","Mangrove Forest"],["Swamp","Salt Marsh"],["Swamp","Cypress Basin"],["Rainforest","Tropical Coast"],["Rainforest","Broadleaf Forest"],["Rainforest","Jungle River"]]},{"n":"Moose Bull Carcass","c":"Large Prey","u":24,"w":[["Coniferous Forest","Northwoods"],["Coniferous Forest","Aspen Parkland"],["Coniferous Forest","Rapids"],["Taiga","Mossy Cliffs"],["Taiga","Lichen Woodland"],["Taiga","Larch Forest"],["Tundra","All trails"]]},{"n":"Moose Cow Carcass","c":"Large Prey","u":24,"w":[["Coniferous Forest","Northwoods"],["Coniferous Forest","Aspen Parkland"],["Coniferous Forest","Rapids"],["Taiga","Mossy Cliffs"],["Taiga","Lichen Woodland"],["Taiga","Larch Forest"],["Tundra","All trails"]]},{"n":"Muskox Carcass","c":"Large Prey","u":24,"w":[["Tundra","Heathlands"],["Tundra","Coast"],["Glacier","Moraine"],["Glacier","Fjord"]]},{"n":"Bison Carcass","c":"Large Prey","u":28,"w":[["Prairie","Great Plains"],["Coniferous Forest","Aspen Parkland"]]},{"n":"Walrus Carcass","c":"Large Prey","u":30,"w":[["Glacier","Coast"],["Glacier","Sea Ice"]]}],"preyUnknownBiomes":[],"enemies":[{"n":"African Rock Python","e":0,"lv":[14,19],"st":["Strength","Wisdom","Smarts"],"mo":["Fearless","Slow","Thick skin"],"b":["Swamp"],"d":["Python Eggs","Python Skin","Python Skull","Snake Meat","Scar: Throat"]},{"n":"Agitated Bull","e":0,"lv":[1,20],"st":["Strength","Speed","Wisdom"],"mo":["Fearless","Large prey","Prey"],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"d":["Bovine Carcass","Large Hoof","Odd Teeth","Scar: Abdomen"]},{"n":"Alaskan Brown Bear","e":0,"lv":[12,19],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Tundra"],"d":["Bear Fangs","Bear Paw [Brown]","Bear Pelt [Brown]","Bear Skull","Scar: Face"]},{"n":"Alaskan Malamute","e":0,"lv":[7,16],"st":["Agility","Wisdom","Smarts"],"mo":["Soft skin"],"b":["Tundra","Glacier"],"d":["Canine Claw","Canine Fang","Dog Pelt","Dog Skull","Scar: Ear Notch [Left]","Scar: Ear Notch [Right]"]},{"n":"Alaskan Tundra Wolf","e":0,"lv":[1,25],"st":["Strength","Speed","Agility","Wisdom","Smarts"],"mo":[],"b":["Tundra"],"d":["Canine Claw","Canine Fang","Wolf Pelt [White]","Wolf Skull","Wolf Tail","Scar: Ear [Left]","Scar: Ear [Right]"]},{"n":"Alaskan Tundra Wolf Pack","e":0,"lv":[1,20],"st":["Wisdom","Smarts"],"mo":["Group"],"b":["Tundra"],"d":["Canine Claw","Canine Fang","Wolf Pelt [White]","Wolf Skull","Wolf Tail","Scar: Hind Leg [Left]","Scar: Hind Leg [Right]"]},{"n":"Alligator","e":0,"lv":[15,20],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Riparian Woodland","Swamp","Rainforest"],"d":["Alligator Carcass","Alligator Leg","Alligator Skin","Alligator Skull","Alligator Tail","Scar: Wrist [Left]","Scar: Wrist [Right]"]},{"n":"American Badger","e":0,"lv":[5,15],"st":["Strength","Agility","Wisdom"],"mo":["Fearless"],"b":["Grasslands","Deciduous Forest","Mountains","Prairie","Coniferous Forest","Desert","Taiga"],"d":["Badger Pelt","Badger Skull","Mustelid Claws","Mustelid Fangs","Scar: Bite"]},{"n":"Anaconda","e":0,"lv":[15,20],"st":["Agility","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Rainforest"],"d":["Anaconda Eggs","Anaconda Skin","Anaconda Skull","Snake Meat","Scar: Front Leg [Left]","Scar: Front Leg [Right]"]},{"n":"Angry Farmer","e":0,"lv":[10,15],"st":["Wisdom","Smarts"],"mo":["Soft skin"],"b":["Grasslands"],"d":["Chicken Roast","Odd Teeth","Old Horseshoe","Shoe"]},{"n":"Arctic Fox","e":0,"lv":[1,20],"st":["Agility","Wisdom","Smarts"],"mo":["Soft skin"],"b":["Tundra","Glacier"],"d":["Canine Claw","Canine Fang","Fox Pelt [Arctic]","Fox Skull","Fox Tail [Arctic]","Scar: Foot"]},{"n":"Arctic Wolf","e":0,"lv":[1,25],"st":["Strength","Speed","Agility","Wisdom","Smarts"],"mo":[],"b":["Glacier"],"d":["Canine Claw","Canine Fang","Wolf Pelt [White]","Wolf Skull","Wolf Tail","Scar: Ear [Left]","Scar: Ear [Right]"]},{"n":"Arctic Wolf Pack","e":0,"lv":[1,20],"st":["Wisdom","Smarts"],"mo":["Group"],"b":["Glacier"],"d":["Canine Claw","Canine Fang","Wolf Pelt [White]","Wolf Skull","Wolf Tail","Scar: Hind Leg [Left]","Scar: Hind Leg [Right]"]},{"n":"Bald Eagle","e":0,"lv":[5,14],"st":["Wisdom","Smarts"],"mo":["Fearless","Soft skin"],"b":["Mountains","Riparian Woodland","Coniferous Forest","Taiga","Swamp","Tundra"],"d":["Eagle Beak","Eagle Skull","Eagle Talon","Large Bird Meat","Scar: Eye - Medium [Left]","Scar: Eye - Medium [Right]"]},{"n":"Barren Ground Caribou","e":0,"lv":[3,15],"st":["Speed","Wisdom"],"mo":["Large prey","Prey"],"b":["Tundra","Glacier"],"d":["Broken Antler","Caribou Antlers","Gnawing Hoof","Thick Fur Tuft","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Barren Ground Caribou Herd","e":0,"lv":[6,15],"st":["Speed","Wisdom","Smarts"],"mo":["Group","Large prey","Prey"],"b":["Tundra","Glacier"],"d":["Broken Antler","Caribou Antlers","Gnawing Hoof","Thick Fur Tuft","Scar: Forehead"]},{"n":"Bighorn Sheep Ram","e":0,"lv":[3,12],"st":["Agility","Wisdom"],"mo":["Large prey","Prey","Thick skin"],"b":["Mountains","Taiga"],"d":["Bighorn Horns","Bighorn Skull","Cracked Bighorn Horn","Gnawing Hoof","Scar: Cheek"]},{"n":"Black Bear","e":0,"lv":[10,18],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Deciduous Forest","Mountains","Riparian Woodland","Coniferous Forest","Taiga","Tundra"],"d":["Bear Fangs","Bear Paw [Black]","Bear Pelt [Black]","Bear Skull","Scar: Scratched Face"]},{"n":"Black Vulture Group","e":0,"lv":[5,15],"st":["Agility","Wisdom","Smarts"],"mo":["Group","Soft skin"],"b":["Desert","Swamp","Rainforest"],"d":["Large Bird Meat","Vulture Eggs","Vulture Skull","Vulture Talon","Scar: Dorsal Scratch"]},{"n":"Blacktail Buck","e":0,"lv":[1,11],"st":["Speed","Wisdom"],"mo":["Large prey","Prey"],"b":["Grasslands","Deciduous Forest","Riparian Woodland","Coniferous Forest"],"d":["Blacktail Antlers","Broken Antler","Deer Ear","Gnawing Hoof","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Bobcat","e":0,"lv":[2,10],"st":["Agility","Smarts","Wisdom"],"mo":["Soft skin"],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Swamp"],"d":["Big Cat Claw","Bobcat Pelt","Bobcat Skull","Bobcat Tail","Scar: Eye - Small [Left]","Scar: Eye - Small [Right]","Scar: Scratched Thigh [Left]","Scar: Scratched Thigh [Right]"]},{"n":"British Columbia Wolf","e":0,"lv":[1,20],"st":["Strength","Speed","Agility","Wisdom","Smarts"],"mo":[],"b":["Coniferous Forest","Taiga"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Black]","Wolf Pelt [Dark]","Wolf Skull","Wolf Tail"]},{"n":"British Columbia Wolf Pack","e":0,"lv":[1,20],"st":["Strength","Agility","Wisdom","Smarts"],"mo":["Group"],"b":["Coniferous Forest","Taiga"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Black]","Wolf Pelt [Dark]","Wolf Skull","Wolf Tail"]},{"n":"Burro","e":0,"lv":[1,15],"st":["Strength","Wisdom","Smarts"],"mo":["Large prey","Prey"],"b":["Desert"],"d":["Donkey Carcass","Donkey Skull","Large Hoof","Odd Teeth"]},{"n":"Bush Dog","e":0,"lv":[1,12],"st":["Agility","Wisdom","Smarts"],"mo":["Soft skin"],"b":["Rainforest"],"d":["Bush Dog Pelt","Bush Dog Skull","Canine Claw","Canine Fang","Scar: Foot"]},{"n":"California Condor","e":0,"lv":[14,19],"st":["Strength","Speed","Wisdom"],"mo":["Soft skin"],"b":["Desert","Rainforest"],"d":["Condor Egg","Condor Feather","Condor Skull","Large Bird Meat","Scar: Ear Notch [Left]","Scar: Ear Notch [Right]"]},{"n":"Canadian Lynx","e":0,"lv":[1,12],"st":["Agility","Wisdom","Smarts"],"mo":["Soft skin"],"b":["Mountains","Taiga","Tundra"],"d":["Big Cat Claw","Lynx Pelt","Lynx Skull","Lynx Tail","Scar: Nose Bridge","Scar: Nose Bridge [Low]","Scar: Scratched Thigh [Left]","Scar: Scratched Thigh [Right]"]},{"n":"Cinnamon Bear","e":0,"lv":[15,20],"st":["Strength","Wisdom"],"mo":["Slow"],"b":["Deciduous Forest","Coniferous Forest","Taiga"],"d":["Bear Fangs","Bear Paw [Cinnamon]","Bear Pelt [Cinnamon]","Bear Skull","Scar: Scratched Back"]},{"n":"Coastal Jaguar","e":0,"lv":[16,20],"st":["Agility","Wisdom"],"mo":[],"b":["Desert"],"d":["Big Cat Claw","Jaguar Pelt","Jaguar Skull","Jaguar Tail","Scar: Dorsal Scratch","Scar: Scratched Back"]},{"n":"Cougar","e":0,"lv":[9,17],"st":["Speed","Agility","Wisdom"],"mo":[],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Rainforest"],"d":["Big Cat Claw","Cougar Pelt","Cougar Skull","Cougar Tail","Scar: Eye - Large [Left]","Scar: Eye - Large [Right]","Scar: Scratched Front Leg [Left]","Scar: Scratched Front Leg [Right]","Scar: Scratched Side","Scar: Scratched Upper Leg [Left]","Scar: Scratched Upper Leg [Right]"]},{"n":"Cowboy","e":0,"lv":[10,15],"st":["Strength","Speed","Wisdom"],"mo":["Soft skin"],"b":["Prairie"],"d":["Odd Teeth","Old Horseshoe","Sausage","Shoe","Scar: Triceps Scratch [Left]","Scar: Triceps Scratch [Right]"]},{"n":"Coyote","e":0,"lv":[1,11],"st":["Agility","Wisdom","Smarts"],"mo":["Soft skin"],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp"],"d":["Canine Claw","Canine Fang","Coyote Pelt","Coyote Skull","Coyote Tail","Scar: Foot"]},{"n":"Coyote Pack","e":0,"lv":[1,13],"st":["Smarts","Wisdom"],"mo":["Group","Soft skin"],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp"],"d":["Canine Claw","Canine Fang","Coyote Pelt","Coyote Skull","Coyote Tail"]},{"n":"Death Rattler","e":0,"lv":[12,19],"st":["Agility","Wisdom"],"mo":["Slow","Venom","Thick skin"],"b":["Swamp"],"d":["Rattle","Rattlesnake Skin","Rattlesnake Skull","Snake Meat","Scar: Front Leg [Left]","Scar: Front Leg [Right]"]},{"n":"Desert Bighorn Ram","e":0,"lv":[4,12],"st":["Agility","Wisdom"],"mo":["Large prey","Prey"],"b":["Desert"],"d":["Bighorn Horns","Bighorn Skull","Cracked Bighorn Horns","Gnawing Hoof"]},{"n":"Desert Mule Deer Buck","e":0,"lv":[2,13],"st":["Wisdom"],"mo":["Large prey","Prey"],"b":["Desert"],"d":["Deer Ear","Gnawing Hoof","Mule Deer Carcass","Venison Liver","Scar: Eye - Large [Left]","Scar: Eye - Large [Right]"]},{"n":"Eastern Copperhead","e":0,"lv":[15,20],"st":["Agility","Wisdom"],"mo":["Slow","Venom","Thick skin"],"b":["Grasslands"],"d":["Light Viper Skin","Snake Meat","Venom Gland","Viper Skull","Scar: Foot"]},{"n":"Eastern Diamondback","e":0,"lv":[8,16],"st":["Speed","Agility","Wisdom"],"mo":["Slow","Venom","Thick skin"],"b":["Swamp"],"d":["Rattle","Rattlesnake Skin","Rattlesnake Skull","Snake Meat","Venom Gland"]},{"n":"Eastern Wolf","e":0,"lv":[1,25],"st":["Strength","Speed","Agility","Wisdom","Smarts"],"mo":[],"b":["Grasslands","Deciduous Forest","Riparian Woodland","Prairie"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Brown]","Wolf Skull","Wolf Tail","Scar: Ear [Left]","Scar: Ear [Right]"]},{"n":"Eastern Wolf Pack","e":0,"lv":[1,20],"st":["Smarts","Wisdom"],"mo":["Group"],"b":["Grasslands","Deciduous Forest","Riparian Woodland","Prairie"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Brown]","Wolf Skull","Wolf Tail","Scar: Hind Leg [Left]","Scar: Hind Leg [Right]"]},{"n":"Elephant Seal","e":0,"lv":[7,16],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Tundra"],"d":["Blubber","Rugged Flipper","Seal Skull","Seal Teeth","Scar: Muzzle","Scar: Ripped Leg [Left]","Scar: Ripped Leg [Right]"]},{"n":"Elk Bull","e":0,"lv":[6,14],"st":["Speed","Wisdom"],"mo":["Large prey","Prey"],"b":["Deciduous Forest","Mountains","Riparian Woodland","Coniferous Forest","Taiga","Swamp"],"d":["Broken Antler","Elk Antlers","Elk Ear","Gnawing Hoof","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Enraged Canada Goose","e":0,"lv":[10,16],"st":["Smarts","Wisdom"],"mo":["Fearless","Soft skin"],"b":["Grasslands"],"d":["Goose Beak","Goose Leg","Goose Skull","Large Bird Meat","Scar: Front Paw [Left]","Scar: Front Paw [Right]"]},{"n":"Feral Dog Pack","e":0,"lv":[7,18],"st":["Speed","Agility","Wisdom"],"mo":["Group"],"b":["Grasslands","Deciduous Forest","Prairie","Riparian Woodland","Swamp"],"d":["Canine Claw","Canine Fang","Dog Pelt","Dog Skull","Scar: Lip","Scar: Nose"]},{"n":"Florida Black Bear","e":0,"lv":[11,18],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Swamp"],"d":["Bear Fangs","Bear Paw [Black]","Bear Pelt [Black]","Bear Skull","Scar: Scratched Face"]},{"n":"Frenzied Razorback","e":0,"lv":[4,15],"st":["Strength","Wisdom"],"mo":["Fearless","Prey","Small prey"],"b":["Grasslands","Riparian Woodland","Desert","Swamp","Rainforest"],"d":["Boar Pelt","Boar Skull","Boar Tusks","Gnawing Hoof","Scar: Nose Bridge","Scar: Nose Bridge [High]","Scar: Nose Bridge [Low]"]},{"n":"Ghillie Hunter","e":0,"lv":[10,15],"st":["Agility","Smarts","Wisdom"],"mo":["Soft skin"],"b":["Deciduous Forest","Coniferous Forest","Taiga"],"d":["Nesting Material","Odd Teeth","Sausage","Shoe","Scar: Hock [Left]","Scar: Hock [Right]"]},{"n":"Glacier Bear","e":0,"lv":[10,18],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Glacier"],"d":["Bear Fangs","Bear Paw [Black]","Bear Pelt [Black]","Bear Skull","Scar: Face"]},{"n":"Golden Eagle","e":0,"lv":[4,14],"st":["Smarts","Wisdom"],"mo":["Fearless","Soft skin"],"b":["Coniferous Forest","Desert","Taiga"],"d":["Eagle Beak","Eagle Skull","Eagle Talon","Large Bird Meat","Scar: Eye - Medium [Left]","Scar: Eye - Medium [Right]"]},{"n":"Gray Fox","e":0,"lv":[1,20],"st":["Agility","Wisdom","Smarts"],"mo":["Soft skin"],"b":["Grasslands","Deciduous Forest","Riparian Woodland","Prairie","Desert","Swamp","Rainforest"],"d":["Canine Claw","Canine Fang","Fox Pelt [Gray]","Fox Skull","Fox Tail [Gray]","Scar: Foot"]},{"n":"Greater Grison","e":0,"lv":[5,14],"st":["Strength","Agility","Wisdom"],"mo":[],"b":["Rainforest"],"d":["Grison Pelt","Grison Skull","Mustelid Claws","Mustelid Fangs","Scar: Scratched Hind Leg [Left]","Scar: Scratched Hind Leg [Right]"]},{"n":"Greenland Wolf","e":0,"lv":[1,20],"st":["Agility","Wisdom"],"mo":[],"b":["Glacier"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Light]","Wolf Pelt [White]","Wolf Skull","Wolf Tail"]},{"n":"Greenland Wolf Pack","e":0,"lv":[1,20],"st":["Wisdom"],"mo":["Group"],"b":["Glacier"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Light]","Wolf Pelt [White]","Wolf Skull","Wolf Tail"]},{"n":"Grizzly Bear","e":0,"lv":[15,20],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Mountains","Riparian Woodland","Coniferous Forest","Taiga","Tundra"],"d":["Bear Fangs","Bear Paw [Grizzly]","Bear Pelt [Grizzly]","Bear Skull","Scar: Face"]},{"n":"Guarding Sled Dogs","e":0,"lv":[1,14],"st":["Speed","Wisdom","Smarts"],"mo":["Group"],"b":["Tundra","Glacier"],"d":["Canine Claw","Canine Fang","Dog Pelt","Dog Skull","Scar: Lip"]},{"n":"Hooded Seal","e":0,"lv":[4,15],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Glacier"],"d":["Blubber","Crab Leg","Rattling Spine","Rugged Flipper","Seal Carcass","Seal Skull","Seal Teeth","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Horned Rattlesnake","e":0,"lv":[12,19],"st":["Agility","Wisdom"],"mo":["Slow","Venom","Thick skin"],"b":["Desert"],"d":["Rattle","Rattlesnake Skin","Rattlesnake Skull","Snake Meat","Scar: Front Leg [Left]","Scar: Front Leg [Right]"]},{"n":"Hunter","e":0,"lv":[10,15],"st":["Strength","Smarts","Wisdom"],"mo":["Soft skin"],"b":["Mountains","Desert","Tundra","Glacier"],"d":["Carrot","Chicken Roast","Odd Teeth","Shoe","Scar: Cheekbone [Left]","Scar: Cheekbone [Right]","Scar: Scratched Hind Leg [Left]","Scar: Scratched Hind Leg [Right]"]},{"n":"Jaguar","e":0,"lv":[12,19],"st":["Agility","Wisdom"],"mo":[],"b":["Desert","Rainforest"],"d":["Big Cat Claw","Jaguar Pelt","Jaguar Skull","Jaguar Tail","Scar: Eye - Large [Left]","Scar: Eye - Large [Right]","Scar: Scratched Front Leg [Left]","Scar: Scratched Front Leg [Right]","Scar: Scratched Side","Scar: Scratched Upper Leg [Left]","Scar: Scratched Upper Leg [Right]"]},{"n":"Jaguarundi","e":0,"lv":[10,18],"st":["Speed","Agility","Wisdom"],"mo":["Soft skin"],"b":["Rainforest"],"d":["Big Cat Claw","Jaguarundi Pelt","Jaguarundi Skull","Jaguarundi Tail","Scar: Eye - Small [Left]","Scar: Eye - Small [Right]","Scar: Nose Bridge","Scar: Nose Bridge [High]","Scar: Nose Bridge [Low]","Scar: Scratched Thigh [Left]","Scar: Scratched Thigh [Right]"]},{"n":"Kermode Bear","e":0,"lv":[11,19],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Coniferous Forest","Taiga"],"d":["Bear Fangs","Bear Paw [Kermode]","Bear Pelt [Kermode]","Bear Skull","Scar: Face"]},{"n":"Killer Whale","e":0,"lv":[15,20],"st":["Strength","Smarts","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Glacier"],"d":["Blubber","Rattling Spine","Whale Meat","Whale Rib Bone","Scar: Ripped Leg [Left]","Scar: Ripped Leg [Right]"]},{"n":"Kodiak Brown Bear","e":0,"lv":[14,20],"st":["Strength","Wisdom"],"mo":["Slow"],"b":["Tundra"],"d":["Bear Fangs","Bear Paw [Brown]","Bear Pelt [Brown]","Bear Skull","Scar: Scratched Shoulder [Left]","Scar: Scratched Shoulder [Right]"]},{"n":"Leucistic Wolf","e":0,"lv":[1,20],"st":["Smarts","Wisdom"],"mo":[],"b":["Desert","Rainforest"],"d":["Canine Claw","Canine Fang","Wolf Pelt [White]","Wolf Skull","Wolf Tail"]},{"n":"Leucistic Wolf Pack","e":0,"lv":[1,20],"st":["Wisdom"],"mo":["Group"],"b":["Desert","Rainforest"],"d":["Canine Claw","Canine Fang","Wolf Pelt [White]","Wolf Skull","Wolf Tail"]},{"n":"Lone Vicious Black Wolf","e":0,"lv":[1,20],"st":["Strength","Speed","Wisdom"],"mo":[],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Black]","Wolf Skull","Wolf Tail"]},{"n":"Lone Vicious Gray Wolf","e":0,"lv":[1,20],"st":["Strength","Speed","Agility","Wisdom"],"mo":[],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Light]","Wolf Skull","Wolf Tail"]},{"n":"Louisiana Black Bear","e":0,"lv":[9,17],"st":["Strength","Wisdom"],"mo":["Slow","Thick skin"],"b":["Swamp"],"d":["Bear Fangs","Bear Paw [Black]","Bear Pelt [Black]","Bear Skull","Scar: Stop"]},{"n":"Manitoban Elk Bull","e":0,"lv":[6,14],"st":["Speed","Wisdom"],"mo":["Large prey","Prey"],"b":["Prairie"],"d":["Broken Antler","Elk Antlers","Elk Ear","Gnawing Hoof","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Mearns Coyote","e":0,"lv":[1,10],"st":["Agility","Smarts","Wisdom"],"mo":["Soft skin"],"b":["Desert"],"d":["Canine Fang"]},{"n":"Mearns Coyote Pack","e":0,"lv":[3,13],"st":["Agility","Smarts","Wisdom"],"mo":["Group","Soft skin"],"b":["Desert"],"d":["Canine Claw","Canine Fang"]},{"n":"Melanistic Jaguar","e":0,"lv":[7,19],"st":["Agility","Wisdom"],"mo":[],"b":["Rainforest"],"d":["Big Cat Claw","Jaguar Pelt [Melanistic]","Jaguar Skull","Jaguar Tail [Melanistic]","Scar: Thigh Swipe [Left]","Scar: Thigh Swipe [Right]"]},{"n":"Mexican Wolf","e":0,"lv":[1,25],"st":["Strength","Speed","Agility","Wisdom","Smarts"],"mo":[],"b":["Desert"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Red]","Wolf Skull","Wolf Tail","Scar: Ear [Left]","Scar: Ear [Right]"]},{"n":"Mexican Wolf Pack","e":0,"lv":[1,20],"st":["Smarts","Wisdom"],"mo":["Group"],"b":["Desert"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Red]","Wolf Skull","Wolf Tail","Scar: Hind Leg [Left]","Scar: Hind Leg [Right]"]},{"n":"Mojave Rattlesnake","e":0,"lv":[15,20],"st":["Agility","Wisdom"],"mo":["Slow","Venom","Thick skin"],"b":["Desert"],"d":["Rattle","Rattlesnake Skin","Rattlesnake Skull","Snake Meat","Scar: Front Leg [Left]","Scar: Front Leg [Right]"]},{"n":"Moose Bull","e":0,"lv":[7,17],"st":["Speed","Wisdom"],"mo":["Large prey","Prey"],"b":["Mountains","Coniferous Forest","Taiga","Tundra"],"d":["Broken Moose Antler","Gnawing Hoof","Moose Antler","Moose Ear","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Moose Cow","e":0,"lv":[5,13],"st":["Strength","Wisdom"],"mo":["Large prey","Prey"],"b":["Deciduous Forest"],"d":["Gnawing Hoof","Moose Cow Carcass","Thick Fur Tuft","Scar: Cheek"]},{"n":"Morelets Crocodile","e":0,"lv":[13,19],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Rainforest"],"d":["Crocodile Leg","Crocodile Skin","Crocodile Skull","Crocodile Tail","Scar: Shoulder [Left]","Scar: Shoulder [Right]"]},{"n":"Mountain Goat","e":0,"lv":[8,16],"st":["Agility","Smarts","Wisdom"],"mo":["Small prey","Prey"],"b":["Mountains"],"d":["Mountain Goat Carcass","Odd Teeth","Thick Fur Tuft","Scar: Cheekbone [Left]","Scar: Cheekbone [Right]"]},{"n":"Muskox","e":0,"lv":[6,16],"st":["Strength","Wisdom"],"mo":["Large prey","Prey"],"b":["Tundra","Glacier"],"d":["Gnawing Hoof","Muskox Horns","Muskox Skull","Thick Fur Tuft","Scar: Cheek","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Muskox Herd","e":0,"lv":[9,18],"st":["Strength","Wisdom"],"mo":["Group","Large prey","Prey"],"b":["Tundra","Glacier"],"d":["Gnawing Hoof","Muskox Horns","Muskox Skull","Thick Fur Tuft","Scar: Forehead"]},{"n":"Mustang Herd","e":0,"lv":[6,14],"st":["Speed","Wisdom"],"mo":["Group","Large prey","Prey"],"b":["Grasslands","Prairie"],"d":["Horse Carcass","Horse Skull","Large Hoof","Scar: Ear [Left]","Scar: Ear [Right]"]},{"n":"Mustang Stallion","e":0,"lv":[6,14],"st":["Speed","Wisdom"],"mo":["Large prey","Prey"],"b":["Grasslands","Prairie"],"d":["Horse Skull","Horse Tail","Large Hoof","Odd Teeth","Scar: Nose"]},{"n":"Narwhal","e":0,"lv":[15,20],"st":["Strength","Smarts","Wisdom"],"mo":["Slow","Thick skin"],"b":["Glacier"],"d":["Blubber","Narwhal Tooth","Rattling Spine","Whale Meat","Whale Rib Bone","Scar: Abdomen"]},{"n":"Northeastern Coyote","e":0,"lv":[2,10],"st":["Agility","Smarts","Wisdom"],"mo":["Soft skin"],"b":["Taiga"],"d":["Canine Claw","Canine Fang","Coyote Pelt"]},{"n":"Northeastern Coyote Pack","e":0,"lv":[1,13],"st":["Speed","Agility","Wisdom"],"mo":["Group","Soft skin"],"b":["Taiga"],"d":["Canine Fang","Coyote Pelt"]},{"n":"Ocelot","e":0,"lv":[7,16],"st":["Speed","Agility","Wisdom"],"mo":["Soft skin"],"b":["Desert","Rainforest"],"d":["Big Cat Claw","Ocelot Pelt","Ocelot Skull","Ocelot Tail","Scar: Eye - Small [Left]","Scar: Eye - Small [Right]","Scar: Scratched Thigh [Left]","Scar: Scratched Thigh [Right]"]},{"n":"Peary Caribou","e":0,"lv":[3,10],"st":["Agility","Smarts","Wisdom"],"mo":["Large prey","Prey"],"b":["Glacier"],"d":["Caribou Antlers","Caribou Bull Carcass","Caribou Cow Carcass","Gnawing Hoof","Thick Fur Tuft","Scar: Nose Bridge [High]","Scar: Nose Bridge [Low]"]},{"n":"Peary Caribou Herd","e":0,"lv":[4,12],"st":["Wisdom"],"mo":["Group","Large prey","Prey"],"b":["Glacier"],"d":["Caribou Antlers","Caribou Bull Carcass","Caribou Cow Carcass","Gnawing Hoof","Thick Fur Tuft"]},{"n":"Piebald Wolf","e":0,"lv":[1,20],"st":["Strength","Wisdom"],"mo":[],"b":["Riparian Woodland","Prairie"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Piebald]","Wolf Skull","Wolf Tail"]},{"n":"Piebald Wolf Pack","e":0,"lv":[1,20],"st":["Strength","Smarts","Agility","Wisdom"],"mo":["Group"],"b":["Riparian Woodland","Prairie"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Piebald]","Wolf Skull","Wolf Tail"]},{"n":"Plains Bison","e":0,"lv":[10,18],"st":["Strength","Wisdom"],"mo":["Large prey","Prey"],"b":["Prairie"],"d":["Bison Horns","Bison Skull","Gnawing Hoof","Thick Fur Tuft","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Plains Bison Herd","e":0,"lv":[15,20],"st":["Strength","Wisdom","Smarts"],"mo":["Group","Large prey","Prey"],"b":["Prairie"],"d":["Bison Horns","Bison Skull","Gnawing Hoof","Thick Fur Tuft","Scar: Forehead"]},{"n":"Plains Coyote","e":0,"lv":[1,10],"st":["Agility","Smarts","Wisdom"],"mo":["Soft skin"],"b":["Prairie"],"d":["Canine Claw","Canine Fang","Coyote Pelt","Coyote Skull","Coyote Tail","Scar: Ripped Mouth"]},{"n":"Plains Coyote Pack","e":0,"lv":[1,13],"st":["Smarts","Wisdom"],"mo":["Group","Soft skin"],"b":["Prairie"],"d":["Canine Claw","Canine Fang","Coyote Pelt","Coyote Skull","Coyote Tail"]},{"n":"Poacher","e":0,"lv":[10,15],"st":["Speed","Smarts","Wisdom"],"mo":["Soft skin"],"b":["Rainforest"],"d":["Chicken Roast","Hiker's Rope","Shoe","Scar: Eye - Long: Left","Scar: Eye - Long: Right"]},{"n":"Polar Bear","e":0,"lv":[15,20],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Glacier"],"d":["Bear Fangs","Bear Paw [Polar]","Bear Pelt [Polar]","Polar Bear Skull","Scar: Face"]},{"n":"Porcupine Caribou","e":0,"lv":[2,12],"st":["Speed","Wisdom"],"mo":["Large prey","Prey"],"b":["Tundra"],"d":["Broken Antler","Caribou Antlers","Gnawing Hoof","Thick Fur Tuft","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Porcupine Caribou Herd","e":0,"lv":[4,14],"st":["Speed","Wisdom","Smarts"],"mo":["Group","Large prey","Prey"],"b":["Tundra"],"d":["Broken Antler","Caribou Antlers","Gnawing Hoof","Thick Fur Tuft","Scar: Forehead"]},{"n":"Prairie Rattlesnake","e":0,"lv":[16,20],"st":["Speed","Agility","Wisdom"],"mo":["Soft skin"],"b":["Prairie"],"d":["Rattle","Rattlesnake Skin","Rattlesnake Skull","Snake Meat","Venom Gland","Scar: Wrist [Left]","Scar: Wrist [Right]"]},{"n":"Pronghorn Herd","e":0,"lv":[3,12],"st":["Speed","Wisdom"],"mo":["Group","Prey","Small prey"],"b":["Grasslands","Mountains","Prairie"],"d":["Gnawing Hoof","Pronghorn Horns","Pronghorn Pelt","Pronghorn Skull","Scar: Forehead"]},{"n":"Red Fox","e":0,"lv":[1,20],"st":["Agility","Wisdom","Smarts"],"mo":["Soft skin"],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Taiga","Swamp","Tundra","Rainforest"],"d":["Canine Claw","Canine Fang","Fox Pelt [Red]","Fox Skull","Fox Tail [Red]","Scar: Foot"]},{"n":"Red Wolf","e":0,"lv":[1,25],"st":["Strength","Speed","Agility","Wisdom","Smarts"],"mo":[],"b":["Swamp","Rainforest"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Red]","Wolf Skull","Wolf Tail","Scar: Ear [Left]","Scar: Ear [Right]"]},{"n":"Red Wolf Pack","e":0,"lv":[1,20],"st":["Smarts","Wisdom"],"mo":["Group"],"b":["Swamp","Rainforest"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Red]","Wolf Skull","Wolf Tail","Scar: Hind Leg [Left]","Scar: Hind Leg [Right]"]},{"n":"Rock Rattlesnake","e":0,"lv":[8,16],"st":["Speed","Smarts","Wisdom"],"mo":["Slow","Venom","Thick skin"],"b":["Desert"],"d":["Rattle","Rattlesnake Skin","Rattlesnake Skull","Snake Meat","Scar: Hock [Left]","Scar: Hock [Right]"]},{"n":"Rocky Mountain Elk Bull","e":0,"lv":[4,13],"st":["Strength","Wisdom"],"mo":["Large prey","Prey"],"b":["Mountains"],"d":["Elk Antlers","Elk Bull Carcass","Elk Ear","Gnawing Hoof"]},{"n":"Rocky Mountain Mule Deer Buck","e":0,"lv":[2,12],"st":["Speed","Agility","Wisdom"],"mo":["Large prey","Prey"],"b":["Mountains"],"d":["Mule Deer Carcass","Venison Liver"]},{"n":"Rocky Mountains Wolf","e":0,"lv":[1,20],"st":["Wisdom"],"mo":[],"b":["Mountains"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Tawny]","Wolf Tail"]},{"n":"Rocky Mountains Wolf Pack","e":0,"lv":[1,20],"st":["Wisdom"],"mo":["Group"],"b":["Mountains"],"d":["Canine Fang","Wolf Pelt [Light]","Wolf Pelt [Tawny]","Wolf Skull"]},{"n":"Shiras Moose Bull","e":0,"lv":[6,17],"st":["Strength","Wisdom"],"mo":["Large prey","Prey"],"b":["Riparian Woodland"],"d":["Broken Moose Antler","Gnawing Hoof","Moose Antler","Moose Bull Carcass","Moose Ear"]},{"n":"Sitka Brown Bear","e":0,"lv":[16,19],"st":["Strength","Wisdom"],"mo":["Slow"],"b":["Tundra"],"d":["Bear Fangs","Bear Paw [Brown]","Bear Pelt [Brown]","Bear Skull","Scar: Triceps Scratch [Left]","Scar: Triceps Scratch [Right]"]},{"n":"Snowy Owl","e":0,"lv":[1,11],"st":["Smarts","Wisdom"],"mo":["Soft skin"],"b":["Tundra","Glacier"],"d":["Large Bird Meat","Owl Skull","Owl Talon","Snowy Owl Feathers","Scar: Eye - Medium [Left]","Scar: Eye - Medium [Right]"]},{"n":"Spectacled Bear","e":0,"lv":[6,16],"st":["Strength","Smarts","Wisdom"],"mo":["Slow","Thick skin"],"b":["Rainforest"],"d":["Bear Fangs","Bear Paw [Spectacled]","Bear Pelt [Spectacled]","Bear Skull","Scar: Scratched Shoulder [Left]","Scar: Scratched Shoulder [Right]"]},{"n":"Spectacled Caiman","e":0,"lv":[8,17],"st":["Strength","Agility","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Rainforest"],"d":["Delicate Meat","Scar: Eye - Small [Left]","Scar: Eye - Small [Right]"]},{"n":"Starving Wolf","e":0,"lv":[1,20],"st":["Strength","Wisdom"],"mo":[],"b":["Grasslands","Deciduous Forest"],"d":["Canine Fang","Wolf Pelt [Brown]","Wolf Pelt [Dark]","Wolf Skull","Wolf Tail"]},{"n":"Starving Wolf Pack","e":0,"lv":[1,20],"st":["Wisdom"],"mo":["Group"],"b":["Grasslands","Deciduous Forest"],"d":["Canine Claw","Wolf Skull","Wolf Tail"]},{"n":"Steller Sea Lion","e":0,"lv":[3,13],"st":["Strength","Smarts","Wisdom"],"mo":["Slow","Thick skin"],"b":["Tundra"],"d":["Rattling Spine","Seal Skull"]},{"n":"Stickeen Brown Bear","e":0,"lv":[9,16],"st":["Strength","Wisdom"],"mo":["Slow"],"b":["Coniferous Forest"],"d":["Bear Fangs","Bear Paw [Brown]","Bear Pelt [Brown]","Bear Skull","Scar: Forehead"]},{"n":"Survivalist","e":0,"lv":[10,15],"st":["Agility","Wisdom"],"mo":["Soft skin"],"b":["Riparian Woodland"],"d":["Hiker's Rope","Odd Teeth","Venison Liver","Scar: Eye - Medium [Left]","Scar: Eye - Medium [Right]"]},{"n":"Swamp Wolf","e":0,"lv":[1,20],"st":["Speed","Wisdom"],"mo":[],"b":["Swamp"],"d":["Canine Fang","Wolf Pelt [Dark]","Wolf Pelt [Red]","Wolf Skull","Wolf Tail"]},{"n":"Swamp Wolf Pack","e":0,"lv":[1,20],"st":["Agility","Wisdom"],"mo":["Group"],"b":["Swamp"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Dark]","Wolf Pelt [Red]","Wolf Skull"]},{"n":"Swift Fox","e":0,"lv":[1,20],"st":["Agility","Wisdom","Smarts"],"mo":["Soft skin"],"b":["Prairie"],"d":["Canine Claw","Canine Fang","Fox Pelt [Swift]","Fox Skull","Fox Tail [Swift]","Scar: Foot"]},{"n":"Tayra","e":0,"lv":[7,16],"st":["Agility","Wisdom","Smarts"],"mo":[],"b":["Rainforest"],"d":["Mustelid Claws","Mustelid Fangs","Tayra Pelt","Tayra Skull","Scar: Bite","Scar: Lip"]},{"n":"Timber Rattlesnake","e":0,"lv":[10,16],"st":["Speed","Agility","Wisdom"],"mo":["Slow","Venom","Thick skin"],"b":["Mountains","Riparian Woodland"],"d":["Rattle","Rattlesnake Skin","Rattlesnake Skull","Snake Meat","Venom Gland","Scar: Bite"]},{"n":"Timber Wolf","e":0,"lv":[1,25],"st":["Strength","Speed","Agility","Wisdom","Smarts"],"mo":[],"b":["Deciduous Forest","Mountains","Coniferous Forest","Taiga"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Red]","Wolf Skull","Wolf Tail","Scar: Ear [Left]","Scar: Ear [Right]"]},{"n":"Timber Wolf Pack","e":0,"lv":[1,20],"st":["Smarts","Wisdom"],"mo":["Group"],"b":["Deciduous Forest","Mountains","Coniferous Forest","Taiga"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Red]","Wolf Skull","Wolf Tail","Scar: Hind Leg [Left]","Scar: Hind Leg [Right]"]},{"n":"Trapper","e":0,"lv":[10,15],"st":["Smarts","Wisdom"],"mo":["Soft skin"],"b":["Swamp"],"d":["Carrot","Chicken Roast","Odd Teeth","Shoe"]},{"n":"Tule Elk","e":0,"lv":[8,15],"st":["Strength","Agility","Wisdom"],"mo":["Large prey","Prey"],"b":["Prairie"],"d":["Broken Antler","Elk Bull Carcass","Gnawing Hoof"]},{"n":"Turkey Vulture","e":0,"lv":[3,13],"st":["Smarts","Wisdom"],"mo":["Soft skin"],"b":["Grasslands","Riparian Woodland","Desert","Swamp","Rainforest"],"d":["Large Bird Meat","Vulture Eggs","Vulture Skull","Vulture Talon","Scar: Eye - Medium [Left]","Scar: Eye - Medium [Right]"]},{"n":"Walrus","e":0,"lv":[12,19],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Glacier"],"d":["Blubber","Rugged Flipper","Walrus Skull","Walrus Tusk","Scar: Muzzle","Scar: Ripped Leg [Left]","Scar: Ripped Leg [Right]"]},{"n":"Walrus Group","e":0,"lv":[13,19],"st":["Strength","Wisdom"],"mo":["Fearless","Group","Slow","Thick skin"],"b":["Glacier"],"d":["Blubber","Rugged Flipper","Walrus Skull","Walrus Tusk","Scar: Muzzle","Scar: Ripped Leg [Left]","Scar: Ripped Leg [Right]"]},{"n":"Wandering Tala","e":0,"lv":[15,20],"st":["Strength","Wisdom","Smarts"],"mo":["Fearless"],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"d":["Medicine: Cure-For-All","Medicine: Rich Healing Salve"]},{"n":"Wandering Wolf Pack","e":0,"lv":[4,16],"st":["Speed","Wisdom"],"mo":["Group"],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Tundra","Rainforest","Glacier"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Brown]","Wolf Pelt [Dark]","Wolf Pelt [Light]","Wolf Pelt [Tawny]","Wolf Skull","Wolf Tail"]},{"n":"Water Moccasin","e":0,"lv":[15,19],"st":["Agility","Wisdom"],"mo":["Slow","Venom","Thick skin"],"b":["Swamp"],"d":["Cottonmouth Skull","Dark Viper Skin","Snake Meat","Venom Gland","Scar: Front Leg [Left]","Scar: Front Leg [Right]"]},{"n":"Western Rattlesnake","e":0,"lv":[10,16],"st":["Agility","Wisdom"],"mo":["Slow","Venom","Thick skin"],"b":["Desert"],"d":["Rattle","Rattlesnake Skin","Rattlesnake Skull","Snake Meat","Scar: Front Leg [Left]","Scar: Front Leg [Right]"]},{"n":"Whitetail Buck","e":0,"lv":[1,10],"st":["Speed","Wisdom"],"mo":["Large prey","Prey"],"b":["Grasslands","Deciduous Forest","Mountains","Riparian Woodland","Prairie","Coniferous Forest","Desert","Taiga","Swamp","Rainforest"],"d":["Broken Antler","Deer Ear","Gnawing Hoof","Whitetail Antlers","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Wild Boar","e":0,"lv":[4,15],"st":["Strength","Wisdom"],"mo":["Fearless","Prey","Small prey"],"b":["Deciduous Forest","Riparian Woodland","Swamp"],"d":["Boar Pelt","Boar Skull","Boar Tusks","Gnawing Hoof","Scar: Nose Bridge","Scar: Nose Bridge [High]","Scar: Nose Bridge [Low]"]},{"n":"Wolverine","e":0,"lv":[8,17],"st":["Strength","Wisdom","Smarts"],"mo":[],"b":["Coniferous Forest","Taiga","Tundra","Glacier"],"d":["Mustelid Claws","Mustelid Fangs","Wolverine Pelt","Wolverine Skull","Scar: Ripped Mouth"]},{"n":"Wood Bison","e":0,"lv":[10,16],"st":["Strength","Smarts","Wisdom"],"mo":["Large prey","Prey"],"b":["Coniferous Forest","Taiga"],"d":["Bison Carcass","Bison Horns","Bison Skull","Gnawing Hoof","Thick Fur Tuft","Scar: Snout"]},{"n":"Wood Bison Herd","e":0,"lv":[12,18],"st":["Strength","Smarts","Wisdom"],"mo":["Group","Large prey","Prey"],"b":["Coniferous Forest","Taiga"],"d":["Bison Carcass","Bison Horns","Bison Skull","Gnawing Hoof","Thick Fur Tuft","Scar: Snout"]},{"n":"Woodland Caribou","e":0,"lv":[2,12],"st":["Speed","Wisdom"],"mo":["Large prey","Prey"],"b":["Taiga"],"d":["Broken Antler","Caribou Antlers","Gnawing Hoof","Thick Fur Tuft","Scar: Eyeless [Left]","Scar: Eyeless [Right]"]},{"n":"Woodland Caribou Herd","e":0,"lv":[4,14],"st":["Speed","Wisdom","Smarts"],"mo":["Group","Large prey","Prey"],"b":["Taiga"],"d":["Broken Antler","Caribou Antlers","Gnawing Hoof","Thick Fur Tuft","Scar: Forehead"]},{"n":"Yukon Wolf","e":0,"lv":[1,20],"st":["Wisdom"],"mo":[],"b":["Tundra"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Dark]","Wolf Skull","Wolf Tail"]},{"n":"Yukon Wolf Pack","e":0,"lv":[1,20],"st":["Strength","Speed","Wisdom"],"mo":["Group"],"b":["Tundra"],"d":["Canine Claw","Canine Fang","Wolf Pelt [Dark]","Wolf Pelt [Tawny]","Wolf Skull","Wolf Tail"]},{"n":"American Crocodile","e":1,"lv":[24,25],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Rainforest"],"d":["Crocodile Carcass","Crocodile Leg","Crocodile Skin","Crocodile Skull","Crocodile Tail","Scar: Throat"]},{"n":"Nanulak","e":1,"lv":[24,25],"st":["Strength","Wisdom"],"mo":["Fearless","Slow","Thick skin"],"b":["Glacier"],"d":["Bear Fangs","Bear Paw [Polar]","Bear Pelt [Polar]","Nanulak Skull","Thick Fur Tuft","Scar: Thigh Swipe [Left]","Scar: Thigh Swipe [Right]"]}],"enemyUnknownBiomes":[],"disp":["Aggressive","Friendly","Romantic","Stoic"],"moves":[{"n":"Bare Teeth","v":["Very Positive","Very Negative","Negative","Positive"]},{"n":"Bark","v":["Very Positive","Very Negative","Negative","Positive"]},{"n":"Bristle Fur","v":["Positive","Negative","Very Negative","Very Positive"]},{"n":"Groom","v":["Very Negative","Very Positive","Positive","Negative"]},{"n":"Growl","v":["Very Positive","Very Negative","Negative","Positive"]},{"n":"Huff","v":["Positive","Negative","Very Negative","Very Positive"]},{"n":"Lick Mouth","v":["Negative","Positive","Very Positive","Very Negative"]},{"n":"Nuzzle","v":["Negative","Positive","Very Positive","Very Negative"]},{"n":"Play Bow","v":["Very Negative","Very Positive","Positive","Negative"]},{"n":"Raise Tail","v":["Positive","Negative","Very Negative","Very Positive"]},{"n":"Relax Tail","v":["Negative","Positive","Very Positive","Very Negative"]},{"n":"Sing","v":["Negative","Positive","Very Positive","Very Negative"]},{"n":"Sniff","v":["Positive","Negative","Very Negative","Very Positive"]},{"n":"Sniff Glands","v":["Negative","Positive","Very Positive","Very Negative"]},{"n":"Snarl","v":["Very Positive","Very Negative","Negative","Positive"]},{"n":"Stare Down","v":["Very Positive","Very Negative","Negative","Positive"]},{"n":"Touch Nose","v":["Negative","Positive","Very Positive","Very Negative"]},{"n":"Wag Tail","v":["Positive","Negative","Very Negative","Very Positive"]},{"n":"Whine","v":["Very Negative","Very Positive","Positive","Negative"]},{"n":"Zoomies","v":["Very Negative","Very Positive","Positive","Negative"]}],"roles":[{"n":"Hunter: Stalker","uses":["Smarts","Wisdom"],"how":"Proficiency rises by 1 for every hunt in this position and decays by 1 each rollover, so it only climbs on more than one hunt a day."},{"n":"Hunter: Chaser","uses":["Agility","Speed"],"how":"A wolf only gains proficiency for the first position it is assigned, checked stalker, then chaser, then finisher."},{"n":"Hunter: Finisher","uses":["Strength"],"how":"Stats matter more than proficiency or synergy, so levelling changes hunting success faster than anything else."},{"n":"Forager","uses":["Speed"],"how":"Brings back one or two herbs, plus one more at every 25 proficiency up to 75, so five at most. Winter takes one off. Speed divided by ten is minutes off the trip, up to ten."},{"n":"Scout","uses":["the biome's own stat"],"how":"How much of the bar one scout fills comes from the biome's difficulty, the scout's stats in that biome's stat, and their scouting proficiency."}]};
  /* @guides-end */

  // Genetics facts from the Grouse House Wiki. Regenerate with: python tools/export_genetics.py
  /* @genetics-begin: generated by tools/export_genetics.py, do not edit by hand */
  const GENETICS = {"exported":"2026-09-22","wiki":"https://grousehouse.wiki/","bases":{"abomination":{"n":"Abomination","g":"Special Dark","a":1,"s":"August [Cataclysms]"},"abyssal":{"n":"Abyssal","g":"Special Dark","a":1,"s":"Monthly [Lunar Dreams]"},"acanthite":{"n":"Acanthite","g":"Monochrome Medium II","b":1},"achilles":{"n":"Achilles","g":"Special Light","a":1,"s":"February [The Matchmaker]"},"acid":{"n":"Acid","g":"Special Light","b":1,"c":["Arkose","Rain"]},"agave":{"n":"Agave","g":"Cool Dark I"},"airglow":{"n":"Airglow","g":"Special Dark","a":1,"s":"Monthly [Lunar Dreams]"},"akhlut":{"n":"Akhlut","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"almond":{"n":"Almond","g":"Muted Light II"},"amaroq":{"n":"Amaroq","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"amber":{"n":"Amber","g":"Muted Dark I"},"amor":{"n":"Amor","g":"Special Medium","a":1,"s":"February [The Matchmaker]"},"annwn":{"n":"Annwn","g":"Special Dark","a":1,"s":"November [Coigreach]"},"antler":{"n":"Antler","g":"Muted Medium II","b":1},"antumbra":{"n":"Antumbra","g":"Special Light","a":1,"s":"Monthly [Lunar Dreams]"},"aotrom":{"n":"Aotrom","g":"Special Light","a":1,"s":"November [Coigreach]"},"apex":{"n":"Apex","g":"Cool Dark III","b":1},"apricot":{"n":"Apricot","g":"Muted Light I"},"aquamarine":{"n":"Aquamarine","g":"Cool Light I","b":1},"argent":{"n":"Argent","g":"Monochrome Light III","b":1},"arkose":{"n":"Arkose","g":"Warm Light II","b":1},"artemis":{"n":"Artemis","g":"Special Dark","a":1,"s":"Monthly [Lunar Dreams]"},"arthia":{"n":"Arthia","g":"Special Dark","b":1,"c":["Artemis","Cynthia"],"cn":1},"ashen":{"n":"Ashen","g":"Monochrome Medium I"},"aspen":{"n":"Aspen","g":"Muted Light I","b":1},"auburn":{"n":"Auburn","g":"Warm Dark II","b":1},"badger":{"n":"Badger","g":"Muted Medium III","a":1,"s":"Crafted Applicators"},"beast":{"n":"Beast","g":"Special Dark","a":1,"s":"August [Cataclysms]"},"bedrock":{"n":"Bedrock","g":"Monochrome Dark II","b":1},"beige":{"n":"Beige","g":"Muted Light I"},"beryl":{"n":"Beryl","g":"Cool Medium I","b":1},"biform":{"n":"Biform","g":"Special Medium","a":1,"s":"Monthly [Lunar Dreams]"},"biochar":{"n":"Biochar","g":"Special Dark","b":1,"c":["Nightshade","Sphalerite"]},"biotite":{"n":"Biotite","g":"Monochrome Dark II"},"birch":{"n":"Birch","g":"Monochrome Medium I"},"black":{"n":"Black","g":"Monochrome Dark I"},"blonde":{"n":"Blonde","g":"Muted Medium II","b":1},"blue":{"n":"Blue","g":"Cool Medium I"},"blueschist":{"n":"Blueschist","g":"Cool Dark III","b":1},"brass":{"n":"Brass","g":"Warm Medium I","b":1},"bronze":{"n":"Bronze","g":"Muted Dark III","b":1},"brown":{"n":"Brown","g":"Warm Dark I"},"buff":{"n":"Buff","g":"Muted Light II"},"caelum":{"n":"Caelum","g":"Special Medium","a":1,"s":"Monthly [Lunar Dreams]"},"calcite":{"n":"Calcite","g":"Warm Light II"},"caramel":{"n":"Caramel","g":"Muted Dark I"},"caribou":{"n":"Caribou","g":"Monochrome Medium III","a":1,"s":"Crafted Applicators"},"cedar":{"n":"Cedar","g":"Warm Medium I","b":1},"cerulean":{"n":"Cerulean","g":"Cool Medium I","b":1},"chert":{"n":"Chert","g":"Monochrome Medium II"},"chestnut":{"n":"Chestnut","g":"Muted Dark I","b":1},"chocolate":{"n":"Chocolate","g":"Muted Dark I"},"chromium":{"n":"Chromium","g":"Monochrome Light III","b":1},"chrysoberyl":{"n":"Chrysoberyl","g":"Cool Light II"},"clover":{"n":"Clover","g":"Special Medium","a":1,"s":"November [Coigreach]"},"cocoa":{"n":"Cocoa","g":"Muted Dark II","b":1},"collagen":{"n":"Collagen","g":"Special Medium","b":1,"c":["Antler","Tide"]},"coot":{"n":"Coot","g":"Cool Dark II","b":1},"coquina":{"n":"Coquina","g":"Warm Light I","b":1},"corrosion":{"n":"Corrosion","g":"Muted Medium II","b":1},"corrupt":{"n":"Corrupt","g":"Special Dark","a":1,"s":"October [Halloween Spectacle]"},"corundum":{"n":"Corundum","g":"Warm Dark III","b":1},"crayfish":{"n":"Crayfish","g":"Special Dark","b":1,"c":["Auburn","Denim"]},"cream":{"n":"Cream","g":"Muted Medium I"},"cream darker":{"n":"Cream Darker","g":"Muted Medium I"},"cream lighter":{"n":"Cream Lighter","g":"Muted Light I"},"crocus":{"n":"Crocus","g":"Special Medium","b":1,"c":["Malachite","Saffron"]},"cryptid":{"n":"Cryptid","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"crystal":{"n":"Crystal","g":"Special Light","a":1,"s":"Monthly [Lunar Dreams]"},"cupcake":{"n":"Cupcake","g":"Special Light","b":1,"c":["Lavender","Rime"]},"cynthia":{"n":"Cynthia","g":"Special Dark","a":1,"s":"Monthly [Lunar Dreams]"},"dark brown":{"n":"Dark Brown","g":"Muted Dark I"},"dark crystal":{"n":"Dark Crystal","g":"Special Medium","b":1,"c":["Crystal","Umbra"],"cn":1},"dark fawn":{"n":"Dark Fawn","g":"Muted Dark I","b":1},"denim":{"n":"Denim","g":"Cool Dark II","b":1},"diaelum":{"n":"Diaelum","g":"Special Light","b":1,"c":["Caelum","Diana"],"cn":1},"diana":{"n":"Diana","g":"Special Light","a":1,"s":"Monthly [Lunar Dreams]"},"dinar":{"n":"Dinar","g":"Warm Dark II"},"diopside":{"n":"Diopside","g":"Cool Dark I","b":1},"diorite":{"n":"Diorite","g":"Cool Medium II"},"doubloon":{"n":"Doubloon","g":"Warm Medium II","b":1},"dravite":{"n":"Dravite","g":"Warm Dark II"},"ducat":{"n":"Ducat","g":"Warm Light II"},"dust":{"n":"Dust","g":"Monochrome Light I"},"ebony":{"n":"Ebony","g":"Muted Dark II"},"faelcu":{"n":"Faelcu","g":"Special Dark","a":1,"s":"November [Coigreach]"},"fawn":{"n":"Fawn","g":"Muted Medium I","b":1},"febris":{"n":"Febris","g":"Special Light","b":1,"c":["Isabel","Vapor"]},"feldspar":{"n":"Feldspar","g":"Muted Light II"},"fenestra":{"n":"Fenestra","g":"Special Light","a":1,"s":"Monthly [Lunar Dreams]"},"flint":{"n":"Flint","g":"Monochrome Medium III","b":1},"fossil":{"n":"Fossil","g":"Special Light","a":1,"s":"Crafted Applicators"},"fox":{"n":"Fox","g":"Warm Medium III","a":1,"s":"Crafted Applicators"},"fuath":{"n":"Fuath","g":"Special Medium","a":1,"s":"November [Coigreach]"},"fulica":{"n":"Fulica","g":"Special Dark","b":1,"c":["Coot","Lupin"]},"gaelach":{"n":"Gaelach","g":"Special Medium","a":1,"s":"November [Coigreach]"},"galena":{"n":"Galena","g":"Cool Medium II"},"ghost":{"n":"Ghost","g":"Special Light","a":1,"s":"October [Halloween Spectacle]"},"giallo antico":{"n":"Giallo Antico","g":"Special Medium","b":1,"c":["Marble","Xanthic"]},"glaucous":{"n":"Glaucous","g":"Cool Light I"},"glownoise":{"n":"Glownoise","g":"Special Medium","b":1,"c":["Airglow","Turquoise"],"cn":1},"gold":{"n":"Gold","g":"Warm Medium I"},"gold darker":{"n":"Gold Darker","g":"Warm Medium I"},"gold lighter":{"n":"Gold Lighter","g":"Warm Light I"},"goldenrod":{"n":"Goldenrod","g":"Warm Light I"},"gravel":{"n":"Gravel","g":"Monochrome Medium I","b":1},"gray":{"n":"Gray","g":"Monochrome Dark I"},"gray darker":{"n":"Gray Darker","g":"Monochrome Dark I","b":1},"gray lighter":{"n":"Gray Lighter","g":"Monochrome Medium I","b":1},"greisen":{"n":"Greisen","g":"Muted Light II","b":1},"grossular":{"n":"Grossular","g":"Warm Light II","b":1},"grulla":{"n":"Grulla","g":"Cool Medium III","b":1},"guilder":{"n":"Guilder","g":"Special Medium","b":1,"c":["Blonde","Doubloon"]},"gwyrdd":{"n":"Gwyrdd","g":"Special Light","a":1,"s":"November [Coigreach]"},"hadal":{"n":"Hadal","g":"Special Dark","a":1,"s":"Monthly [Lunar Dreams]"},"hecate":{"n":"Hecate","g":"Special Dark","a":1,"s":"October [Halloween Spectacle]"},"henna":{"n":"Henna","g":"Warm Dark I","b":1},"hestia":{"n":"Hestia","g":"Special Medium","a":1,"s":"February [The Matchmaker]"},"honey":{"n":"Honey","g":"Muted Medium I"},"honeydew":{"n":"Honeydew","g":"Cool Light I"},"hornfels":{"n":"Hornfels","g":"Muted Dark III","b":1},"howlite":{"n":"Howlite","g":"Monochrome Medium I"},"hurricane":{"n":"Hurricane","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"hydrangea":{"n":"Hydrangea","g":"Special Dark","a":1,"s":"February [The Matchmaker]"},"iridium":{"n":"Iridium","g":"Monochrome Dark III","b":1},"iron":{"n":"Iron","g":"Monochrome Dark III","b":1},"isabel":{"n":"Isabel","g":"Muted Light II","b":1},"jacinthe":{"n":"Jacinthe","g":"Warm Light II","b":1},"jet":{"n":"Jet","g":"Monochrome Dark I"},"khaki":{"n":"Khaki","g":"Cool Medium I"},"kin":{"n":"Kin","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"koma":{"n":"Koma","g":"Special Medium","a":1,"s":"Monthly [Lunar Dreams]"},"larimar":{"n":"Larimar","g":"Cool Light III","b":1},"lavender":{"n":"Lavender","g":"Cool Light II","b":1},"leucippus":{"n":"Leucippus","g":"Special Light","a":1,"s":"February [The Matchmaker]"},"lilac":{"n":"Lilac","g":"Cool Dark II"},"lily":{"n":"Lily","g":"Muted Medium III","b":1},"liver":{"n":"Liver","g":"Warm Dark I"},"losna":{"n":"Losna","g":"Special Dark","a":1,"s":"Monthly [Lunar Dreams]"},"luna":{"n":"Luna","g":"Special Medium","a":1,"s":"Monthly [Lunar Dreams]"},"lupin":{"n":"Lupin","g":"Muted Dark II","b":1},"lynx":{"n":"Lynx","g":"Monochrome Light III","a":1,"s":"Crafted Applicators"},"magnolia":{"n":"Magnolia","g":"Warm Light I"},"malachite":{"n":"Malachite","g":"Cool Medium II","b":1},"maltese":{"n":"Maltese","g":"Cool Medium II","b":1},"marble":{"n":"Marble","g":"Monochrome Medium II","b":1},"marengo":{"n":"Marengo","g":"Cool Dark I"},"marsh":{"n":"Marsh","g":"Cool Dark II"},"megalodon":{"n":"Megalodon","g":"Cool Medium III","b":1},"melchior":{"n":"Melchior","g":"Monochrome Light II","b":1},"merged":{"n":"Merged","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"mineral":{"n":"Mineral","g":"Monochrome Light I","b":1},"mirage":{"n":"Mirage","g":"Cool Light I"},"mist":{"n":"Mist","g":"Cool Light I","b":1},"mojave":{"n":"Mojave","g":"Warm Medium III","b":1},"monster":{"n":"Monster","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"moondust":{"n":"Moondust","g":"Special Light","a":1,"s":"Monthly [Lunar Dreams]"},"moonlight":{"n":"Moonlight","g":"Special Medium","a":1,"s":"Monthly [Lunar Dreams]"},"moonloss":{"n":"Moonloss","g":"Special Dark","b":1,"c":["Losna","Moonlight"],"cn":1},"moss":{"n":"Moss","g":"Special Dark","a":1,"s":"November [Coigreach]"},"narwhal":{"n":"Narwhal","g":"Cool Medium III","a":1,"s":"Crafted Applicators"},"nepheline":{"n":"Nepheline","g":"Monochrome Light II"},"nightchill":{"n":"Nightchill","g":"Special Light","a":1,"s":"Monthly [Lunar Dreams]"},"nightform":{"n":"Nightform","g":"Special Medium","b":1,"c":["Biform","Nightchill"],"cn":1},"nightshade":{"n":"Nightshade","g":"Cool Dark II","b":1},"nocturne":{"n":"Nocturne","g":"Cool Dark II"},"obsidian":{"n":"Obsidian","g":"Monochrome Dark II","b":1},"odium":{"n":"Odium","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"onyx":{"n":"Onyx","g":"Monochrome Dark II"},"opal":{"n":"Opal","g":"Cool Light III","b":1},"oroide":{"n":"Oroide","g":"Muted Dark II"},"pale":{"n":"Pale","g":"Cool Light II"},"peach":{"n":"Peach","g":"Muted Light II","b":1},"pearl":{"n":"Pearl","g":"Muted Medium III","b":1},"pecan":{"n":"Pecan","g":"Muted Dark II"},"penumbra":{"n":"Penumbra","g":"Special Medium","a":1,"s":"Monthly [Lunar Dreams]"},"pewter":{"n":"Pewter","g":"Monochrome Dark II"},"piasa":{"n":"Piasa","g":"Warm Light III","b":1},"pumice":{"n":"Pumice","g":"Monochrome Dark I","b":1},"pyrope":{"n":"Pyrope","g":"Warm Dark III","b":1},"quartz":{"n":"Quartz","g":"Monochrome Light I","b":1},"rain":{"n":"Rain","g":"Cool Light I","b":1},"realgar":{"n":"Realgar","g":"Warm Dark III","b":1},"red":{"n":"Red","g":"Warm Medium I"},"reef":{"n":"Reef","g":"Special Medium","a":1,"s":"Monthly [Lunar Dreams]"},"rime":{"n":"Rime","g":"Monochrome Light II","b":1},"ruby cocoa":{"n":"Ruby Cocoa","g":"Special Dark","b":1,"c":["Cocoa","Sarder"]},"rufous":{"n":"Rufous","g":"Warm Dark II","b":1},"russet":{"n":"Russet","g":"Warm Dark II"},"rust":{"n":"Rust","g":"Warm Medium II"},"rusticle":{"n":"Rusticle","g":"Special Medium","b":1,"c":["Acanthite","Corrosion"]},"saffron":{"n":"Saffron","g":"Warm Medium II","b":1},"salt":{"n":"Salt","g":"Monochrome Light II","b":1},"sandy":{"n":"Sandy","g":"Muted Medium II"},"sap":{"n":"Sap","g":"Special Dark","b":1,"c":["Obsidian","Rufous"]},"sappho":{"n":"Sappho","g":"Special Light","a":1,"s":"February [The Matchmaker]"},"saprolite":{"n":"Saprolite","g":"Special Dark","b":1,"c":["Bedrock","Sepia"]},"sarder":{"n":"Sarder","g":"Warm Dark II","b":1},"seal":{"n":"Seal","g":"Muted Dark III","b":1},"seed":{"n":"Seed","g":"Special Light","b":1,"c":["Melchior","Peach"]},"selene":{"n":"Selene","g":"Special Light","a":1,"s":"Monthly [Lunar Dreams]"},"selunia":{"n":"Selunia","g":"Special Light","b":1,"c":["Luna","Selene"],"cn":1},"sepia":{"n":"Sepia","g":"Muted Dark II","b":1},"serpentine":{"n":"Serpentine","g":"Cool Dark III","b":1},"shell":{"n":"Shell","g":"Muted Light I","b":1},"sidhe":{"n":"Sidhe","g":"Special Dark","a":1,"s":"November [Coigreach]"},"silica":{"n":"Silica","g":"Special Light","b":1,"c":["Greisen","Grossular"]},"silver":{"n":"Silver","g":"Monochrome Medium II"},"siqoq":{"n":"Siqoq","g":"Monochrome Light II"},"skarn":{"n":"Skarn","g":"Cool Dark I"},"skull":{"n":"Skull","g":"Warm Light III","a":1,"s":"Crafted Applicators"},"sky":{"n":"Sky","g":"Cool Light II"},"slate":{"n":"Slate","g":"Monochrome Dark III","b":1},"smoked salt":{"n":"Smoked Salt","g":"Special Light","b":1,"c":["Jacinthe","Salt"]},"snakeroot":{"n":"Snakeroot","g":"Cool Medium I"},"snow":{"n":"Snow","g":"Monochrome Light I"},"sphalerite":{"n":"Sphalerite","g":"Monochrome Dark II","b":1},"spore":{"n":"Spore","g":"Special Medium","a":1,"s":"Monthly [Lunar Dreams]"},"squid":{"n":"Squid","g":"Cool Light III","b":1},"steel blue":{"n":"Steel Blue","g":"Special Medium","b":1,"c":["Maltese","Steele"]},"steele":{"n":"Steele","g":"Monochrome Medium II","b":1},"sterling":{"n":"Sterling","g":"Monochrome Medium II"},"storm":{"n":"Storm","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"striped flint":{"n":"Striped Flint","g":"Monochrome Medium III","b":1},"sulphur":{"n":"Sulphur","g":"Warm Medium II"},"tawny":{"n":"Tawny","g":"Warm Medium II"},"teardrop":{"n":"Teardrop","g":"Muted Light III","b":1},"tempest":{"n":"Tempest","g":"Special Dark","a":1,"s":"August [Cataclysms]"},"tide":{"n":"Tide","g":"Cool Medium II","b":1},"titanium":{"n":"Titanium","g":"Monochrome Light II"},"tobacco":{"n":"Tobacco","g":"Cool Dark I","b":1},"tombac":{"n":"Tombac","g":"Warm Light III","b":1},"topaz":{"n":"Topaz","g":"Cool Medium III","b":1},"tuff":{"n":"Tuff","g":"Muted Medium II"},"tumbleweed":{"n":"Tumbleweed","g":"Warm Light I","b":1},"tungsten":{"n":"Tungsten","g":"Cool Medium II"},"turquoise":{"n":"Turquoise","g":"Special Light","a":1,"s":"Monthly [Lunar Dreams]"},"typhoon":{"n":"Typhoon","g":"Special Dark","a":1,"s":"August [Cataclysms]"},"umbra":{"n":"Umbra","g":"Special Dark","a":1,"s":"Monthly [Lunar Dreams]"},"uumavoq":{"n":"Uumavoq","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"vanilla":{"n":"Vanilla","g":"Muted Medium II"},"vapor":{"n":"Vapor","g":"Cool Light II","b":1},"walnut":{"n":"Walnut","g":"Warm Dark I","b":1},"white":{"n":"White","g":"Monochrome Light I"},"willow":{"n":"Willow","g":"Muted Medium I","b":1},"windstorm":{"n":"Windstorm","g":"Special Medium","a":1,"s":"August [Cataclysms]"},"wisp":{"n":"Wisp","g":"Special Light","a":1,"s":"November [Coigreach]"},"wulfenite":{"n":"Wulfenite","g":"Warm Medium III","b":1},"xanthic":{"n":"Xanthic","g":"Warm Medium II","b":1},"yellow":{"n":"Yellow","g":"Warm Light II"},"zircon":{"n":"Zircon","g":"Muted Light III","b":1}},"eyes":{"albedo":{"n":"Albedo","f":["Amber","Blue","Orange","Selenelion"],"s":"Lunar Dreams applicator","a":1},"amber":{"n":"Amber","f":["Brown","Gold","Hazel","Orange","Yellow"],"s":"Customization"},"astrum":{"n":"Astrum","f":["Black","Blue","Ice","Red"],"s":"Lunar Dreams applicator","a":1},"azure":{"n":"Azure","f":["Blue","Ice"],"s":"Lunar Dreams applicator","a":1},"beaver moon":{"n":"Beaver Moon","f":["Amber","Orange","Red","Yellow"],"s":"Lunar Dreams applicator","a":1},"bioluminescent blue":{"n":"Bioluminescent Blue","f":["Black","Blue"],"s":"Lunar Dreams applicator","a":1},"bioluminescent indigo":{"n":"Bioluminescent Indigo","f":["Black","Blue","Indigo","Red"],"s":"Lunar Dreams applicator","a":1},"bioluminescent teal":{"n":"Bioluminescent Teal","f":["Blue","Green","Ice"],"s":"Lunar Dreams applicator","a":1},"biophoton":{"n":"Biophoton","f":["Blue","Green","Red"],"s":"Lunar Dreams applicator","a":1},"bismuth":{"n":"Bismuth","f":["Blue","Green","Indigo","Lavender","Purple","Red","Sapphire","Violet"],"s":"Raffle Studs","b":1},"black":{"n":"Black","f":["Gray","Red","White"],"s":"Customization"},"blend":{"n":"Blend","f":["Green","Hazel","Olive"],"s":"Cataclysms applicator","a":1},"blood eclipse":{"n":"Blood Eclipse","f":["Black","Copper","Red"],"s":"Lunar Dreams applicator","a":1},"blood moon":{"n":"Blood Moon","f":["Black","Bloodhound","Red"],"s":"Lunar Dreams applicator","a":1},"bloodhound":{"n":"Bloodhound","f":["Red","White"],"s":"Raffle Studs","b":1},"blue":{"n":"Blue","f":["Gray","Gray Blue","Olive"],"s":"NBW"},"blue moon":{"n":"Blue Moon","f":["Black","Blue","Ice","White"],"s":"Lunar Dreams applicator","a":1},"bone":{"n":"Bone","f":["Amber","Brown","White","Yellow"],"s":"Crafted applicator","a":1},"brown":{"n":"Brown","f":["Orange","Yellow"],"s":"NBW"},"calamity":{"n":"Calamity","f":["Blue","Gray","Olive"],"s":"Cataclysms applicator","a":1},"carapace":{"n":"Carapace","f":["Amber","Brown","Orange"],"s":"Crafted applicator","a":1},"cetacean":{"n":"Cetacean","f":["Black","Red"],"s":"Crafted applicator","a":1},"changeling":{"n":"Changeling","f":["Black","Gray","Red"],"s":"Coigreach applicator","a":1},"charged blue moon":{"n":"Charged Blue Moon","f":["Blue Moon","Green","Ice","Electric Green"],"s":"Lunar Dreams applicator","a":1},"chestnut brown":{"n":"Chestnut Brown","f":["Amber","Black","Brown"],"s":"Special NBWs"},"clay":{"n":"Clay","f":["Amber","Brown","Orange","White"],"s":"Customization"},"cold":{"n":"Cold","f":["Azure","Blue","Ice"],"s":"Lunar Dreams applicator","a":1},"cold moon":{"n":"Cold Moon","f":["Azure","Blue","Cold","Frost","Ice","White"],"s":"Lunar Dreams applicator","a":1},"copper":{"n":"Copper","f":["Amber","Brown","Orange"],"s":"Special NBWs"},"crotalus":{"n":"Crotalus","f":["Brown","Clay","Gray","White"],"s":"Crafted applicator","a":1},"cryptid":{"n":"Cryptid","f":["Black","Red"],"s":"Cataclysms applicator","a":1},"dark eclipse":{"n":"Dark Eclipse","f":["Black","Smoke","White"],"s":"Lunar Dreams applicator","a":1},"dark glass":{"n":"Dark Glass","f":["Black","Gray","Red"],"s":"Special NBWs"},"dark hazel":{"n":"Dark Hazel","f":["Black","Brown","Hazel","Olive"],"s":"Raffle Studs","b":1},"dorchas":{"n":"Dorchas","f":["Bioluminescent Teal","Black","Green","Mint"],"s":"Coigreach applicator","a":1},"dust":{"n":"Dust","f":["Black","Brown","Gray","Orange"],"s":"Raffle Studs","b":1},"electric blue":{"n":"Electric Blue","f":["Blue","Ice"],"s":"Lunar Dreams applicator","a":1},"electric green":{"n":"Electric Green","f":["Green","Olive"],"s":"Lunar Dreams applicator","a":1},"electric pink":{"n":"Electric Pink","f":["Blue","Purple","Red"],"s":"Lunar Dreams applicator","a":1},"electric white":{"n":"Electric White","f":["White","Gray"],"s":"Lunar Dreams applicator","a":1},"enzyme":{"n":"Enzyme","f":["Blue","Brown","Ice","Orange"],"s":"Lunar Dreams applicator","a":1},"essence - dream":{"n":"Essence - Dream","f":["Blue","Green","Ice","Purple","Red"],"s":"Lunar Dreams applicator","a":1},"fae":{"n":"Fae","f":["Green","Hazel","Red"],"s":"Coigreach applicator","a":1},"fearsome":{"n":"Fearsome","f":["Black","Red"],"s":"Cataclysms applicator","a":1},"fox":{"n":"Fox","f":["Amber","Brown","Hazel","Orange"],"s":"Crafted applicator","a":1},"frenzy":{"n":"Frenzy","f":["Blue","Red","Yellow"],"s":"Cataclysms applicator","a":1},"frost":{"n":"Frost","f":["Blue","Ice","White"],"s":"Lunar Dreams applicator","a":1},"fungi":{"n":"Fungi","f":["Purple","Violet","White","Yellow"],"s":"Lunar Dreams applicator","a":1},"glass":{"n":"Glass","f":["Blue","Brown","Green"],"s":"Special NBWs"},"goat sucker":{"n":"Goat Sucker","f":["Orange","Red","White"],"s":"Cataclysms applicator","a":1},"gold":{"n":"Gold","f":["Amber","Pale Gold","Yellow"],"s":"Customization"},"gray":{"n":"Gray","f":["Blue","Gray Blue","Gray Green","Olive"],"s":"NBW"},"gray blue":{"n":"Gray Blue","f":["Blue","Gray"],"s":"NBW"},"gray green":{"n":"Gray Green","f":["Gray","Olive"],"s":"NBW"},"green":{"n":"Green","f":["Blue","Hazel","Gray","Ice Green","Olive"],"s":"Customization"},"halo":{"n":"Halo","f":["Black","White"],"s":"Lunar Dreams applicator","a":1},"hazel":{"n":"Hazel","f":["Amber","Brown","Green","Orange"],"s":"Customization"},"hetero amber & gray":{"n":"Hetero Amber & Gray","f":["Amber","Gray"],"s":"Breed-Only","b":1},"hetero azure & indigo":{"n":"Hetero Azure & Indigo","f":["Azure","Indigo"],"s":"Breed-Only","b":1},"hetero bioluminescent blue & bioluminescent indigo":{"n":"Hetero Bioluminescent Blue & Bioluminescent Indigo","f":["Bioluminescent Blue","Bioluminescent Indigo"],"s":"Breed-Only","b":1},"hetero bioluminescent blue & bioluminescent teal":{"n":"Hetero Bioluminescent Blue & Bioluminescent Teal","f":["Bioluminescent Blue","Bioluminescent Teal"],"s":"Breed-Only","b":1},"hetero bioluminescent indigo & bioluminescent blue":{"n":"Hetero Bioluminescent Indigo & Bioluminescent Blue","f":["Bioluminescent Blue","Bioluminescent Indigo"],"s":"Breed-Only","b":1},"hetero bioluminescent indigo & bioluminescent teal":{"n":"Hetero Bioluminescent Indigo & Bioluminescent Teal","f":["Bioluminescent Indigo","Bioluminescent Teal"],"s":"Breed-Only","b":1},"hetero bioluminescent teal & bioluminescent blue":{"n":"Hetero Bioluminescent Teal & Bioluminescent Blue","f":["Bioluminescent Blue","Bioluminescent Teal"],"s":"Breed-Only","b":1},"hetero bioluminescent teal & bioluminescent indigo":{"n":"Hetero Bioluminescent Teal & Bioluminescent Indigo","f":["Bioluminescent Indigo","Bioluminescent Teal"],"s":"Breed-Only","b":1},"hetero black & white":{"n":"Hetero Black & White","f":["Black","White"],"s":"Breed-Only","b":1},"hetero blue & brown":{"n":"Hetero Blue & Brown","f":["Blue","Brown"],"s":"Breed-Only","b":1},"hetero blue moon & violet":{"n":"Hetero Blue Moon & Violet","f":["Blue Moon","Violet"],"s":"Breed-Only","b":1},"hetero bone & smoke":{"n":"Hetero Bone & Smoke","f":["Bone","Smoke"],"s":"Breed-Only","b":1},"hetero brown & blue":{"n":"Hetero Brown & Blue","f":["Blue","Brown"],"s":"Breed-Only","b":1},"hetero cold & insomnium":{"n":"Hetero Cold & Insomnium","f":["Cold","Insomnium"],"s":"Breed-Only","b":1},"hetero electric blue & electric green":{"n":"Hetero Electric Blue & Electric Green","f":["Electric Blue","Electric Green"],"s":"Breed-Only","b":1},"hetero electric blue & electric pink":{"n":"Hetero Electric Blue & Electric Pink","f":["Electric Blue","Electric Pink"],"s":"Breed-Only","b":1},"hetero electric blue & electric white":{"n":"Hetero Electric Blue & Electric White","f":["Electric Blue","Electric White"],"s":"Breed-Only","b":1},"hetero electric green & electric blue":{"n":"Hetero Electric Green & Electric Blue","f":["Electric Blue","Electric Green"],"s":"Breed-Only","b":1},"hetero electric green & electric pink":{"n":"Hetero Electric Green & Electric Pink","f":["Electric Green","Electric Pink"],"s":"Breed-Only","b":1},"hetero electric green & electric white":{"n":"Hetero Electric Green & Electric White","f":["Electric Green","Electric White"],"s":"Breed-Only","b":1},"hetero electric pink & electric blue":{"n":"Hetero Electric Pink & Electric Blue","f":["Electric Blue","Electric Pink"],"s":"Breed-Only","b":1},"hetero electric pink & electric green":{"n":"Hetero Electric Pink & Electric Green","f":["Electric Green","Electric Pink"],"s":"Breed-Only","b":1},"hetero electric pink & electric white":{"n":"Hetero Electric Pink & Electric White","f":["Electric Pink","Electric White"],"s":"Breed-Only","b":1},"hetero electric white & electric blue":{"n":"Hetero Electric White & Electric Blue","f":["Electric Blue","Electric White"],"s":"Breed-Only","b":1},"hetero electric white & electric green":{"n":"Hetero Electric White & Electric Green","f":["Electric Green","Electric White"],"s":"Breed-Only","b":1},"hetero electric white & electric pink":{"n":"Hetero Electric White & Electric Pink","f":["Electric Pink","Electric White"],"s":"Breed-Only","b":1},"hetero frost & somnium":{"n":"Hetero Frost & Somnium","f":["Frost","Somnium"],"s":"Breed-Only","b":1},"hetero gray & amber":{"n":"Hetero Gray & Amber","f":["Amber","Gray"],"s":"Breed-Only","b":1},"hetero green & yellow":{"n":"Hetero Green & Yellow","f":["Green","Yellow"],"s":"Breed-Only","b":1},"hetero hazel & husky":{"n":"Hetero Hazel & Husky","f":["Hazel","Husky"],"s":"Breed-Only","b":1},"hetero holly & novus":{"n":"Hetero Holly & Novus","f":["Holly","Novus"],"s":"Breed-Only","b":1},"hetero husky & hazel":{"n":"Hetero Husky & Hazel","f":["Hazel","Husky"],"s":"Breed-Only","b":1},"hetero indigo & azure":{"n":"Hetero Indigo & Azure","f":["Azure","Indigo"],"s":"Breed-Only","b":1},"hetero insomnium & cold":{"n":"Hetero Insomnium & Cold","f":["Cold","Insomnium"],"s":"Breed-Only","b":1},"hetero insomnium & saros":{"n":"Hetero Insomnium & Saros","f":["Insomnium","Saros"],"s":"Breed-Only","b":1},"hetero lumino & moonlight":{"n":"Hetero Lumino & Moonlight","f":["Lumino","Moonlight"],"s":"Breed-Only","b":1},"hetero lux & sapphire":{"n":"Hetero Lux & Sapphire","f":["Lux","Sapphire"],"s":"Breed-Only","b":1},"hetero moonglow & nightglow":{"n":"Hetero Moonglow & Nightglow","f":["Moonglow","Nightglow"],"s":"Breed-Only","b":1},"hetero moonlight & lumino":{"n":"Hetero Moonlight & Lumino","f":["Lumino","Moonlight"],"s":"Breed-Only","b":1},"hetero nightglow & moonglow":{"n":"Hetero Nightglow & Moonglow","f":["Moonglow","Nightglow"],"s":"Breed-Only","b":1},"hetero novus & holly":{"n":"Hetero Novus & Holly","f":["Holly","Novus"],"s":"Breed-Only","b":1},"hetero purple & saeculorum":{"n":"Hetero Purple & Saeculorum","f":["Purple","Saeculorum"],"s":"Breed-Only","b":1},"hetero red & storm":{"n":"Hetero Red & Storm","f":["Red","Storm"],"s":"Breed-Only","b":1},"hetero saeculorum & purple":{"n":"Hetero Saeculorum & Purple","f":["Purple","Saeculorum"],"s":"Breed-Only","b":1},"hetero sapphire & lux":{"n":"Hetero Sapphire & Lux","f":["Lux","Sapphire"],"s":"Breed-Only","b":1},"hetero saros & insomnium":{"n":"Hetero Saros & Insomnium","f":["Insomnium","Saros"],"s":"Breed-Only","b":1},"hetero selenelion & somnium":{"n":"Hetero Selenelion & Somnium","f":["Selenelion","Somnium"],"s":"Breed-Only","b":1},"hetero smoke & bone":{"n":"Hetero Smoke & Bone","f":["Bone","Smoke"],"s":"Breed-Only","b":1},"hetero somnium & frost":{"n":"Hetero Somnium & Frost","f":["Frost","Somnium"],"s":"Breed-Only","b":1},"hetero somnium & selenelion":{"n":"Hetero Somnium & Selenelion","f":["Selenelion","Somnium"],"s":"Breed-Only","b":1},"hetero storm & red":{"n":"Hetero Storm & Red","f":["Red","Storm"],"s":"Breed-Only","b":1},"hetero violet & blue moon":{"n":"Hetero Violet & Blue Moon","f":["Blue Moon","Violet"],"s":"Breed-Only","b":1},"hetero white & black":{"n":"Hetero White & Black","f":["Black","White"],"s":"Breed-Only","b":1},"hetero yellow & green":{"n":"Hetero Yellow & Green","f":["Green","Yellow"],"s":"Breed-Only","b":1},"hevl":{"n":"Hevl","f":["Blue","Ice","White"],"s":"Lunar Dreams applicator","a":1},"holly":{"n":"Holly","f":["Green","Red","Olive"],"s":"Raffle Studs","b":1},"honey":{"n":"Honey","f":["Amber","Brown","Orange"],"s":"Special NBWs"},"horizon":{"n":"Horizon","f":["Black","Blue","Ice"],"s":"Lunar Dreams applicator","a":1},"hurricane":{"n":"Hurricane","f":["Blue","Gray","Red"],"s":"Cataclysms applicator","a":1},"husky":{"n":"Husky","f":["Blue","Ice","White"],"s":"Raffle Studs","b":1},"ice":{"n":"Ice","f":["Blue","Gray","Ice Blue","White"],"s":"Customization"},"ice blue":{"n":"Ice Blue","f":["Blue","Ice"],"s":"NBW"},"ice green":{"n":"Ice Green","f":["Green","Ice"],"s":"Customization"},"indigo":{"n":"Indigo","f":["Blue","Red"],"s":"Lunar Dreams applicator","a":1},"insomnium":{"n":"Insomnium","f":["Blue","Green","Red"],"s":"Lunar Dreams applicator","a":1},"isuma":{"n":"Isuma","f":["Black","Gray","White"],"s":"Cataclysms applicator","a":1},"lavender":{"n":"Lavender","f":["Blue","Sapphire","Red","Violet"],"s":"Raffle Studs","b":1},"light glass":{"n":"Light Glass","f":["Clay","Ice","Yellow"],"s":"Special NBWs"},"luciferin":{"n":"Luciferin","f":["Black","Blue","Ice"],"s":"Lunar Dreams applicator","a":1},"lumino":{"n":"Lumino","f":["Blue","Green","Ice","Olive"],"s":"Lunar Dreams applicator","a":1},"luminosa":{"n":"Luminosa","f":["Black","Blue","Ice","White","Red"],"s":"Lunar Dreams applicator","a":1},"lunisolar":{"n":"Lunisolar","f":["Blue","Gray","Red","Violet"],"s":"Lunar Dreams applicator","a":1},"lux":{"n":"Lux","f":["Black","Blue"],"s":"Lunar Dreams applicator","a":1},"mascon":{"n":"Mascon","f":["Blue","Green","Indigo","Red"],"s":"Lunar Dreams applicator","a":1},"mercury":{"n":"Mercury","f":["Clay","Gray","Orange"],"s":"Special NBWs"},"metachrosis":{"n":"Metachrosis","f":["Azure","Blue","Red","Sapphire","Violet","Yellow"],"s":"Lunar Dreams applicator","a":1},"mint":{"n":"Mint","f":["Blue","Green","Ice","Yellow"],"s":"Raffle Studs","b":1},"missouri monster":{"n":"Missouri Monster","f":["Amber","Orange","Yellow"],"s":"Cataclysms applicator","a":1},"moonbeam":{"n":"Moonbeam","f":["Blue","Red","White","Yellow"],"s":"Lunar Dreams applicator","a":1},"moonglow":{"n":"Moonglow","f":["Clay","Gray","Orange"],"s":"Lunar Dreams applicator","a":1},"moonlight":{"n":"Moonlight","f":["Blue","Black","Ice","White"],"s":"Lunar Dreams applicator","a":1},"moonshine":{"n":"Moonshine","f":["Amber","Blue","Black","Yellow"],"s":"Lunar Dreams applicator","a":1},"neomenia":{"n":"Neomenia","f":["Black","Lunisolar","Violet"],"s":"Lunar Dreams applicator","a":1},"neutrum":{"n":"Neutrum","f":["Black","Purple","White","Yellow"],"s":"The Matchmaker applicator","a":1},"nightglow":{"n":"Nightglow","f":["Blue","Ice"],"s":"Lunar Dreams applicator","a":1},"novus":{"n":"Novus","f":["Blue","Dust","Storm"],"s":"Raffle Studs","b":1},"nox":{"n":"Nox","f":["Black","Blue","Red"],"s":"Lunar Dreams applicator","a":1},"olive":{"n":"Olive","f":["Blue","Gray","Gray Green"],"s":"NBW"},"orange":{"n":"Orange","f":["Brown","Yellow"],"s":"NBW"},"orchid":{"n":"Orchid","f":["Amber","Orange","Red"],"s":"The Matchmaker applicator","a":1},"pale gold":{"n":"Pale Gold","f":["Gold","Yellow"],"s":"NBW"},"pale red":{"n":"Pale Red","f":["Orange","Red"],"s":"Customization"},"passion":{"n":"Passion","f":["Blue","Green","Ice","Red"],"s":"The Matchmaker applicator","a":1},"photophore":{"n":"Photophore","f":["Black","Blue","Green","Moonshine","Orange","Yellow"],"s":"Lunar Dreams applicator","a":1},"puma":{"n":"Puma","f":["Green","Hazel","Olive"],"s":"Crafted applicator","a":1},"purple":{"n":"Purple","f":["Blue","Red"],"s":"Lunar Dreams applicator","a":1},"quake":{"n":"Quake","f":["Brown","Gold","Yellow"],"s":"Cataclysms applicator","a":1},"radiant":{"n":"Radiant","f":["Blue","Green","Ice"],"s":"Lunar Dreams applicator","a":1},"rangifer":{"n":"Rangifer","f":["Black","Brown","Hazel"],"s":"Crafted applicator","a":1},"red":{"n":"Red","f":["Amber","Black","Brown","Pale Red"],"s":"Customization"},"rhudd":{"n":"Rhudd","f":["Hazel","Red","White"],"s":"Coigreach applicator","a":1},"rose":{"n":"Rose","f":["Clay","Red","White"],"s":"The Matchmaker applicator","a":1},"rougarou":{"n":"Rougarou","f":["Pale Red","Red","White"],"s":"Cataclysms applicator","a":1},"saeculorum":{"n":"Saeculorum","f":["Black","Blue","Red"],"s":"Lunar Dreams applicator","a":1},"sapphire":{"n":"Sapphire","f":["Blue","Red"],"s":"Lunar Dreams applicator","a":1},"saprophyte":{"n":"Saprophyte","f":["Black","Orange","Red","Yellow"],"s":"Lunar Dreams applicator","a":1},"saros":{"n":"Saros","f":["Blue","Green","Red"],"s":"Lunar Dreams applicator","a":1},"scallop":{"n":"Scallop","f":["Amber","Brown","Orange","White"],"s":"Crafted applicator","a":1},"selenelion":{"n":"Selenelion","f":["Blue","Gray","Red"],"s":"Lunar Dreams applicator","a":1},"serene":{"n":"Serene","f":["Gray","Green"],"s":"Cataclysms applicator","a":1},"shagamaw":{"n":"Shagamaw","f":["Amber","Gold","Yellow"],"s":"Cataclysms applicator","a":1},"sickle moon":{"n":"Sickle Moon","f":["Black","Brown","Pale Gold","Yellow"],"s":"Lunar Dreams applicator","a":1},"smoke":{"n":"Smoke","f":["Black","Gray","Hetero Black & White","Hetero White & Black","White"],"s":"Raffle Studs","b":1},"snallygaster":{"n":"Snallygaster","f":["Green","Hazel","Olive"],"s":"Cataclysms applicator","a":1},"solar eclipse":{"n":"Solar Eclipse","f":["Black","Brown","Yellow"],"s":"Lunar Dreams applicator","a":1},"solstice":{"n":"Solstice","f":["Amber","Gray","Orange","Red","White","Yellow"],"s":"Lunar Dreams applicator","a":1},"somnium":{"n":"Somnium","f":["Blue","Ice","Red"],"s":"Lunar Dreams applicator","a":1},"soteira":{"n":"Soteira","f":["Green","Red","Yellow"],"s":"Halloween Spectacle applicator","a":1},"spectral":{"n":"Spectral","f":["Brown","Red","White"],"s":"Halloween Spectacle applicator","a":1},"spectrum":{"n":"Spectrum","f":["Blue","Green","Red","Yellow"],"s":"Lunar Dreams applicator","a":1},"steel blue":{"n":"Steel Blue","f":["Black","Blue","Gray"],"s":"Raffle Studs","b":1},"stellaris":{"n":"Stellaris","f":["Black","Blue","Green","Yellow"],"s":"Lunar Dreams applicator","a":1},"storm":{"n":"Storm","f":["Black","Blue","Gray"],"s":"Raffle Studs","b":1},"total eclipse":{"n":"Total Eclipse","f":["Blue","Indigo","Red"],"s":"Lunar Dreams applicator","a":1},"total solar eclipse":{"n":"Total Solar Eclipse","f":["Black","Brown","Solar Eclipse","Yellow"],"s":"Lunar Dreams applicator","a":1},"totality":{"n":"Totality","f":["Black","Brown","Gray","Red"],"s":"Lunar Dreams applicator","a":1},"tranquil":{"n":"Tranquil","f":["Brown","Gray","Hazel","White"],"s":"Cataclysms applicator","a":1},"vile":{"n":"Vile","f":["Black","Red"],"s":"Halloween Spectacle applicator","a":1},"violet":{"n":"Violet","f":["Blue","Red"],"s":"Lunar Dreams applicator","a":1},"virgo":{"n":"Virgo","f":["Black","Gray","Purple","White"],"s":"The Matchmaker applicator","a":1},"vision":{"n":"Vision","f":["Gray","Red"],"s":"Lunar Dreams applicator","a":1},"warm gray":{"n":"Warm Gray","f":["Black","Clay","Gray","White"],"s":"Special NBWs"},"white":{"n":"White","f":["Black","Gray","Ice"],"s":"Customization"},"wisp":{"n":"Wisp","f":["Green","Hazel","Olive","Yellow"],"s":"Coigreach applicator","a":1},"wolf moon":{"n":"Wolf Moon","f":["Green","Ice","Purple","Red","Somnium"],"s":"Lunar Dreams applicator","a":1},"yagou":{"n":"Yagou","f":["Amber","Green","Olive","Yellow"],"s":"Crafted applicator","a":1},"yellow":{"n":"Yellow","f":["Brown","Orange","Pale Gold"],"s":"NBW"}},"markSources":["Halloween Spectacle applicator","Marking Set Applicator [Crawl]","Cataclysms applicator","Markings Applicator [Abomination]","Marking Set Applicator [Notches]","Lunar Dreams applicator","Markings Applicator [Abyssal]","The Matchmaker applicator","Markings Applicator [Achilles]","Markings Applicator [Airglow]","Unfolded Markings Applicator [Airglow]","Markings Applicator [Akhlut]","Markings Applicator [Amaroq]","Springtide Howl Fayre applicator","Markings Set Applicator [Argus]","Markings Applicator [Amor]","Markings Set Applicator [Freckles]","Markings Set Applicator [Gallus]","Markings Set Applicator [Mosaic]","Markings Set Applicator [Peacock]","Markings Set Applicator [Splotches]","Markings Set Applicator [Streaks]","Coigreach applicator","Markings Applicator [Annwn]","Markings Applicator [Antumbra]","Markings Applicator [Aotrom]","Combo","Special Breeding Combo","Unfolded Markings Applicator [Artemis]","Markings Applicator [Artemis]","Marking Set Applicator [Argus]","NBWs and Customization","Special Breeding","Customization","Special NBWs","Echoes of the Ancient applicator","Marking Set Applicator [Epoch]","Marking Set Applicator [Freckles]","Marking Set Applicator [Gallus]","RMA-Exclusive","Raffle Studs","Marking Set Applicator [Mosaic]","Marking Set Applicator [Peacock]","Marking Set Applicator [Raptor]","Marking Set Applicator [Shimmer]","Marking Set Applicator [Splotches]","Marking Set Applicator [Streaks]","Markings Applicator [Beast]","Markings Applicator [Biform]","Unfolded Markings Applicator [Biform]","Marking Set Applicator [Ghast]","Marking Set Applicator [Shadow]","Marking Deviation","Marking Set Applicator [Wraith]","Markings Applicator [Caelum]","Unfolded Markings Applicator [Caelum]","Markings Applicator [Clover]","Markings Applicator [Corrupt]","Markings Applicator [Cryptid]","Unfolded Markings Applicator [Crystal]","Markings Applicator [Crystal]","Unfolded Markings Applicator [Cynthia]","Markings Applicator [Cynthia]","Unfolded Markings Applicator [Diana]","Markings Applicator [Diana]","Markings Applicator [Faelcu]","Markings Applicator [Fenestra]","Markings Applicator [Fuath]","Markings Applicator [Gaelach]","Markings Applicator [Ghost]","Markings Applicator [Gwyrdd]","Markings Applicator [Hadal]","Markings Applicator [Hecate]","Markings Applicator [Hestia]","Markings Applicator [Hurricane]","Markings Applicator [Hydrangea]","Marking Set Applciator [Streaks]","Markings Applicator [Kin]","Markings Applicator [Koma]","Markings Applicator [Leucippus]","Unfolded Markings Applicator [Losna]","Markings Applicator [Losna]","Unfolded Markings Applicator [Luna]","Markings Applicator [Luna]","Markings Applicator [Merged]","Markings Applicator [Monster]","Markings Applicator [Moondust]","Markings Applicator [Moonlight]","Unfolded Markings Applicator [Moonlight]","Markings Applicator [Moss]","Unfolded Markings Applicator [Nightchill]","Markings Applicator [Nightchill]","Markings Applicator [Odium]","Markings Applicator [Penumbra]","Markings Applicator [Reef]","Markings Applicator [Sappho]","Unfolded Markings Applicator [Selene]","Markings Applicator [Selene]","Markings Applicator [Sidhe]","Markings Applicator [Spore]","Markings Applicator [Storm]","Markings Applicator [Tempest]","Unfolded Markings Applicator [Turquoise]","Markings Applicator [Turquoise]","Markings Applicator [Typhoon]","Markings Applicator [Umbra]","Unfolded Markings Applicator [Umbra]","Markings Applicator [Uumavoq]","Markings Applicator [Windstorm]","Markings Applicator [Wisp]"],"marks":{"abomination crawl":[3,0,1],"abomination manicou":[3,2,3],"abomination notches":[3,0,4],"abomination opossum":[3,2,3],"abomination pulse":[3,2,3],"abomination wild stripes":[3,2,3],"abyssal inverted cross":[3,5,6],"abyssal lykoi":[3,5,6],"abyssal manicou":[3,5,6],"abyssal opossum":[3,5,6],"achilles aurora":[3,7,8],"achilles cross":[3,7,8],"achilles ornate waves":[3,7,8],"achilles undercoat":[3,7,8],"airglow agouti":[3,5,9],"airglow arapawa coat":[3,5,10],"airglow cracks":[3,5,10],"airglow fringe":[3,5,10],"airglow light husky":[3,5,10],"airglow lykoi":[3,5,10],"airglow ornate blotches":[3,5,9],"airglow ornate spots":[3,5,10],"airglow ornate waves":[3,5,9],"airglow shaded":[3,5,9],"airglow smoke":[3,5,10],"airglow urajiro":[3,5,10],"akhlut inverted cross":[3,2,11],"akhlut lupos":[3,2,11],"akhlut pulse":[3,2,11],"akhlut sallander":[3,2,11],"amaroq arapawa coat":[3,2,12],"amaroq inverted cross":[3,2,12],"amaroq orca":[3,2,12],"amaroq wild stripes":[3,2,12],"amor argus":[3,13,14],"amor cracks":[3,7,15],"amor freckles":[3,13,16],"amor gallus":[3,13,17],"amor inverted cross":[3,7,15],"amor mosaic":[3,13,18],"amor peacock":[3,13,19],"amor splotches":[3,13,20],"amor streaks":[3,13,21],"amor tamaskan unders":[3,7,15],"amor undersides":[3,7,15],"annwn manicou":[3,22,23],"annwn ornate stripes":[3,22,23],"annwn ornate waves":[3,22,23],"annwn veneer":[3,22,23],"antumbra orca":[3,5,24],"antumbra ornate waves":[3,5,24],"antumbra shimmer":[3,5,24],"antumbra unders":[3,5,24],"aotrom cross":[3,22,25],"aotrom inuit unders":[3,22,25],"aotrom sallander":[3,22,25],"aotrom wild stripes":[3,22,25],"argent arapawa coat":[6,26],"argent back heavy patch":[6,26],"argent back patch":[6,26],"argent blaze":[6,26],"argent bottoms":[6,26],"argent brindle":[10,27],"argent cape":[6,26],"argent cape ticking":[6,26],"argent carnage":[6,26],"argent cheek fluff":[6,26],"argent chest":[6,26],"argent chipmunk back stripes":[6,26],"argent chipmunk head stripes":[6,26],"argent ear tips":[6,26],"argent elbows":[6,26],"argent epoch":[6,26],"argent eyebrows":[6,26],"argent gentle unders":[6,26],"argent grizzle":[6,26],"argent half cape":[6,26],"argent half cape ticking":[6,26],"argent half mask":[6,26],"argent half socks":[6,26],"argent heavy husky":[6,26],"argent highlights":[6,26],"argent inner ear":[6,26],"argent inuit unders":[6,26],"argent inverted agouti":[6,26],"argent inverted panda":[6,26],"argent irish":[6,26],"argent light husky":[6,26],"argent low bottoms":[6,26],"argent mask":[6,26],"argent medium husky":[6,26],"argent merle":[6,26],"argent merle heavy":[6,26],"argent merle scarce":[6,26],"argent muzzle":[6,26],"argent muzzle patch":[6,26],"argent neck":[6,26],"argent neck band":[6,26],"argent nose bridge":[6,26],"argent nose line":[6,26],"argent orca":[6,26],"argent patchy unders":[6,26],"argent predator":[6,26],"argent raptor":[6,26],"argent soay unders":[6,26],"argent socks":[6,26],"argent tamaskan unders":[6,26],"argent throat":[6,26],"argent throat patch":[6,26],"argent toes":[6,26],"argent trim":[6,26],"argent tuxedo":[6,26],"argent underbelly":[6,26],"argent undercoat":[6,26],"argent underfur":[6,26],"argent unders":[6,26],"argent undersides":[6,26],"argent urajiro":[6,26],"argent whitetail spots":[6,26],"argent wolverine":[6,26],"artemis argus":[3,5,28],"artemis aurora":[3,5,28],"artemis crawl":[3,5,28],"artemis cross":[3,5,28],"artemis fringe":[3,5,28],"artemis inverted smudge":[3,5,29],"artemis notches":[3,5,28],"artemis ornate stripes":[3,5,29],"artemis ornate waves":[3,5,29],"artemis pulse":[3,5,28],"artemis sallander":[3,5,29],"artemis wraith":[3,5,28],"arthia argus":[6,26],"arthia aurora":[6,26],"arthia crawl":[6,26],"arthia cross":[6,26],"arthia fringe":[6,26],"arthia inverted smudge":[6,26],"arthia notches":[6,26],"arthia ornate stripes":[6,26],"arthia ornate waves":[6,26],"arthia pulse":[6,26],"arthia sallander":[6,26],"arthia wraith":[6,26],"aspen argus":[3,13,30],"aspen back":[0,31],"aspen back half patch":[0,31],"aspen back heavy patch":[0,31],"aspen back patch":[0,31],"aspen blaze":[0,31],"aspen bottoms":[0,31],"aspen brindle":[4,32],"aspen cape":[0,31],"aspen cape ticking":[0,31],"aspen carnage":[1,33],"aspen cheek fluff":[1,33],"aspen chipmunk back stripes":[8,34],"aspen chipmunk head stripes":[8,34],"aspen dilution":[0,31],"aspen ear tips":[1,33],"aspen elbow patch":[0,31],"aspen elbows":[0,31],"aspen epoch":[3,35,36],"aspen eyebrows":[1,33],"aspen freckles":[3,13,37],"aspen gallus":[3,13,38],"aspen gentle unders":[1,33],"aspen grizzle":[0,31],"aspen half cape":[0,31],"aspen half cape ticking":[0,31],"aspen half socks":[1,33],"aspen heavy husky":[1,33],"aspen highlights":[1,33],"aspen inner ear":[1,33],"aspen inuit unders":[7,39],"aspen inverted agouti":[0,31],"aspen inverted cross":[1,33],"aspen inverted manicou":[8,34],"aspen inverted opossum":[8,34],"aspen inverted panda":[2,40],"aspen irish":[0,31],"aspen light husky":[1,33],"aspen limbs":[1,33],"aspen low bottoms":[0,31],"aspen lupos":[2,40],"aspen marbled unders":[1,33],"aspen medium husky":[1,33],"aspen mosaic":[3,13,41],"aspen muzzle":[1,33],"aspen muzzle patch":[1,33],"aspen neck":[0,31],"aspen neck band":[0,31],"aspen orca":[2,40],"aspen patchy unders":[1,33],"aspen paws":[1,33],"aspen peacock":[3,13,42],"aspen points":[8,34],"aspen predator":[1,33],"aspen raptor":[3,35,43],"aspen sallander":[8,34],"aspen shimmer":[3,0,44],"aspen shoulder patch":[0,31],"aspen soay unders":[8,34],"aspen socks":[1,33],"aspen spectacles":[1,33],"aspen splotches":[3,13,45],"aspen streaks":[3,13,46],"aspen tamaskan unders":[7,39],"aspen throat":[0,31],"aspen throat patch":[0,31],"aspen toes":[1,33],"aspen trim":[1,33],"aspen tuxedo":[1,33],"aspen underbelly":[0,31],"aspen undercoat":[1,33],"aspen underfur":[0,31],"aspen unders":[0,31],"aspen undersides":[0,31],"aspen urajiro":[1,33],"aspen whitetail spots":[8,34],"aspen wolverine":[8,34],"auburn agouti":[6,26],"auburn arapawa coat":[6,26],"auburn back":[6,26],"auburn back edge patch":[6,26],"auburn butcher":[6,26],"auburn carnage":[6,26],"auburn catshark heavy":[6,26],"auburn catshark light":[6,26],"auburn cougar":[6,26],"auburn cover":[6,26],"auburn crawl":[6,26],"auburn dilution":[6,26],"auburn dorsal":[6,26],"auburn elbow patch":[6,26],"auburn forehead":[6,26],"auburn ghast":[6,26],"auburn half dorsal":[6,26],"auburn half mask":[6,26],"auburn inverted cross":[6,26],"auburn leopard shark":[6,26],"auburn lupos":[6,26],"auburn mantle":[6,26],"auburn mask":[6,26],"auburn notches":[6,26],"auburn panda":[6,26],"auburn patchy unders":[6,26],"auburn points":[6,26],"auburn predator":[6,26],"auburn sakiz mask":[6,26],"auburn sallander":[6,26],"auburn shaded":[6,26],"auburn shadow":[6,26],"auburn smoke":[6,26],"auburn smudge":[6,26],"auburn smudge heavy":[6,26],"auburn spectacles":[6,26],"auburn undercoat":[6,26],"auburn unders":[6,26],"auburn vixen points":[6,26],"auburn wings":[6,26],"auburn wings heavy":[6,26],"auburn wings scarce":[6,26],"auburn wraith":[6,26],"beast crawl":[3,0,1],"beast cross":[3,2,47],"beast notches":[3,0,4],"beast sallander":[3,2,47],"beast undercoat":[3,2,47],"beast wild stripes":[3,2,47],"beige back half patch":[0,31],"beige back heavy patch":[0,31],"beige back patch":[0,31],"beige blaze":[0,31],"beige bottoms":[0,31],"beige brindle":[4,32],"beige butcher":[1,33],"beige cape":[0,31],"beige cape ticking":[0,31],"beige carnage":[1,33],"beige cheek fluff":[1,33],"beige chipmunk back stripes":[8,34],"beige chipmunk head stripes":[8,34],"beige dilution":[0,31],"beige ear tips":[1,33],"beige elbow patch":[0,31],"beige elbows":[0,31],"beige epoch":[3,35,36],"beige eyebrows":[1,33],"beige gentle unders":[1,33],"beige grizzle":[0,31],"beige half cape":[0,31],"beige half cape ticking":[0,31],"beige half socks":[1,33],"beige heavy husky":[1,33],"beige inner ear":[1,33],"beige inuit unders":[7,39],"beige inverted agouti":[0,31],"beige inverted manicou":[8,34],"beige inverted opossum":[8,34],"beige inverted panda":[2,40],"beige irish":[0,31],"beige light husky":[1,33],"beige limbs":[1,33],"beige low bottoms":[0,31],"beige marbled unders":[1,33],"beige medium husky":[1,33],"beige muzzle patch":[1,33],"beige neck":[0,31],"beige neck band":[0,31],"beige orca":[2,40],"beige patchy unders":[1,33],"beige paws":[1,33],"beige predator":[1,33],"beige raptor":[3,35,43],"beige sallander":[8,34],"beige shimmer":[3,0,44],"beige soay unders":[8,34],"beige socks":[1,33],"beige spectacles":[1,33],"beige tamaskan unders":[7,39],"beige throat":[0,31],"beige throat patch":[0,31],"beige toes":[1,33],"beige trim":[1,33],"beige tuxedo":[1,33],"beige underbelly":[0,31],"beige undercoat":[1,33],"beige underfur":[0,31],"beige unders":[0,31],"beige undersides":[0,31],"beige urajiro":[1,33],"beige whitetail spots":[8,34],"beige wolverine":[8,34],"biform argus":[3,13,30],"biform aurora":[3,5,48],"biform cracks":[3,5,49],"biform freckles":[3,13,37],"biform fringe":[3,5,49],"biform gallus":[3,13,38],"biform inverted smudge":[3,5,49],"biform lykoi":[3,5,49],"biform mosaic":[3,13,41],"biform nautilus":[3,5,49],"biform patchy unders":[3,5,48],"biform peacock":[3,13,42],"biform shaded":[3,5,48],"biform shadow":[3,5,49],"biform splotches":[3,13,45],"biform streaks":[3,13,46],"biform undercoat":[3,5,49],"biform wild stripes":[3,5,48],"biform wraith":[3,5,49],"black agouti":[0,31],"black arapawa coat":[8,34],"black argus":[3,13,30],"black back":[0,31],"black back edge patch":[0,31],"black back half patch":[0,31],"black back heavy patch":[0,31],"black back patch":[0,31],"black back stripe":[1,33],"black belly stripe":[1,33],"black blanket":[0,31],"black blanket ticking":[0,31],"black butcher":[1,33],"black cape":[0,31],"black cape ticking":[0,31],"black carnage":[1,33],"black catshark heavy":[2,40],"black catshark light":[2,40],"black cheek fluff":[1,33],"black chest":[0,31],"black chest stripe":[1,33],"black cougar":[2,40],"black cover":[1,33],"black crawl":[3,0,1],"black cross":[1,33],"black dilution":[0,31],"black dorsal":[0,31],"black elbow patch":[0,31],"black eyebrows":[1,33],"black forehead":[1,33],"black freckles":[3,13,37],"black full mask":[0,31],"black full rump":[1,33],"black gallus":[3,13,38],"black ghast":[3,0,50],"black half cape":[0,31],"black half cape ticking":[0,31],"black half cover":[1,33],"black half dorsal":[0,31],"black half mask":[0,31],"black half saddle":[0,31],"black half stripe":[1,33],"black head stripe":[1,33],"black inuit unders":[7,39],"black inverted brindle":[4,32],"black inverted cross":[1,33],"black leopard shark":[2,40],"black limbs":[1,33],"black lupos":[2,40],"black manicou":[8,34],"black mantle":[0,31],"black mask":[0,31],"black merle heavy patches":[2,40],"black merle patches":[2,40],"black merle scarce patches":[2,40],"black mosaic":[3,13,41],"black muzzle patch":[1,33],"black neck":[0,31],"black neck band":[0,31],"black neck stripe":[1,33],"black nose bridge":[0,31],"black notches":[3,0,4],"black opossum":[8,34],"black panda":[2,40],"black patchy unders":[1,33],"black peacock":[3,13,42],"black points":[8,34],"black predator":[1,33],"black rump":[1,33],"black rump edge":[1,33],"black rump patch":[1,33],"black rump stripe":[1,33],"black saddle":[0,31],"black saddle ticking":[0,31],"black sakiz mask":[8,34],"black sallander":[8,34],"black shaded":[8,34],"black shadow":[3,0,51],"black shepherd":[0,31],"black shepherd heavy":[0,52],"black shoulder patch":[0,31],"black shoulders":[0,31],"black smoke":[8,34],"black smudge":[1,33],"black smudge heavy":[1,33],"black snout":[1,33],"black spectacles":[1,33],"black splotches":[3,13,45],"black stained limbs":[1,33],"black streaks":[3,13,46],"black tail tip":[0,31],"black throat":[0,31],"black throat patch":[0,31],"black trim":[1,33],"black undercoat":[1,33],"black unders":[0,31],"black vixen points":[8,34],"black wings":[2,40],"black wings heavy":[2,40],"black wings scarce":[2,40],"black wraith":[3,0,53],"brown agouti":[0,31],"brown arapawa coat":[8,34],"brown argus":[3,13,30],"brown back":[0,31],"brown back edge patch":[0,31],"brown back half patch":[0,31],"brown back heavy patch":[0,31],"brown back patch":[0,31],"brown back stripe":[1,33],"brown belly stripe":[1,33],"brown blanket":[0,31],"brown blanket ticking":[0,31],"brown butcher":[1,33],"brown cape":[0,31],"brown cape ticking":[0,31],"brown carnage":[1,33],"brown catshark heavy":[2,40],"brown catshark light":[2,40],"brown cheek fluff":[1,33],"brown chest":[0,31],"brown chest stripe":[1,33],"brown cougar":[2,40],"brown cover":[1,33],"brown crawl":[3,0,1],"brown cross":[1,33],"brown dilution":[0,31],"brown dorsal":[0,31],"brown eyebrows":[1,33],"brown forehead":[1,33],"brown freckles":[3,13,37],"brown full mask":[0,31],"brown full rump":[1,33],"brown gallus":[3,13,38],"brown ghast":[3,0,50],"brown half cape":[0,31],"brown half cape ticking":[0,31],"brown half cover":[1,33],"brown half dorsal":[0,31],"brown half mask":[0,31],"brown half saddle":[0,31],"brown half stripe":[1,33],"brown head stripe":[1,33],"brown inuit unders":[7,39],"brown inverted brindle":[4,32],"brown inverted cross":[1,33],"brown leopard shark":[2,40],"brown limbs":[1,33],"brown lupos":[2,40],"brown manicou":[8,34],"brown mantle":[0,31],"brown mask":[0,31],"brown merle heavy patches":[2,40],"brown merle patches":[2,40],"brown merle scarce patches":[2,40],"brown mosaic":[3,13,41],"brown neck":[0,31],"brown neck band":[0,31],"brown neck stripe":[1,33],"brown notches":[3,0,4],"brown opossum":[8,34],"brown panda":[2,40],"brown peacock":[3,13,42],"brown points":[8,34],"brown rump":[1,33],"brown rump edge":[1,33],"brown rump patch":[1,33],"brown rump stripe":[1,33],"brown saddle":[0,31],"brown saddle ticking":[0,31],"brown sakiz mask":[8,34],"brown shaded":[8,34],"brown shadow":[3,0,51],"brown shepherd":[0,31],"brown shepherd heavy":[0,52],"brown shoulder patch":[0,31],"brown shoulders":[0,31],"brown smoke":[8,34],"brown smudge":[1,33],"brown smudge heavy":[1,33],"brown snout":[1,33],"brown splotches":[3,13,45],"brown stained limbs":[1,33],"brown streaks":[3,13,46],"brown tail tip":[0,31],"brown undercoat":[1,33],"brown unders":[0,31],"brown vixen points":[8,34],"brown wings":[2,40],"brown wings heavy":[2,40],"brown wings scarce":[2,40],"brown wraith":[3,0,53],"caelum aurora":[3,5,54],"caelum carnage":[3,5,55],"caelum fringe":[3,5,55],"caelum inverted cross":[3,5,54],"caelum nautilus":[3,5,55],"caelum ornate stripes":[3,5,55],"caelum ornate waves":[3,5,55],"caelum predator":[3,5,55],"caelum sallander":[3,5,55],"caelum smudge heavy":[3,5,54],"caelum sprite":[3,5,55],"caelum veneer":[3,5,54],"cedar agouti":[0,31],"cedar argus":[3,13,30],"cedar back":[0,31],"cedar back half patch":[0,31],"cedar back heavy patch":[0,31],"cedar back patch":[0,31],"cedar blaze":[0,31],"cedar bottoms":[0,31],"cedar brindle":[4,32],"cedar cape":[0,31],"cedar cape ticking":[0,31],"cedar carnage":[1,33],"cedar cheek fluff":[1,33],"cedar chest":[0,31],"cedar chipmunk back stripes":[8,34],"cedar chipmunk head stripes":[8,34],"cedar cover":[1,33],"cedar dilution":[0,31],"cedar dorsal":[0,31],"cedar ear tips":[1,33],"cedar elbow patch":[0,31],"cedar elbows":[0,31],"cedar epoch":[3,35,36],"cedar eyebrows":[1,33],"cedar freckles":[3,13,37],"cedar gallus":[3,13,38],"cedar gentle unders":[1,33],"cedar grizzle":[0,31],"cedar half cape":[0,31],"cedar half cape ticking":[0,31],"cedar half socks":[1,33],"cedar heavy husky":[1,33],"cedar highlights":[1,33],"cedar inner ear":[1,33],"cedar inuit unders":[7,39],"cedar inverted agouti":[0,31],"cedar inverted cross":[1,33],"cedar irish":[0,31],"cedar light husky":[1,33],"cedar limbs":[1,33],"cedar low bottoms":[0,31],"cedar lupos":[2,40],"cedar mantle":[0,31],"cedar marbled unders":[1,33],"cedar medium husky":[1,33],"cedar mosaic":[3,13,41],"cedar muzzle patch":[1,33],"cedar neck":[0,31],"cedar neck band":[0,31],"cedar nose line":[0,31],"cedar orca":[2,40],"cedar patchy unders":[1,33],"cedar paws":[1,33],"cedar peacock":[3,13,42],"cedar points":[8,34],"cedar predator":[1,33],"cedar raptor":[3,35,43],"cedar sallander":[8,34],"cedar shoulder patch":[0,31],"cedar snout":[1,33],"cedar soay unders":[8,34],"cedar socks":[1,33],"cedar spectacles":[1,33],"cedar splotches":[3,13,45],"cedar streaks":[3,13,46],"cedar tail tip":[0,31],"cedar tamaskan unders":[7,39],"cedar throat":[0,31],"cedar throat patch":[0,31],"cedar toes":[1,33],"cedar trim":[1,33],"cedar tuxedo":[1,33],"cedar underbelly":[0,31],"cedar undercoat":[1,33],"cedar underfur":[0,31],"cedar unders":[0,31],"cedar undersides":[0,31],"cedar urajiro":[1,33],"cedar whitetail spots":[8,34],"cedar wolverine":[8,34],"clover lupos":[3,22,56],"clover ornate spots":[3,22,56],"clover ornate stripes":[3,22,56],"clover undersides":[3,22,56],"cocoa arapawa coat":[6,26],"cocoa back":[6,26],"cocoa back half patch":[6,26],"cocoa back heavy patch":[6,26],"cocoa back patch":[6,26],"cocoa butcher":[6,26],"cocoa cape":[6,26],"cocoa cape ticking":[6,26],"cocoa carnage":[6,26],"cocoa cheek fluff":[6,26],"cocoa dilution":[6,26],"cocoa elbow patch":[6,26],"cocoa eyebrows":[6,26],"cocoa half cape":[6,26],"cocoa half cape ticking":[6,26],"cocoa inuit unders":[6,26],"cocoa inverted cross":[6,26],"cocoa limbs":[6,26],"cocoa lupos":[6,26],"cocoa muzzle patch":[6,26],"cocoa neck":[6,26],"cocoa neck band":[6,26],"cocoa patchy unders":[6,26],"cocoa points":[6,26],"cocoa predator":[6,26],"cocoa sallander":[6,26],"cocoa shoulder patch":[6,26],"cocoa spectacles":[6,26],"cocoa throat":[6,26],"cocoa throat patch":[6,26],"cocoa trim":[6,26],"cocoa undercoat":[6,26],"cocoa unders":[6,26],"corrupt ghast":[3,0,57],"corrupt gleam":[3,0,57],"corrupt pulse":[3,0,57],"corrupt wraith":[3,0,57],"cream arapawa coat":[8,34],"cream back":[0,31],"cream back half patch":[0,31],"cream back heavy patch":[0,31],"cream back patch":[0,31],"cream blaze":[0,31],"cream bottoms":[0,31],"cream brindle":[4,32],"cream butcher":[1,33],"cream cape":[0,31],"cream cape ticking":[0,31],"cream carnage":[1,33],"cream cheek fluff":[1,33],"cream chipmunk back stripes":[8,34],"cream chipmunk head stripes":[8,34],"cream dilution":[0,31],"cream ear tips":[1,33],"cream elbow patch":[0,31],"cream elbows":[0,31],"cream epoch":[3,35,36],"cream eyebrows":[1,33],"cream gentle unders":[1,33],"cream grizzle":[0,31],"cream half cape":[0,31],"cream half cape ticking":[0,31],"cream half socks":[1,33],"cream heavy husky":[1,33],"cream highlights":[1,33],"cream inner ear":[1,33],"cream inuit unders":[7,39],"cream inverted agouti":[0,31],"cream inverted cross":[1,33],"cream inverted manicou":[8,34],"cream inverted opossum":[8,34],"cream inverted panda":[2,40],"cream irish":[0,31],"cream light husky":[1,33],"cream limbs":[1,33],"cream low bottoms":[0,31],"cream lupos":[2,40],"cream marbled unders":[1,33],"cream medium husky":[1,33],"cream merle":[2,40],"cream merle heavy":[2,40],"cream merle scarce":[2,40],"cream muzzle patch":[1,33],"cream neck":[0,31],"cream neck band":[0,31],"cream orca":[2,40],"cream patchy unders":[1,33],"cream paws":[1,33],"cream points":[8,34],"cream predator":[1,33],"cream raptor":[3,35,43],"cream sallander":[8,34],"cream shimmer":[3,0,44],"cream shoulder patch":[0,31],"cream soay unders":[8,34],"cream socks":[1,33],"cream spectacles":[1,33],"cream tamaskan unders":[7,39],"cream throat":[0,31],"cream throat patch":[0,31],"cream toes":[1,33],"cream trim":[1,33],"cream tuxedo":[1,33],"cream underbelly":[0,31],"cream undercoat":[1,33],"cream underfur":[0,31],"cream unders":[0,31],"cream undersides":[0,31],"cream urajiro":[1,33],"cream whitetail spots":[8,34],"cream wolverine":[8,34],"cryptid arapawa coat":[3,2,58],"cryptid crawl":[3,2,58],"cryptid crestline":[3,2,58],"cryptid pulse":[3,2,58],"crystal blight":[3,5,59],"crystal cracks":[3,5,59],"crystal crescent":[3,5,59],"crystal crestline":[3,5,59],"crystal lykoi":[3,5,59],"crystal orca":[3,5,60],"crystal ornate blotches":[3,5,59],"crystal ornate spots":[3,5,60],"crystal pulse":[3,5,59],"crystal shadow":[3,5,60],"crystal sprite":[3,5,59],"crystal wild stripes":[3,5,60],"cynthia argus":[3,5,61],"cynthia aurora":[3,5,62],"cynthia crawl":[3,5,61],"cynthia cross":[3,5,62],"cynthia fringe":[3,5,61],"cynthia inverted smudge":[3,5,61],"cynthia notches":[3,5,61],"cynthia ornate stripes":[3,5,61],"cynthia ornate waves":[3,5,61],"cynthia pulse":[3,5,62],"cynthia sallander":[3,5,61],"cynthia wraith":[3,5,62],"dark brown agouti":[0,31],"dark brown arapawa coat":[8,34],"dark brown argus":[3,13,30],"dark brown back":[0,31],"dark brown back edge patch":[0,31],"dark brown back half patch":[0,31],"dark brown back heavy patch":[0,31],"dark brown back patch":[0,31],"dark brown back stripe":[1,33],"dark brown belly stripe":[1,33],"dark brown blanket":[0,31],"dark brown blanket ticking":[0,31],"dark brown butcher":[1,33],"dark brown cape":[0,31],"dark brown cape ticking":[0,31],"dark brown catshark heavy":[2,40],"dark brown catshark light":[2,40],"dark brown chest":[0,31],"dark brown chest stripe":[1,33],"dark brown cover":[1,33],"dark brown crawl":[3,0,1],"dark brown cross":[1,33],"dark brown dorsal":[0,31],"dark brown forehead":[1,33],"dark brown freckles":[3,13,37],"dark brown full rump":[1,33],"dark brown gallus":[3,13,38],"dark brown ghast":[3,0,50],"dark brown half cape":[0,31],"dark brown half cape ticking":[0,31],"dark brown half cover":[1,33],"dark brown half dorsal":[0,31],"dark brown half mask":[0,31],"dark brown half saddle":[0,31],"dark brown half stripe":[1,33],"dark brown head stripe":[1,33],"dark brown inverted brindle":[4,32],"dark brown inverted cross":[1,33],"dark brown leopard shark":[2,40],"dark brown limbs":[1,33],"dark brown lupos":[2,40],"dark brown manicou":[8,34],"dark brown mantle":[0,31],"dark brown mask":[0,31],"dark brown merle heavy patches":[2,40],"dark brown merle patches":[2,40],"dark brown merle scarce patches":[2,40],"dark brown mosaic":[3,13,41],"dark brown neck":[0,31],"dark brown neck band":[0,31],"dark brown neck stripe":[1,33],"dark brown notches":[3,0,4],"dark brown opossum":[8,34],"dark brown panda":[2,40],"dark brown peacock":[3,13,42],"dark brown points":[8,34],"dark brown rump":[1,33],"dark brown rump edge":[1,33],"dark brown rump patch":[1,33],"dark brown rump stripe":[1,33],"dark brown saddle":[0,31],"dark brown saddle ticking":[0,31],"dark brown sakiz mask":[8,34],"dark brown sallander":[8,34],"dark brown shadow":[3,0,51],"dark brown shepherd":[0,31],"dark brown shepherd heavy":[0,52],"dark brown shoulder patch":[0,31],"dark brown shoulders":[0,31],"dark brown smoke":[8,34],"dark brown smudge":[1,33],"dark brown smudge heavy":[1,33],"dark brown snout":[1,33],"dark brown splotches":[3,13,45],"dark brown stained limbs":[1,33],"dark brown streaks":[3,13,46],"dark brown tail tip":[0,31],"dark brown undercoat":[1,33],"dark brown unders":[0,31],"dark brown vixen points":[8,34],"dark brown wings":[2,40],"dark brown wings heavy":[2,40],"dark brown wings scarce":[2,40],"dark brown wraith":[3,0,53],"dark crystal blight":[6,26],"dark crystal cracks":[6,26],"dark crystal crescent":[6,26],"dark crystal crestline":[6,26],"dark crystal lykoi":[6,26],"dark crystal orca":[6,26],"dark crystal ornate blotches":[6,26],"dark crystal ornate spots":[6,26],"dark crystal pulse":[6,26],"dark crystal shadow":[6,26],"dark crystal sprite":[6,26],"dark crystal wild stripes":[6,26],"deira back half patch":[6,26],"deira back heavy patch":[6,26],"deira back patch":[6,26],"deira bottoms":[6,26],"deira brindle":[10,27],"deira butcher":[6,26],"deira cape":[6,26],"deira carnage":[6,26],"deira chipmunk back stripes":[6,26],"deira chipmunk head stripes":[6,26],"deira dilution":[6,26],"deira ear tips":[6,26],"deira epoch":[6,26],"deira eyebrows":[6,26],"deira gentle unders":[6,26],"deira grizzle":[6,26],"deira half socks":[6,26],"deira heavy husky":[6,26],"deira inuit unders":[6,26],"deira inverted agouti":[6,26],"deira inverted manicou":[6,26],"deira inverted opossum":[6,26],"deira inverted panda":[6,26],"deira light husky":[6,26],"deira limbs":[6,26],"deira low bottoms":[6,26],"deira medium husky":[6,26],"deira neck band":[6,26],"deira orca":[6,26],"deira patchy unders":[6,26],"deira paws":[6,26],"deira predator":[6,26],"deira raptor":[6,26],"deira shimmer":[6,26],"deira soay unders":[6,26],"deira socks":[6,26],"deira spectacles":[6,26],"deira tamaskan unders":[6,26],"deira throat patch":[6,26],"deira trim":[6,26],"deira tuxedo":[6,26],"deira underbelly":[6,26],"deira undercoat":[6,26],"deira underfur":[6,26],"deira unders":[6,26],"deira undersides":[6,26],"deira urajiro":[6,26],"deira wolverine":[6,26],"diaelum aurora":[6,26],"diaelum carnage":[6,26],"diaelum fringe":[6,26],"diaelum inverted cross":[6,26],"diaelum nautilus":[6,26],"diaelum ornate stripes":[6,26],"diaelum ornate waves":[6,26],"diaelum predator":[6,26],"diaelum sallander":[6,26],"diaelum smudge heavy":[6,26],"diaelum sprite":[6,26],"diaelum veneer":[6,26],"diana aurora":[3,5,63],"diana carnage":[3,5,64],"diana fringe":[3,5,63],"diana inverted cross":[3,5,63],"diana nautilus":[3,5,63],"diana ornate stripes":[3,5,63],"diana ornate waves":[3,5,63],"diana predator":[3,5,64],"diana sallander":[3,5,64],"diana smudge heavy":[3,5,63],"diana sprite":[3,5,64],"diana veneer":[3,5,63],"dinar agouti":[6,26],"dinar arapawa coat":[6,26],"dinar back":[6,26],"dinar back edge patch":[6,26],"dinar back half patch":[6,26],"dinar back heavy patch":[6,26],"dinar back patch":[6,26],"dinar butcher":[6,26],"dinar cape":[6,26],"dinar carnage":[6,26],"dinar catshark heavy":[6,26],"dinar catshark light":[6,26],"dinar cougar":[6,26],"dinar cross":[6,26],"dinar dilution":[6,26],"dinar dorsal":[6,26],"dinar eyebrows":[6,26],"dinar forehead":[6,26],"dinar half cape":[6,26],"dinar half dorsal":[6,26],"dinar inuit unders":[6,26],"dinar inverted brindle":[10,27],"dinar inverted cross":[6,26],"dinar leopard shark":[6,26],"dinar limbs":[6,26],"dinar mantle":[6,26],"dinar mask":[6,26],"dinar neck band":[6,26],"dinar points":[6,26],"dinar sakiz mask":[6,26],"dinar shaded":[6,26],"dinar shadow":[6,26],"dinar shoulders":[6,26],"dinar undercoat":[6,26],"dinar unders":[6,26],"dinar vixen points":[6,26],"dinar wings":[6,26],"dinar wings heavy":[6,26],"dinar wings scarce":[6,26],"doubloon arapawa coat":[6,26],"doubloon back":[6,26],"doubloon back half patch":[6,26],"doubloon back heavy patch":[6,26],"doubloon back patch":[6,26],"doubloon bottoms":[6,26],"doubloon brindle":[10,27],"doubloon cape":[6,26],"doubloon chipmunk back stripes":[6,26],"doubloon chipmunk head stripes":[6,26],"doubloon dilution":[6,26],"doubloon dorsal":[6,26],"doubloon ear tips":[6,26],"doubloon epoch":[6,26],"doubloon gentle unders":[6,26],"doubloon grizzle":[6,26],"doubloon half cape":[6,26],"doubloon half dorsal":[6,26],"doubloon half socks":[6,26],"doubloon heavy husky":[6,26],"doubloon highlights":[6,26],"doubloon inuit unders":[6,26],"doubloon inverted cross":[6,26],"doubloon inverted panda":[6,26],"doubloon light husky":[6,26],"doubloon low bottoms":[6,26],"doubloon medium husky":[6,26],"doubloon merle":[6,26],"doubloon merle heavy":[6,26],"doubloon merle scarce":[6,26],"doubloon neck band":[6,26],"doubloon orca":[6,26],"doubloon patchy unders":[6,26],"doubloon raptor":[6,26],"doubloon shaded":[6,26],"doubloon shimmer":[6,26],"doubloon soay unders":[6,26],"doubloon socks":[6,26],"doubloon tamaskan unders":[6,26],"doubloon trim":[6,26],"doubloon tuxedo":[6,26],"doubloon underbelly":[6,26],"doubloon undercoat":[6,26],"doubloon underfur":[6,26],"doubloon unders":[6,26],"doubloon undersides":[6,26],"doubloon urajiro":[6,26],"doubloon wolverine":[6,26],"ducat arapawa coat":[6,26],"ducat back half patch":[6,26],"ducat back heavy patch":[6,26],"ducat back patch":[6,26],"ducat bottoms":[6,26],"ducat brindle":[10,27],"ducat cape":[6,26],"ducat chipmunk back stripes":[6,26],"ducat chipmunk head stripes":[6,26],"ducat dilution":[6,26],"ducat ear tips":[6,26],"ducat gentle unders":[6,26],"ducat grizzle":[6,26],"ducat half cape":[6,26],"ducat half socks":[6,26],"ducat heavy husky":[6,26],"ducat highlights":[6,26],"ducat inuit unders":[6,26],"ducat inverted panda":[6,26],"ducat light husky":[6,26],"ducat low bottoms":[6,26],"ducat lupos":[6,26],"ducat marbled unders":[6,26],"ducat medium husky":[6,26],"ducat merle":[6,26],"ducat merle heavy":[6,26],"ducat merle scarce":[6,26],"ducat neck band":[6,26],"ducat orca":[6,26],"ducat patchy unders":[6,26],"ducat sallander":[6,26],"ducat shaded":[6,26],"ducat shimmer":[6,26],"ducat soay unders":[6,26],"ducat socks":[6,26],"ducat tamaskan unders":[6,26],"ducat trim":[6,26],"ducat tuxedo":[6,26],"ducat underbelly":[6,26],"ducat undercoat":[6,26],"ducat underfur":[6,26],"ducat unders":[6,26],"ducat undersides":[6,26],"ducat urajiro":[6,26],"ducat whitetail spots":[6,26],"ducat wolverine":[6,26],"dust shimmer":[3,0,44],"ebony agouti":[8,34],"ebony cape":[8,34],"ebony cape ticking":[8,34],"ebony catshark heavy":[2,40],"ebony catshark light":[2,40],"ebony cougar":[2,40],"ebony cross":[8,34],"ebony dorsal":[8,34],"ebony half dorsal":[8,34],"ebony inverted brindle":[4,32],"ebony leopard shark":[2,40],"ebony lupos":[2,40],"ebony manicou":[8,34],"ebony mantle":[8,34],"ebony merle heavy patches":[2,40],"ebony merle patches":[2,40],"ebony merle scarce patches":[2,40],"ebony opossum":[8,34],"ebony panda":[2,40],"ebony points":[8,34],"ebony sakiz mask":[8,34],"ebony shaded":[8,34],"ebony smoke":[8,34],"ebony vixen points":[8,34],"ebony wings":[2,40],"ebony wings heavy":[2,40],"ebony wings scarce":[2,40],"faelcu cougar":[3,22,65],"faelcu ghast":[3,22,65],"faelcu reverse blight":[3,22,65],"faelcu wild stripes":[3,22,65],"fenestra catshark light":[3,5,66],"fenestra lykoi":[3,5,66],"fenestra ornate blotches":[3,5,66],"fenestra sprite":[3,5,66],"fossil epoch":[3,35,36],"fossil raptor":[3,35,43],"fuath gleam":[3,22,67],"fuath pulse":[3,22,67],"fuath veneer":[3,22,67],"fuath wild stripes":[3,22,67],"gaelach fringe":[3,22,68],"gaelach inverted cross":[3,22,68],"gaelach irish":[3,22,68],"gaelach soay unders":[3,22,68],"ghost carnage":[3,0,69],"ghost medium husky":[3,0,69],"ghost sprite":[3,0,69],"ghost wraith":[3,0,69],"glownoise agouti":[6,26],"glownoise arapawa coat":[6,26],"glownoise cracks":[6,26],"glownoise fringe":[6,26],"glownoise light husky":[6,26],"glownoise lykoi":[6,26],"glownoise ornate blotches":[6,26],"glownoise ornate spots":[6,26],"glownoise ornate waves":[6,26],"glownoise shaded":[6,26],"glownoise smoke":[6,26],"glownoise urajiro":[6,26],"gold agouti":[0,31],"gold arapawa coat":[8,34],"gold bottoms":[0,31],"gold brindle":[4,32],"gold butcher":[1,33],"gold carnage":[1,33],"gold chest":[0,31],"gold chipmunk back stripes":[8,34],"gold chipmunk head stripes":[8,34],"gold cougar":[2,40],"gold cover":[1,33],"gold cross":[1,33],"gold dilution":[0,31],"gold elbows":[0,31],"gold full mask":[0,31],"gold gentle unders":[1,33],"gold grizzle":[0,31],"gold half mask":[0,31],"gold heavy husky":[1,33],"gold highlights":[1,33],"gold inuit unders":[7,39],"gold inverted agouti":[0,31],"gold inverted cross":[1,33],"gold irish":[0,31],"gold light husky":[1,33],"gold limbs":[1,33],"gold low bottoms":[0,31],"gold lupos":[2,40],"gold mask":[0,31],"gold medium husky":[1,33],"gold muzzle patch":[1,33],"gold neck band":[0,31],"gold orca":[2,40],"gold patchy unders":[1,33],"gold paws":[1,33],"gold points":[8,34],"gold predator":[1,33],"gold rump patch":[1,33],"gold sallander":[8,34],"gold shaded":[8,34],"gold shoulder patch":[0,31],"gold shoulders":[0,31],"gold snout":[1,33],"gold soay unders":[8,34],"gold socks":[1,33],"gold stained limbs":[1,33],"gold tamaskan unders":[7,39],"gold throat patch":[0,31],"gold toes":[1,33],"gold trim":[1,33],"gold tuxedo":[1,33],"gold underbelly":[0,31],"gold undercoat":[1,33],"gold underfur":[0,31],"gold unders":[0,31],"gold undersides":[0,31],"gold urajiro":[1,33],"gold whitetail spots":[8,34],"gold wings":[2,40],"gold wings heavy":[2,40],"gold wings scarce":[2,40],"gold wolverine":[8,34],"gray agouti":[0,31],"gray arapawa coat":[8,34],"gray back":[0,31],"gray back half patch":[0,31],"gray back heavy patch":[0,31],"gray back patch":[0,31],"gray blanket":[0,31],"gray blanket ticking":[0,31],"gray brindle":[4,32],"gray cape":[0,31],"gray cape ticking":[0,31],"gray catshark heavy":[2,40],"gray catshark light":[2,40],"gray chest":[0,31],"gray cover":[1,33],"gray crawl":[3,0,1],"gray cross":[1,33],"gray forehead":[1,33],"gray full mask":[0,31],"gray half cape":[0,31],"gray half cape ticking":[0,31],"gray half mask":[0,31],"gray half saddle":[0,31],"gray highlights":[1,33],"gray inuit unders":[7,39],"gray inverted brindle":[4,32],"gray inverted cross":[1,33],"gray inverted manicou":[8,34],"gray inverted opossum":[8,34],"gray leopard shark":[2,40],"gray mantle":[0,31],"gray mask":[0,31],"gray neck":[0,31],"gray neck band":[0,31],"gray notches":[3,0,4],"gray orca":[2,40],"gray patchy unders":[1,33],"gray points":[8,34],"gray saddle":[0,31],"gray saddle ticking":[0,31],"gray sakiz mask":[8,34],"gray sallander":[8,34],"gray shoulders":[0,31],"gray smoke":[8,34],"gray smudge":[1,33],"gray smudge heavy":[1,33],"gray soay unders":[8,34],"gray tamaskan unders":[7,39],"gray undercoat":[1,33],"gray underfur":[0,31],"gray unders":[0,31],"gray undersides":[0,31],"gray vixen points":[8,34],"gray wolverine":[8,34],"gwyrdd blight":[3,22,70],"gwyrdd points":[3,22,70],"gwyrdd soay unders":[3,22,70],"gwyrdd undercoat":[3,22,70],"hadal arapawa coat":[3,5,71],"hadal lupos":[3,5,71],"hadal nautilus":[3,5,71],"hadal pulse":[3,5,71],"hecate blight":[3,0,72],"hecate cracks":[3,0,72],"hecate inverted cross":[3,0,72],"hecate wild stripes":[3,0,72],"henna catshark heavy":[2,40],"henna catshark light":[2,40],"henna cougar":[2,40],"henna crawl":[3,0,1],"henna ghast":[3,0,50],"henna inverted brindle":[4,32],"henna leopard shark":[2,40],"henna manicou":[8,34],"henna notches":[3,0,4],"henna opossum":[8,34],"henna panda":[2,40],"henna shadow":[3,0,51],"henna wraith":[3,0,53],"hestia argus":[3,7,73],"hestia crescent":[3,7,73],"hestia ghast":[3,7,73],"hestia shimmer":[3,7,73],"honey agouti":[0,31],"honey arapawa coat":[8,34],"honey back":[0,31],"honey back edge patch":[0,31],"honey back half patch":[0,31],"honey back heavy patch":[0,31],"honey back patch":[0,31],"honey bottoms":[0,31],"honey brindle":[4,32],"honey butcher":[1,33],"honey cape":[0,31],"honey carnage":[1,33],"honey catshark heavy":[2,40],"honey catshark light":[2,40],"honey chipmunk back stripes":[8,34],"honey chipmunk head stripes":[8,34],"honey cougar":[2,40],"honey cross":[1,33],"honey dilution":[0,31],"honey dorsal":[0,31],"honey ear tips":[1,33],"honey epoch":[3,35,36],"honey eyebrows":[1,33],"honey forehead":[1,33],"honey gentle unders":[1,33],"honey grizzle":[0,31],"honey half cape":[0,31],"honey half dorsal":[0,31],"honey half socks":[1,33],"honey heavy husky":[1,33],"honey highlights":[1,33],"honey inuit unders":[7,39],"honey inverted agouti":[0,31],"honey inverted brindle":[4,32],"honey inverted cross":[1,33],"honey inverted manicou":[8,34],"honey inverted opossum":[8,34],"honey inverted panda":[2,40],"honey leopard shark":[2,40],"honey light husky":[1,33],"honey limbs":[1,33],"honey low bottoms":[0,31],"honey mantle":[0,31],"honey mask":[0,31],"honey medium husky":[1,33],"honey merle":[2,40],"honey merle heavy":[2,40],"honey merle scarce":[2,40],"honey neck band":[0,31],"honey orca":[2,40],"honey patchy unders":[1,33],"honey paws":[1,33],"honey points":[8,34],"honey predator":[1,33],"honey raptor":[3,35,43],"honey sakiz mask":[8,34],"honey shaded":[8,34],"honey shadow":[3,0,51],"honey shimmer":[3,0,44],"honey shoulders":[0,31],"honey soay unders":[8,34],"honey socks":[1,33],"honey spectacles":[1,33],"honey tamaskan unders":[7,39],"honey throat patch":[0,31],"honey trim":[1,33],"honey tuxedo":[1,33],"honey underbelly":[0,31],"honey undercoat":[1,33],"honey underfur":[0,31],"honey unders":[0,31],"honey undersides":[0,31],"honey urajiro":[1,33],"honey vixen points":[8,34],"honey wings":[2,40],"honey wings heavy":[2,40],"honey wings scarce":[2,40],"honey wolverine":[8,34],"hurricane cracks":[3,2,74],"hurricane ornate waves":[3,2,74],"hurricane sprite":[3,2,74],"hurricane undersides":[3,2,74],"hydrangea argus":[3,13,30],"hydrangea cougar":[3,7,75],"hydrangea freckles":[3,13,37],"hydrangea gallus":[3,13,38],"hydrangea ghast":[3,7,75],"hydrangea lupos":[3,7,75],"hydrangea mosaic":[3,13,41],"hydrangea peacock":[3,13,42],"hydrangea smudge heavy":[3,7,75],"hydrangea splotches":[3,13,45],"hydrangea streaks":[3,13,76],"iridium agouti":[6,26],"iridium arapawa coat":[6,26],"iridium back":[6,26],"iridium back patch":[6,26],"iridium blanket":[6,26],"iridium blanket ticking":[6,26],"iridium cape":[6,26],"iridium cape ticking":[6,26],"iridium catshark heavy":[6,26],"iridium catshark light":[6,26],"iridium chest":[6,26],"iridium cover":[6,26],"iridium crawl":[6,26],"iridium cross":[6,26],"iridium forehead":[6,26],"iridium full mask":[6,26],"iridium half cape":[6,26],"iridium half cape ticking":[6,26],"iridium half mask":[6,26],"iridium half saddle":[6,26],"iridium inuit unders":[6,26],"iridium inverted brindle":[10,27],"iridium inverted cross":[6,26],"iridium leopard shark":[6,26],"iridium mantle":[6,26],"iridium mask":[6,26],"iridium neck":[6,26],"iridium neck band":[6,26],"iridium notches":[6,26],"iridium patchy unders":[6,26],"iridium points":[6,26],"iridium saddle":[6,26],"iridium saddle ticking":[6,26],"iridium sakiz mask":[6,26],"iridium sallander":[6,26],"iridium shoulders":[6,26],"iridium smoke":[6,26],"iridium smudge":[6,26],"iridium smudge heavy":[6,26],"iridium undercoat":[6,26],"iridium unders":[6,26],"iridium vixen points":[6,26],"kin argus":[3,13,30],"kin cougar":[3,2,77],"kin freckles":[3,13,37],"kin gallus":[3,13,38],"kin inverted agouti":[3,2,77],"kin inverted cross":[3,2,77],"kin mosaic":[3,13,41],"kin ornate blotches":[3,2,77],"kin peacock":[3,13,42],"kin splotches":[3,13,45],"kin streaks":[3,13,46],"koma crawl":[3,5,78],"koma crestline":[3,5,78],"koma ghast":[3,5,78],"koma peacock":[3,5,78],"lavender argus":[3,13,30],"lavender epoch":[3,35,36],"lavender freckles":[3,13,37],"lavender gallus":[3,13,38],"lavender mosaic":[3,13,41],"lavender peacock":[3,13,42],"lavender raptor":[3,35,43],"lavender shimmer":[3,0,44],"lavender splotches":[3,13,45],"lavender streaks":[3,13,46],"leucippus arapawa coat":[3,7,79],"leucippus inverted cross":[3,7,79],"leucippus soay unders":[3,7,79],"leucippus wild stripes":[3,7,79],"lilac agouti":[8,34],"lilac arapawa coat":[8,34],"lilac cougar":[2,40],"lilac cross":[8,34],"lilac dilution":[8,34],"lilac gentle unders":[8,34],"lilac inverted brindle":[4,32],"lilac inverted cross":[8,34],"lilac irish":[8,34],"lilac leopard shark":[2,40],"lilac lupos":[2,40],"lilac manicou":[8,34],"lilac neck band":[8,34],"lilac opossum":[8,34],"lilac points":[8,34],"lilac sallander":[8,34],"lilac shaded":[8,34],"lilac smoke":[8,34],"lilac smudge":[8,34],"lilac smudge heavy":[8,34],"lilac wings":[2,40],"lilac wings heavy":[2,40],"lilac wings scarce":[2,40],"lily back":[6,26],"lily brindle":[10,27],"lily carnage":[6,26],"lily dilution":[6,26],"lily elbow patch":[6,26],"lily highlights":[6,26],"lily inverted cross":[6,26],"lily inverted panda":[6,26],"lily lupos":[6,26],"lily orca":[6,26],"lily patchy unders":[6,26],"lily points":[6,26],"lily predator":[6,26],"lily sallander":[6,26],"lily spectacles":[6,26],"lily tamaskan unders":[6,26],"lily undercoat":[6,26],"lily underfur":[6,26],"lily unders":[6,26],"lily undersides":[6,26],"liver crawl":[3,0,1],"liver ghast":[3,0,50],"liver inverted brindle":[4,32],"liver notches":[3,0,4],"liver shadow":[3,0,51],"liver wraith":[3,0,53],"losna agouti":[3,5,80],"losna aurora":[3,5,81],"losna cracks":[3,5,80],"losna cross":[3,5,81],"losna gleam":[3,5,80],"losna inverted agouti":[3,5,81],"losna ornate blotches":[3,5,80],"losna ornate spots":[3,5,80],"losna ornate stripes":[3,5,80],"losna ornate waves":[3,5,80],"losna pulse":[3,5,80],"losna shepherd heavy":[3,5,81],"luna aurora":[3,5,82],"luna cracks":[3,5,82],"luna dilution":[3,5,82],"luna inverted agouti":[3,5,82],"luna inverted cross":[3,5,83],"luna lupos":[3,5,82],"luna ornate blotches":[3,5,83],"luna ornate spots":[3,5,82],"luna ornate stripes":[3,5,82],"luna points":[3,5,83],"luna smudge heavy":[3,5,83],"luna sprite":[3,5,82],"magnolia arapawa coat":[8,34],"magnolia bottoms":[8,34],"magnolia brindle":[4,32],"magnolia dilution":[8,34],"magnolia grizzle":[8,34],"magnolia inverted agouti":[8,34],"magnolia inverted manicou":[8,34],"magnolia inverted opossum":[8,34],"magnolia irish":[8,34],"magnolia low bottoms":[8,34],"magnolia neck band":[8,34],"magnolia points":[8,34],"magnolia sallander":[8,34],"magnolia shaded":[8,34],"magnolia smoke":[8,34],"magnolia soay unders":[8,34],"magnolia underbelly":[8,34],"magnolia unders":[8,34],"magnolia undersides":[8,34],"magnolia whitetail spots":[8,34],"magnolia wolverine":[8,34],"marble arapawa coat":[6,26],"marble back heavy patch":[6,26],"marble back patch":[6,26],"marble brindle":[10,27],"marble cape":[6,26],"marble cape ticking":[6,26],"marble chest":[6,26],"marble half cape":[6,26],"marble half cape ticking":[6,26],"marble half mask":[6,26],"marble highlights":[6,26],"marble inuit unders":[6,26],"marble mask":[6,26],"marble neck":[6,26],"marble neck band":[6,26],"marble orca":[6,26],"marble patchy unders":[6,26],"marble soay unders":[6,26],"marble tamaskan unders":[6,26],"marble undercoat":[6,26],"marble underfur":[6,26],"marble unders":[6,26],"marble undersides":[6,26],"marble wolverine":[6,26],"merged argus":[3,13,30],"merged cross":[3,2,84],"merged freckles":[3,13,37],"merged gallus":[3,13,38],"merged mosaic":[3,13,41],"merged ornate waves":[3,2,84],"merged peacock":[3,13,42],"merged shepherd heavy":[3,2,84],"merged splotches":[3,13,45],"merged streaks":[3,13,46],"merged veneer":[3,2,84],"monster gleam":[3,2,85],"monster smudge heavy":[3,2,85],"monster veneer":[3,2,85],"monster wild stripes":[3,2,85],"moondust crescent":[3,5,86],"moondust orca":[3,5,86],"moondust ornate spots":[3,5,86],"moondust ornate waves":[3,5,86],"moonlight agouti":[3,5,87],"moonlight aurora":[3,5,87],"moonlight cracks":[3,5,88],"moonlight cross":[3,5,88],"moonlight gleam":[3,5,88],"moonlight inverted agouti":[3,5,88],"moonlight ornate blotches":[3,5,87],"moonlight ornate spots":[3,5,88],"moonlight ornate stripes":[3,5,87],"moonlight ornate waves":[3,5,88],"moonlight pulse":[3,5,88],"moonlight shepherd heavy":[3,5,88],"moonloss agouti":[6,26],"moonloss aurora":[6,26],"moonloss cracks":[6,26],"moonloss cross":[6,26],"moonloss gleam":[6,26],"moonloss inverted agouti":[6,26],"moonloss ornate blotches":[6,26],"moonloss ornate spots":[6,26],"moonloss ornate stripes":[6,26],"moonloss ornate waves":[6,26],"moonloss pulse":[6,26],"moonloss shepherd heavy":[6,26],"moss cross":[3,22,89],"moss ornate blotches":[3,22,89],"moss shaded":[3,22,89],"moss smudge heavy":[3,22,89],"nightchill aurora":[3,5,90],"nightchill cracks":[3,5,91],"nightchill fringe":[3,5,90],"nightchill inverted smudge":[3,5,91],"nightchill lykoi":[3,5,90],"nightchill nautilus":[3,5,90],"nightchill patchy unders":[3,5,90],"nightchill shaded":[3,5,90],"nightchill shadow":[3,5,90],"nightchill undercoat":[3,5,91],"nightchill wild stripes":[3,5,90],"nightchill wraith":[3,5,91],"nightform aurora":[6,26],"nightform cracks":[6,26],"nightform fringe":[6,26],"nightform inverted smudge":[6,26],"nightform lykoi":[6,26],"nightform nautilus":[6,26],"nightform patchy unders":[6,26],"nightform shaded":[6,26],"nightform shadow":[6,26],"nightform undercoat":[6,26],"nightform wild stripes":[6,26],"nightform wraith":[6,26],"nocturne agouti":[0,31],"nocturne back":[0,31],"nocturne cape":[0,31],"nocturne cape ticking":[0,31],"nocturne carnage":[1,33],"nocturne cheek fluff":[1,33],"nocturne cover":[1,33],"nocturne dilution":[0,31],"nocturne dorsal":[0,31],"nocturne elbow patch":[0,31],"nocturne ghast":[3,0,50],"nocturne half cape":[0,31],"nocturne half cape ticking":[0,31],"nocturne half socks":[0,31],"nocturne inverted brindle":[4,32],"nocturne limbs":[1,33],"nocturne lupos":[2,40],"nocturne mantle":[0,31],"nocturne panda":[2,40],"nocturne paws":[1,33],"nocturne sakiz mask":[8,34],"nocturne sallander":[8,34],"nocturne shadow":[3,0,51],"nocturne shepherd":[0,31],"nocturne shepherd heavy":[0,52],"nocturne shoulder patch":[0,31],"nocturne snout":[1,33],"nocturne socks":[1,33],"nocturne tail tip":[0,31],"nocturne tuxedo":[1,33],"nocturne undercoat":[1,33],"nocturne wings":[2,40],"nocturne wings heavy":[2,40],"nocturne wings scarce":[2,40],"nocturne wraith":[3,0,53],"odium arapawa coat":[3,2,92],"odium aurora":[3,2,92],"odium fringe":[3,2,92],"odium sprite":[3,2,92],"opal argus":[3,13,30],"opal epoch":[3,35,36],"opal freckles":[3,13,37],"opal gallus":[3,13,38],"opal mosaic":[3,13,41],"opal peacock":[3,13,42],"opal raptor":[3,35,43],"opal shimmer":[3,0,44],"opal splotches":[3,13,45],"opal streaks":[3,13,46],"penumbra aurora":[3,5,93],"penumbra cross":[3,5,93],"penumbra gleam":[3,5,93],"penumbra pulse":[3,5,93],"pumice agouti":[0,31],"pumice back":[0,31],"pumice blanket":[0,31],"pumice blanket ticking":[0,31],"pumice bottoms":[0,31],"pumice butcher":[1,33],"pumice cape":[0,31],"pumice cape ticking":[0,31],"pumice catshark heavy":[2,40],"pumice catshark light":[2,40],"pumice cougar":[2,40],"pumice cover":[1,33],"pumice cross":[1,33],"pumice dorsal":[0,31],"pumice full rump":[1,33],"pumice half cape":[0,31],"pumice half cape ticking":[0,31],"pumice half cover":[1,33],"pumice half dorsal":[0,31],"pumice half saddle":[0,31],"pumice inverted brindle":[4,32],"pumice inverted cross":[1,33],"pumice leopard shark":[2,40],"pumice mantle":[0,31],"pumice muzzle patch":[1,33],"pumice neck band":[0,31],"pumice points":[8,34],"pumice rump":[1,33],"pumice rump edge":[1,33],"pumice rump patch":[1,33],"pumice saddle":[0,31],"pumice saddle ticking":[0,31],"pumice shaded":[8,34],"pumice trim":[1,33],"pumice underbelly":[0,31],"pumice vixen points":[8,34],"red agouti":[0,31],"red arapawa coat":[8,34],"red back":[1,33],"red back edge patch":[1,33],"red brindle":[4,32],"red butcher":[1,33],"red carnage":[1,33],"red catshark heavy":[2,40],"red catshark light":[2,40],"red cougar":[2,40],"red cover":[1,33],"red crawl":[3,0,1],"red dilution":[0,31],"red dorsal":[1,33],"red elbow patch":[1,33],"red forehead":[1,33],"red ghast":[3,0,50],"red half dorsal":[1,33],"red half mask":[0,31],"red highlights":[1,33],"red inverted cross":[1,33],"red inverted panda":[2,40],"red leopard shark":[2,40],"red lupos":[2,40],"red mantle":[0,31],"red mask":[0,31],"red notches":[3,0,4],"red orca":[2,40],"red panda":[2,40],"red patchy unders":[1,33],"red points":[8,34],"red predator":[1,33],"red sakiz mask":[8,34],"red sallander":[8,34],"red shaded":[8,34],"red shadow":[3,0,51],"red smoke":[8,34],"red smudge":[1,33],"red smudge heavy":[1,33],"red spectacles":[1,33],"red tamaskan unders":[7,39],"red undercoat":[1,33],"red underfur":[1,33],"red unders":[1,33],"red undersides":[1,33],"red vixen points":[8,34],"red wings":[2,40],"red wings heavy":[2,40],"red wings scarce":[2,40],"red wraith":[3,0,53],"reef carnage":[3,5,94],"reef fringe":[3,5,94],"reef lupos":[3,5,94],"reef sprite":[3,5,94],"rufous agouti":[6,26],"rufous arapawa coat":[6,26],"rufous back":[6,26],"rufous back edge patch":[6,26],"rufous butcher":[6,26],"rufous catshark heavy":[6,26],"rufous catshark light":[6,26],"rufous cover":[6,26],"rufous crawl":[6,26],"rufous dorsal":[6,26],"rufous forehead":[6,26],"rufous ghast":[6,26],"rufous half dorsal":[6,26],"rufous half mask":[6,26],"rufous inverted cross":[6,26],"rufous leopard shark":[6,26],"rufous lupos":[6,26],"rufous mantle":[6,26],"rufous mask":[6,26],"rufous notches":[6,26],"rufous panda":[6,26],"rufous points":[6,26],"rufous sakiz mask":[6,26],"rufous sallander":[6,26],"rufous shadow":[6,26],"rufous smoke":[6,26],"rufous smudge":[6,26],"rufous smudge heavy":[6,26],"rufous undercoat":[6,26],"rufous unders":[6,26],"rufous vixen points":[6,26],"rufous wings":[6,26],"rufous wings heavy":[6,26],"rufous wings scarce":[6,26],"rufous wraith":[6,26],"saffron back half patch":[6,26],"saffron back heavy patch":[6,26],"saffron back patch":[6,26],"saffron bottoms":[6,26],"saffron brindle":[10,27],"saffron cape":[6,26],"saffron chipmunk back stripes":[6,26],"saffron chipmunk head stripes":[6,26],"saffron dilution":[6,26],"saffron ear tips":[6,26],"saffron epoch":[6,26],"saffron gentle unders":[6,26],"saffron grizzle":[6,26],"saffron half cape":[6,26],"saffron half socks":[6,26],"saffron heavy husky":[6,26],"saffron inuit unders":[6,26],"saffron inverted panda":[6,26],"saffron light husky":[6,26],"saffron low bottoms":[6,26],"saffron marbled unders":[6,26],"saffron medium husky":[6,26],"saffron neck band":[6,26],"saffron orca":[6,26],"saffron patchy unders":[6,26],"saffron raptor":[6,26],"saffron sallander":[6,26],"saffron shimmer":[6,26],"saffron soay unders":[6,26],"saffron socks":[6,26],"saffron tamaskan unders":[6,26],"saffron trim":[6,26],"saffron tuxedo":[6,26],"saffron underbelly":[6,26],"saffron undercoat":[6,26],"saffron underfur":[6,26],"saffron unders":[6,26],"saffron undersides":[6,26],"saffron whitetail spots":[6,26],"saffron wolverine":[6,26],"salt arapawa coat":[8,34],"salt bottoms":[8,34],"salt brindle":[4,32],"salt carnage":[8,34],"salt chipmunk back stripes":[8,34],"salt chipmunk head stripes":[8,34],"salt grizzle":[8,34],"salt inverted agouti":[8,34],"salt inverted manicou":[8,34],"salt inverted opossum":[8,34],"salt inverted panda":[2,40],"salt irish":[8,34],"salt low bottoms":[8,34],"salt merle":[2,40],"salt merle heavy":[2,40],"salt merle scarce":[2,40],"salt orca":[2,40],"salt predator":[8,34],"salt sallander":[8,34],"salt soay unders":[8,34],"salt underbelly":[8,34],"salt unders":[8,34],"salt undersides":[8,34],"salt whitetail spots":[8,34],"salt wolverine":[8,34],"sappho pulse":[3,7,95],"sappho sallander":[3,7,95],"sappho shimmer":[3,7,95],"sappho wild stripes":[3,7,95],"selene aurora":[3,5,96],"selene cracks":[3,5,96],"selene dilution":[3,5,97],"selene inverted agouti":[3,5,97],"selene inverted cross":[3,5,96],"selene lupos":[3,5,97],"selene ornate blotches":[3,5,96],"selene ornate spots":[3,5,97],"selene ornate stripes":[3,5,96],"selene points":[3,5,96],"selene smudge heavy":[3,5,96],"selene sprite":[3,5,96],"selunia aurora":[6,26],"selunia cracks":[6,26],"selunia dilution":[6,26],"selunia inverted agouti":[6,26],"selunia inverted cross":[6,26],"selunia lupos":[6,26],"selunia ornate blotches":[6,26],"selunia ornate spots":[6,26],"selunia ornate stripes":[6,26],"selunia points":[6,26],"selunia smudge heavy":[6,26],"selunia sprite":[6,26],"sepia arapawa coat":[6,26],"sepia back":[6,26],"sepia back half patch":[6,26],"sepia back heavy patch":[6,26],"sepia back patch":[6,26],"sepia cape":[6,26],"sepia dilution":[6,26],"sepia dorsal":[6,26],"sepia half cape":[6,26],"sepia half dorsal":[6,26],"sepia inuit unders":[6,26],"sepia inverted cross":[6,26],"sepia lupos":[6,26],"sepia neck band":[6,26],"sepia shaded":[6,26],"sepia undercoat":[6,26],"sepia unders":[6,26],"shedua agouti":[6,26],"shedua arapawa coat":[6,26],"shedua back":[6,26],"shedua back edge patch":[6,26],"shedua back half patch":[6,26],"shedua back heavy patch":[6,26],"shedua back patch":[6,26],"shedua butcher":[6,26],"shedua cape":[6,26],"shedua carnage":[6,26],"shedua catshark heavy":[6,26],"shedua catshark light":[6,26],"shedua cougar":[6,26],"shedua cross":[6,26],"shedua dilution":[6,26],"shedua dorsal":[6,26],"shedua eyebrows":[6,26],"shedua forehead":[6,26],"shedua half cape":[6,26],"shedua half dorsal":[6,26],"shedua inuit unders":[6,26],"shedua inverted brindle":[10,27],"shedua inverted cross":[6,26],"shedua leopard shark":[6,26],"shedua limbs":[6,26],"shedua mantle":[6,26],"shedua mask":[6,26],"shedua neck band":[6,26],"shedua patchy unders":[6,26],"shedua points":[6,26],"shedua predator":[6,26],"shedua sakiz mask":[6,26],"shedua shaded":[6,26],"shedua shadow":[6,26],"shedua shoulders":[6,26],"shedua spectacles":[6,26],"shedua throat patch":[6,26],"shedua trim":[6,26],"shedua undercoat":[6,26],"shedua unders":[6,26],"shedua vixen points":[6,26],"shedua wings":[6,26],"shedua wings heavy":[6,26],"shedua wings scarce":[6,26],"shell arapawa coat":[8,34],"shell back heavy patch":[0,31],"shell back patch":[0,31],"shell blaze":[0,31],"shell bottoms":[0,31],"shell brindle":[4,32],"shell cape":[0,31],"shell cape ticking":[0,31],"shell carnage":[1,33],"shell cheek fluff":[1,33],"shell chest":[0,31],"shell chipmunk back stripes":[8,34],"shell chipmunk head stripes":[8,34],"shell ear tips":[1,33],"shell epoch":[3,35,36],"shell elbows":[0,31],"shell eyebrows":[1,33],"shell gentle unders":[1,33],"shell grizzle":[0,31],"shell half cape":[0,31],"shell half cape ticking":[0,31],"shell half mask":[0,31],"shell half socks":[0,31],"shell heavy husky":[1,33],"shell highlights":[1,33],"shell inner ear":[1,33],"shell inuit unders":[7,39],"shell inverted agouti":[0,31],"shell inverted panda":[2,40],"shell irish":[0,31],"shell light husky":[1,33],"shell low bottoms":[0,31],"shell mask":[0,31],"shell medium husky":[1,33],"shell merle":[2,40],"shell merle heavy":[2,40],"shell merle scarce":[2,40],"shell muzzle":[1,33],"shell muzzle patch":[1,33],"shell neck":[0,31],"shell neck band":[0,31],"shell nose bridge":[0,31],"shell nose line":[0,31],"shell orca":[2,40],"shell patchy unders":[1,33],"shell predator":[1,33],"shell raptor":[3,35,43],"shell soay unders":[8,34],"shell socks":[1,33],"shell tamaskan unders":[7,39],"shell throat":[0,31],"shell throat patch":[0,31],"shell toes":[1,33],"shell trim":[1,33],"shell tuxedo":[1,33],"shell underbelly":[0,31],"shell undercoat":[1,33],"shell underfur":[0,31],"shell unders":[0,31],"shell undersides":[0,31],"shell urajiro":[1,33],"shell whitetail spots":[8,34],"shell wolverine":[8,34],"sidhe aurora":[3,22,98],"sidhe carnage":[3,22,98],"sidhe cracks":[3,22,98],"sidhe wild stripes":[3,22,98],"silver arapawa coat":[6,26],"silver back half patch":[6,26],"silver back heavy patch":[6,26],"silver back patch":[6,26],"silver butcher":[6,26],"silver cape":[6,26],"silver cape ticking":[6,26],"silver carnage":[6,26],"silver cheek fluff":[6,26],"silver chest":[6,26],"silver cross":[6,26],"silver dilution":[6,26],"silver elbow patch":[6,26],"silver eyebrows":[6,26],"silver ghast":[6,26],"silver half cape":[6,26],"silver half cape ticking":[6,26],"silver half mask":[6,26],"silver inuit unders":[6,26],"silver limbs":[6,26],"silver lupos":[6,26],"silver mask":[6,26],"silver muzzle patch":[6,26],"silver neck":[6,26],"silver neck band":[6,26],"silver nose bridge":[6,26],"silver patchy unders":[6,26],"silver predator":[6,26],"silver sallander":[6,26],"silver shaded":[6,26],"silver shadow":[6,26],"silver shoulder patch":[6,26],"silver snout":[6,26],"silver spectacles":[6,26],"silver tail tip":[6,26],"silver throat":[6,26],"silver throat patch":[6,26],"silver trim":[6,26],"silver undercoat":[6,26],"silver unders":[6,26],"silver wings":[6,26],"silver wings heavy":[6,26],"silver wings scarce":[6,26],"silver wraith":[6,26],"spore cross":[3,5,99],"spore gleam":[3,5,99],"spore reverse blight":[3,5,99],"spore sprite":[3,5,99],"sterling arapawa coat":[6,26],"sterling cape":[6,26],"sterling cross":[6,26],"sterling dilution":[6,26],"sterling ghast":[6,26],"sterling lupos":[6,26],"sterling sallander":[6,26],"sterling shaded":[6,26],"sterling shadow":[6,26],"sterling shoulder patch":[6,26],"sterling snout":[6,26],"sterling undercoat":[6,26],"sterling unders":[6,26],"sterling wings":[6,26],"sterling wings heavy":[6,26],"sterling wings scarce":[6,26],"sterling wraith":[6,26],"storm aurora":[3,2,100],"storm carnage":[3,2,100],"storm heavy husky":[3,2,100],"storm lupos":[3,2,100],"striped flint epoch":[3,35,36],"striped flint raptor":[3,35,43],"tempest agouti":[3,2,101],"tempest aurora":[3,2,101],"tempest points":[3,2,101],"tempest wild stripes":[3,2,101],"tuff arapawa coat":[6,26],"tuff back half patch":[6,26],"tuff back heavy patch":[6,26],"tuff back patch":[6,26],"tuff butcher":[6,26],"tuff cape":[6,26],"tuff cape ticking":[6,26],"tuff carnage":[6,26],"tuff cheek fluff":[6,26],"tuff dilution":[6,26],"tuff elbow patch":[6,26],"tuff eyebrows":[6,26],"tuff half cape":[6,26],"tuff half cape ticking":[6,26],"tuff inuit unders":[6,26],"tuff limbs":[6,26],"tuff lupos":[6,26],"tuff muzzle patch":[6,26],"tuff neck":[6,26],"tuff neck band":[6,26],"tuff patchy unders":[6,26],"tuff predator":[6,26],"tuff sallander":[6,26],"tuff shoulder patch":[6,26],"tuff spectacles":[6,26],"tuff throat":[6,26],"tuff throat patch":[6,26],"tuff trim":[6,26],"tuff undercoat":[6,26],"tuff unders":[6,26],"turquoise agouti":[3,5,102],"turquoise arapawa coat":[3,5,102],"turquoise cracks":[3,5,102],"turquoise fringe":[3,5,102],"turquoise light husky":[3,5,103],"turquoise lykoi":[3,5,102],"turquoise ornate blotches":[3,5,102],"turquoise ornate spots":[3,5,103],"turquoise ornate waves":[3,5,102],"turquoise shaded":[3,5,102],"turquoise smoke":[3,5,103],"turquoise urajiro":[3,5,103],"typhoon argus":[3,2,104],"typhoon cross":[3,2,104],"typhoon ghast":[3,2,104],"typhoon streaks":[3,2,104],"umbra blight":[3,5,105],"umbra cracks":[3,5,105],"umbra crescent":[3,5,106],"umbra crestline":[3,5,106],"umbra lykoi":[3,5,106],"umbra orca":[3,5,106],"umbra ornate blotches":[3,5,105],"umbra ornate spots":[3,5,106],"umbra pulse":[3,5,105],"umbra shadow":[3,5,106],"umbra sprite":[3,5,106],"umbra wild stripes":[3,5,106],"uumavoq freckles":[3,2,107],"uumavoq fringe":[3,2,107],"uumavoq orcra":[3,2,107],"uumavoq peacock":[3,2,107],"white arapawa coat":[8,34],"white back half patch":[0,31],"white back heavy patch":[0,31],"white back patch":[0,31],"white blaze":[0,31],"white bottoms":[0,31],"white brindle":[4,32],"white butcher":[1,33],"white cape":[0,31],"white cape ticking":[0,31],"white carnage":[1,33],"white cheek fluff":[1,33],"white chest":[0,31],"white chipmunk back stripes":[8,34],"white chipmunk head stripes":[8,34],"white cross":[1,33],"white dilution":[0,31],"white ear tips":[1,33],"white elbow patch":[0,31],"white elbows":[0,31],"white epoch":[3,35,36],"white eyebrows":[1,33],"white gentle unders":[1,33],"white ghast":[3,0,50],"white grizzle":[0,31],"white half cape":[0,31],"white half cape ticking":[0,31],"white half mask":[0,31],"white half socks":[1,33],"white heavy husky":[1,33],"white highlights":[1,33],"white inner ear":[1,33],"white inuit unders":[7,39],"white inverted agouti":[0,31],"white inverted manicou":[8,34],"white inverted opossum":[8,34],"white inverted panda":[2,40],"white irish":[0,31],"white light husky":[1,33],"white limbs":[1,33],"white low bottoms":[0,31],"white lupos":[2,40],"white marbled unders":[1,33],"white mask":[0,31],"white medium husky":[1,33],"white merle":[2,40],"white merle heavy":[2,40],"white merle scarce":[2,40],"white muzzle":[1,33],"white muzzle patch":[1,33],"white neck":[0,31],"white neck band":[0,31],"white nose bridge":[0,31],"white nose line":[0,31],"white orca":[2,40],"white patchy unders":[1,33],"white paws":[1,33],"white predator":[1,33],"white raptor":[3,35,43],"white sallander":[8,34],"white shaded":[8,34],"white shadow":[3,0,51],"white shimmer":[3,0,44],"white shoulder patch":[0,31],"white snout":[1,33],"white soay unders":[8,34],"white socks":[1,33],"white spectacles":[1,33],"white tail tip":[0,31],"white tamaskan unders":[7,39],"white throat":[0,31],"white throat patch":[0,31],"white toes":[1,33],"white trim":[1,33],"white tuxedo":[1,33],"white underbelly":[0,31],"white undercoat":[1,33],"white underfur":[0,31],"white unders":[0,31],"white undersides":[0,31],"white urajiro":[1,33],"white whitetail spots":[8,34],"white wings":[2,40],"white wings heavy":[2,40],"white wings scarce":[2,40],"white wolverine":[8,34],"white wraith":[3,0,53],"windstorm cracks":[3,2,108],"windstorm fringe":[3,2,108],"windstorm lykoi":[3,2,108],"windstorm wild stripes":[3,2,108],"wisp inverted opossum":[3,22,109],"wisp ornate blotches":[3,22,109],"wisp ornate spots":[3,22,109],"wisp sprite":[3,22,109],"xanthic arapawa coat":[8,34],"xanthic brindle":[4,32],"xanthic dilution":[8,34],"xanthic grizzle":[8,34],"xanthic inverted agouti":[8,34],"xanthic inverted manicou":[8,34],"xanthic inverted opossum":[8,34],"xanthic inverted panda":[2,40],"xanthic irish":[8,34],"xanthic low bottoms":[8,34],"xanthic lupos":[2,40],"xanthic merle":[2,40],"xanthic merle heavy":[2,40],"xanthic merle scarce":[2,40],"xanthic neck band":[8,34],"xanthic orca":[2,40],"xanthic points":[8,34],"xanthic sallander":[8,34],"xanthic soay unders":[8,34],"xanthic underbelly":[8,34],"xanthic unders":[8,34],"xanthic undersides":[8,34],"xanthic urajiro":[8,34],"xanthic wolverine":[8,34],"yellow arapawa coat":[8,34],"yellow back":[0,31],"yellow back half patch":[0,31],"yellow back heavy patch":[0,31],"yellow back patch":[0,31],"yellow bottoms":[0,31],"yellow brindle":[4,32],"yellow cape":[0,31],"yellow chipmunk back stripes":[8,34],"yellow chipmunk head stripes":[8,34],"yellow dilution":[0,31],"yellow dorsal":[0,31],"yellow ear tips":[1,33],"yellow epoch":[3,35,36],"yellow gentle unders":[1,33],"yellow grizzle":[0,31],"yellow half cape":[0,31],"yellow half dorsal":[0,31],"yellow half socks":[1,33],"yellow heavy husky":[1,33],"yellow highlights":[1,33],"yellow inuit unders":[7,39],"yellow inverted cross":[1,33],"yellow inverted panda":[2,40],"yellow light husky":[1,33],"yellow low bottoms":[0,31],"yellow lupos":[2,40],"yellow marbled unders":[1,33],"yellow medium husky":[1,33],"yellow merle":[2,40],"yellow merle heavy":[2,40],"yellow merle scarce":[2,40],"yellow neck band":[0,31],"yellow orca":[2,40],"yellow patchy unders":[1,33],"yellow raptor":[3,35,43],"yellow sallander":[8,34],"yellow shaded":[8,34],"yellow shimmer":[3,0,44],"yellow soay unders":[8,34],"yellow socks":[1,33],"yellow tamaskan unders":[7,39],"yellow trim":[1,33],"yellow tuxedo":[1,33],"yellow underbelly":[0,31],"yellow undercoat":[1,33],"yellow underfur":[0,31],"yellow unders":[0,31],"yellow undersides":[0,31],"yellow urajiro":[1,33],"yellow whitetail spots":[8,34],"yellow wolverine":[8,34],"zircon arapawa coat":[6,26],"zircon back":[6,26],"zircon brindle":[10,27],"zircon butcher":[6,26],"zircon carnage":[6,26],"zircon dilution":[6,26],"zircon elbow patch":[6,26],"zircon highlights":[6,26],"zircon inverted cross":[6,26],"zircon inverted panda":[6,26],"zircon lupos":[6,26],"zircon orca":[6,26],"zircon patchy unders":[6,26],"zircon points":[6,26],"zircon predator":[6,26],"zircon sallander":[6,26],"zircon spectacles":[6,26],"zircon tamaskan unders":[6,26],"zircon undercoat":[6,26],"zircon underfur":[6,26],"zircon unders":[6,26],"zircon undersides":[6,26]},"combos":{"argent":["Shell","White"],"arthia":["Artemis","Cynthia"],"auburn":["Black","Red"],"cocoa":["Black","Cream"],"dark crystal":["Crystal","Umbra"],"deira":["Beige","Honey"],"diaelum":["Caelum","Diana"],"dinar":["Brown","Honey"],"doubloon":["Honey","Yellow"],"ducat":["White","Yellow"],"glownoise":["Airglow","Turquoise"],"iridium":["Black","Gray"],"lily":["Aspen","Red"],"marble":["Gray","Shell"],"moonloss":["Losna","Moonlight"],"nightform":["Biform","Nightchill"],"rufous":["Dark Brown","Red"],"saffron":["Beige","Yellow"],"selunia":["Luna","Selene"],"sepia":["Brown","Yellow"],"shedua":["Black","Honey"],"silver":["Black","White"],"sterling":["Black","Silver"],"tuff":["Cream","Silver"],"zircon":["Cream","Red"]},"muts":{"albinism":{"n":"Albinism","slot":"Secondary Mutation","l":0,"t":"genetic","e":["layers"]},"brachycephaly":{"n":"Brachycephaly","l":1,"t":"genetic","age":"1.5 months (3 rollovers)"},"conjoined twins":{"n":"Conjoined Twins","l":1,"t":"random","age":"4.5 months (9 rollovers)"},"hereditary cataracts":{"n":"Hereditary Cataracts","slot":"Secondary Mutation","l":0,"t":"genetic","e":["herbalist-only"]},"hyperdontia":{"n":"Hyperdontia","slot":"Tertiary Mutation","l":0,"t":"random","e":["strength-finisher"]},"macrodontia":{"n":"Macrodontia","slot":"Tertiary Mutation","l":0,"t":"random","e":["strength-finisher"]},"melanism":{"n":"Melanism","slot":"Secondary Mutation","l":0,"t":"genetic","e":["layers-not-eyes"]},"overgrown tongue":{"n":"Overgrown Tongue","slot":"Tertiary Mutation","l":0,"t":"random"},"patches: mottled":{"n":"Patches: Mottled","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-dark"]},"patches: pointed":{"n":"Patches: Pointed","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-dark"]},"patches: split":{"n":"Patches: Split","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-dark"]},"patches: tar":{"n":"Patches: Tar","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-dark"]},"piebald: biewer":{"n":"Piebald: Biewer","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"piebald: blaze":{"n":"Piebald: Blaze","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"piebald: dalmatian":{"n":"Piebald: Dalmatian","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"piebald: dip":{"n":"Piebald: Dip","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"piebald: frontal":{"n":"Piebald: Frontal","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"piebald: karakachan":{"n":"Piebald: Karakachan","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"piebald: paint":{"n":"Piebald: Paint","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"piebald: torn":{"n":"Piebald: Torn","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"piebald: uneven":{"n":"Piebald: Uneven","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"piebald: zerdava":{"n":"Piebald: Zerdava","slot":"Secondary Mutation","l":0,"t":"applicator","e":["layers-light"]},"polycephaly":{"n":"Polycephaly","l":1,"t":"random","age":"2 months (4 rollovers)"},"polymelia":{"n":"Polymelia","l":1,"t":"random","age":"2.5 months (5 rollovers)"},"sirenomelia":{"n":"Sirenomelia","l":1,"t":"random","age":"2 months (4 rollovers)"},"spontaneous blindness":{"n":"Spontaneous Blindness","slot":"Secondary Mutation","l":0,"t":"random","e":["herbalist-only"]},"toothless":{"n":"Toothless","slot":"Tertiary Mutation","l":0,"t":"random"},"double uterus":{"n":"Double Uterus","slot":"Secondary Mutation","l":0,"t":"random","ad":1}},"snc":{"skin":{"aarluk":"Cataclysms applicator","anomaly":"Cataclysms applicator","anteros":"The Matchmaker applicator","antumbral":"Lunar Dreams applicator","apollo":"Lunar Dreams applicator","astraea":"The Matchmaker applicator","bistre":"NBW","black":"NBW","blend":"Cataclysms applicator","blue":"Custom","brown":"NBW","chill":"Lunar Dreams applicator","conflux":"Cataclysms applicator","corrupt":"Cataclysms applicator","coral":"Lunar Dreams applicator","cynthius":"Lunar Dreams applicator","dark":"NBW","dark brown":"NBW","dius":"Lunar Dreams applicator","duorum":"Lunar Dreams applicator","fallow":"NBW","fern":"Coigreach applicator","fey":"Coigreach applicator","fungus":"Lunar Dreams applicator","glazed":"Lunar Dreams applicator","gray":"NBW","grime":"Cataclysms applicator","leto":"The Matchmaker applicator","light":"NBW","light brown":"NBW","lunar":"Lunar Dreams applicator","lusxnei":"Lunar Dreams applicator","marbled":"Custom","moonbow":"Lunar Dreams applicator","mud":"Cataclysms applicator","mycelium":"Lunar Dreams applicator","noctiluca":"Lunar Dreams applicator","ooze":"Lunar Dreams applicator","oxblood":"NBW","pale":"Custom","pallid":"Custom","peat":"Coigreach applicator","penumbral":"Lunar Dreams applicator","pink":"Custom","regolith":"Lunar Dreams applicator","rouge":"The Matchmaker applicator","sacer":"Lunar Dreams applicator","seep":"Lunar Dreams applicator","selenite":"Lunar Dreams applicator","sitheach":"Coigreach applicator","spectre":"Halloween Spectacle applicator","squall":"Cataclysms applicator","tan":"NBW","tywyll":"Coigreach applicator","umbral":"Lunar Dreams applicator","verdigris":"Lunar Dreams applicator","vile":"Halloween Spectacle applicator","wild":"Cataclysms applicator"},"nose":{"aarluk":"Cataclysms applicator","anomaly":"Cataclysms applicator","anteros":"The Matchmaker applicator","antumbral":"Lunar Dreams applicator","apollo":"Lunar Dreams applicator","astraea":"The Matchmaker applicator","bistre":"NBW","black":"NBW","blend":"Cataclysms applicator","blue":"Custom","brown":"NBW","chill":"Lunar Dreams applicator","conflux":"Cataclysms applicator","corrupt":"Cataclysms applicator","coral":"Lunar Dreams applicator","cynthius":"Lunar Dreams applicator","dark":"NBW","dark brown":"NBW","dius":"Lunar Dreams applicator","duorum":"Lunar Dreams applicator","fallow":"NBW","fern":"Coigreach applicator","fey":"Coigreach applicator","fungus":"Lunar Dreams applicator","glazed":"Lunar Dreams applicator","gray":"NBW","grime":"Cataclysms applicator","leto":"The Matchmaker applicator","light":"NBW","light brown":"NBW","lunar":"Lunar Dreams applicator","lusxnei":"Lunar Dreams applicator","marbled":"Custom","moonbow":"Lunar Dreams applicator","mud":"Cataclysms applicator","mycelium":"Lunar Dreams applicator","noctiluca":"Lunar Dreams applicator","ooze":"Lunar Dreams applicator","oxblood":"NBW","pale":"Custom","pallid":"Custom","peat":"Coigreach applicator","penumbral":"Lunar Dreams applicator","pink":"Custom","regolith":"Lunar Dreams applicator","rouge":"The Matchmaker applicator","sacer":"Lunar Dreams applicator","seep":"Lunar Dreams applicator","selenite":"Lunar Dreams applicator","sitheach":"Coigreach applicator","spectre":"Halloween Spectacle applicator","squall":"Cataclysms applicator","tan":"NBW","tywyll":"Coigreach applicator","umbral":"Lunar Dreams applicator","verdigris":"Lunar Dreams applicator","vile":"Halloween Spectacle applicator","wild":"Cataclysms applicator"},"claw":{"aarluk":"Cataclysms applicator","anomaly":"Cataclysms applicator","anteros":"The Matchmaker applicator","antumbral":"Lunar Dreams applicator","apollo":"Lunar Dreams applicator","astraea":"The Matchmaker applicator","bistre":"NBW","black":"NBW","blend":"Cataclysms applicator","bone":"NBW","brown":"NBW","chill":"Lunar Dreams applicator","conflux":"Cataclysms applicator","corrupt":"Cataclysms applicator","coral":"Lunar Dreams applicator","cynthius":"Lunar Dreams applicator","dark":"NBW","dius":"Lunar Dreams applicator","duorum":"Lunar Dreams applicator","fern":"Coigreach applicator","fey":"Coigreach applicator","fungus":"Lunar Dreams applicator","glazed":"Lunar Dreams applicator","gray":"NBW","grime":"Cataclysms applicator","leto":"The Matchmaker applicator","light":"NBW","lunar":"Lunar Dreams applicator","lusxnei":"Lunar Dreams applicator","moonbow":"Lunar Dreams applicator","mud":"Cataclysms applicator","mycelium":"Lunar Dreams applicator","noctiluca":"Lunar Dreams applicator","ooze":"Lunar Dreams applicator","oxblood":"NBW","peat":"Coigreach applicator","penumbral":"Lunar Dreams applicator","root":"NBW","regolith":"Lunar Dreams applicator","rouge":"The Matchmaker applicator","sacer":"Lunar Dreams applicator","seep":"Lunar Dreams applicator","sandy":"NBW","selenite":"Lunar Dreams applicator","sitheach":"Coigreach applicator","spectre":"Halloween Spectacle applicator","squall":"Cataclysms applicator","tywyll":"Coigreach applicator","umbral":"Lunar Dreams applicator","verdigris":"Lunar Dreams applicator","vile":"Halloween Spectacle applicator","white":"NBW","wild":"Cataclysms applicator"}}};
  /* @genetics-end */

  // Personality facts from the Grouse House Wiki. Regenerate with: python tools/export_personality.py
  /* @personality-begin: generated by tools/export_personality.py, do not edit by hand */
  const PERSONALITY = {"exported":"2026-10-02","wiki":"https://grousehouse.wiki/Personality","disp":["Aggressive","Friendly","Romantic","Stoic"],"p":{"adventurous":{"n":"Adventurous","d":"Friendly","s":{"SPD":7,"AGI":-3,"SMR":3}},"aloof":{"n":"Aloof","d":"Stoic","s":{"AGI":3,"WIS":-3,"SMR":7}},"amiable":{"n":"Amiable","d":"Friendly","s":{"STR":-3,"AGI":3,"WIS":7}},"anxious":{"n":"Anxious","d":"Stoic","s":{"STR":-3,"SPD":7,"AGI":3}},"arrogant":{"n":"Arrogant","d":"Aggressive","s":{"STR":7,"AGI":3,"WIS":-3}},"bossy":{"n":"Bossy","d":"Aggressive","s":{"STR":3,"AGI":-3,"WIS":7}},"capable":{"n":"Capable","d":"Romantic","s":{"STR":7,"AGI":-3,"WIS":3}},"charming":{"n":"Charming","d":"Romantic","s":{"STR":7,"WIS":-3,"SMR":3}},"combative":{"n":"Combative","d":"Aggressive","s":{"STR":7,"SPD":3,"WIS":-3}},"conceited":{"n":"Conceited","d":"Aggressive","s":{"STR":7,"AGI":3,"SMR":-3}},"confident":{"n":"Confident","d":"Romantic","s":{"STR":7,"SPD":3,"AGI":-3}},"dedicated":{"n":"Dedicated","d":"Romantic","s":{"STR":3,"WIS":7,"SMR":-3}},"dishonest":{"n":"Dishonest","d":"Stoic","s":{"SPD":7,"WIS":-3,"SMR":3}},"dutiful":{"n":"Dutiful","d":"Romantic","s":{"STR":7,"WIS":3,"SMR":-3}},"fair":{"n":"Fair","d":"Friendly","s":{"SPD":-3,"WIS":3,"SMR":7}},"helpful":{"n":"Helpful","d":"Friendly","s":{"SPD":3,"AGI":-3,"SMR":7}},"humble":{"n":"Humble","d":"Friendly","s":{"STR":-3,"AGI":7,"WIS":3}},"imaginative":{"n":"Imaginative","d":"Romantic","s":{"STR":-3,"SPD":3,"WIS":7}},"impulsive":{"n":"Impulsive","d":"Aggressive","s":{"SPD":7,"WIS":-3,"SMR":3}},"independent":{"n":"Independent","d":"Stoic","s":{"SPD":-3,"AGI":3,"WIS":7}},"keen":{"n":"Keen","d":"Romantic","s":{"STR":-3,"SPD":7,"SMR":3}},"lazy":{"n":"Lazy","d":"Friendly","s":{"SPD":-3,"AGI":7,"WIS":3}},"malicious":{"n":"Malicious","d":"Aggressive","s":{"STR":7,"AGI":-3,"SMR":3}},"neutral":{"n":"Neutral","d":"Stoic","s":{"STR":2,"SPD":2,"AGI":2,"WIS":2,"SMR":2}},"obnoxious":{"n":"Obnoxious","d":"Aggressive","s":{"SPD":3,"AGI":7,"SMR":-3}},"observant":{"n":"Observant","d":"Friendly","s":{"AGI":-3,"WIS":7,"SMR":3}},"optimistic":{"n":"Optimistic","d":"Friendly","s":{"SPD":3,"AGI":7,"WIS":-3}},"pessimistic":{"n":"Pessimistic","d":"Stoic","s":{"STR":3,"SPD":-3,"AGI":7}},"precise":{"n":"Precise","d":"Romantic","s":{"SPD":-3,"AGI":7,"SMR":3}},"quiet":{"n":"Quiet","d":"Stoic","s":{"SPD":-3,"WIS":7,"SMR":3}},"reliable":{"n":"Reliable","d":"Romantic","s":{"STR":7,"SPD":-3,"AGI":3}},"sarcastic":{"n":"Sarcastic","d":"Aggressive","s":{"STR":-3,"WIS":3,"SMR":7}},"scatterbrained":{"n":"Scatterbrained","d":"Friendly","s":{"STR":3,"SPD":7,"SMR":-3}},"selfish":{"n":"Selfish","d":"Aggressive","s":{"STR":3,"WIS":-3,"SMR":7}},"sneaky":{"n":"Sneaky","d":"Stoic","s":{"SPD":-3,"AGI":3,"SMR":7}},"sociable":{"n":"Sociable","d":"Friendly","s":{"STR":-3,"SPD":3,"SMR":7}},"sullen":{"n":"Sullen","d":"Stoic","s":{"STR":3,"AGI":7,"SMR":-3}},"trusting":{"n":"Trusting","d":"Romantic","s":{"AGI":7,"WIS":3,"SMR":-3}},"unfriendly":{"n":"Unfriendly","d":"Stoic","s":{"STR":3,"WIS":-3,"SMR":7}},"vulgar":{"n":"Vulgar","d":"Aggressive","s":{"STR":-3,"SPD":3,"AGI":7}}},"clash":[["Aggressive","Friendly"],["Romantic","Stoic"]],"social":{"same":5,"Friendly|Romantic":2,"Aggressive|Stoic":2,"Aggressive|Romantic":-2,"Friendly|Stoic":-2,"Romantic|Stoic":-5,"Aggressive|Friendly":-5}};
  /* @personality-end */

  // ==================================================================== boot

  // Offline test pages in dev/ can reach a few internals (theme previews).
  // Real Wolvden pages never carry the dk-fixture tag, so this never runs there.
  if (document.querySelector('meta[name="dk-fixture"]')) window.__denkit = { PRESETS, popCard, h, recipeBlock, RECIPE_BOOK, GENETICS };

  paintTheme();
  placeUi();
  for (const m of modules) if (isOn(m)) safely(m, 'start');
})();
