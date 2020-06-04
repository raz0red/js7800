/*
 * FM Sound Generator with OPN/OPM interface
 * Copyright (C) by cisc 1998, 2003.
 * 
 * English conversion via Google Translate 
 * (see LICENSE-third-party for more details)
 *
 * - The author of this source code (cisc@retropc.net) owns the copyright.
 * - This source code is provided as it is,
 *   No warranty is implied or expressed.
 * - Using this source code, not using it
 *   Occurred or expected to occur regarding unavailable
 *   The author is not responsible for any damage.
 * - This source code can be freely modified/embedded as long as the following
 *   restrictions are met:
 *   It can be distributed and used.
 * 
 *   1. Specify the origin (author, copyright) of this software.
 *   2. Use free software when distributing.
 *   3. When distributing the modified source code, specify the modification
 *      contents.
 *   4. Do not modify this text at all when distributing the source code
 *      Please attach it as it is.
 * 
 * We would appreciate it if you could contact the author when publishing.
 * 
 * A part of this source code in commercial software (including shareware), or
 * It is necessary to obtain the author's agreement before incorporating all 
 * of them.
 */
var __extends =
  (this && this.__extends) ||
  function (t, e) {
    function i() {
      this.constructor = t;
    }
    for (var s in e) e.hasOwnProperty(s) && (t[s] = e[s]);
    t.prototype = null === e ? Object.create(e) : ((i.prototype = e.prototype), new i());
  },
  FM;
!(function (t) {
  "use strict";
  (t.FM_PGBITS = 9),
    (t.FM_RATIOBITS = 7),
    (t.FM_LFOBITS = 8),
    (t.FM_TLBITS = 7),
    (t.FM_TLENTS = 1 << t.FM_TLBITS),
    (t.FM_LFOENTS = 1 << t.FM_LFOBITS),
    (t.FM_CLENTS = 8192),
    (t.FM_OPSINBITS = 10),
    (t.FM_OPSINENTS = 1 << t.FM_OPSINBITS),
    (t.FM_EG_BOTTOM = 955),
    (t.IS2EC_SHIFT = 20 + t.FM_PGBITS - 13);
})(FM || (FM = {}));
var FM;
!(function (t) {
  "use strict";
  function e() {
    if (!t.tablemade) {
      t.tablemade = !0;
      var e,
        i,
        s = [
          [0, 1 / 360, 2 / 360, 3 / 360, 4 / 360, 6 / 360, 12 / 360, 24 / 360],
          [0, 1 / 480, 2 / 480, 4 / 480, 10 / 480, 20 / 480, 80 / 480, 140 / 480],
        ],
        h = [
          [31, 6, 4, 3],
          [31, 2, 1, 0],
        ];
      (t.pmtable = new Array(2)), (t.amtable = new Array(2));
      for (var a = 0; 2 > a; a++) {
        for (t.pmtable[a] = new Array(8), e = 0; 8 > e; e++) {
          var o = s[a][e];
          for (t.pmtable[a][e] = new Array(t.FM_LFOENTS), i = 0; i < t.FM_LFOENTS; i++) {
            var n = (Math.pow(2, (o * (2 * i - t.FM_LFOENTS + 1)) / (t.FM_LFOENTS - 1)), 0.6 * o * Math.sin((2 * i * Math.PI) / t.FM_LFOENTS) + 1);
            t.pmtable[a][e][i] = (65536 * (n - 1)) | 0;
          }
        }
        for (t.amtable[a] = new Array(4), e = 0; 4 > e; e++) for (t.amtable[a][e] = new Array(t.FM_LFOENTS), i = 0; i < t.FM_LFOENTS; i++) t.amtable[a][e][i] = (2 * ((4 * i) >> h[a][e])) << 2;
      }
    }
  }
  !(function (t) {
    (t[(t.typeN = 0)] = "typeN"), (t[(t.typeM = 1)] = "typeM");
  })(t.OpType || (t.OpType = {}));
  t.OpType;
  t.tablemade = !1;
  var i = (function () {
    function e() {
      (this.chip_ = null),
        (this.out_ = 0),
        (this.out2_ = 0),
        (this.in2_ = 0),
        (this.dp_ = 0),
        (this.detune_ = 0),
        (this.detune2_ = 0),
        (this.multiple_ = 0),
        (this.pg_count_ = 0),
        (this.pg_diff_ = 0),
        (this.pg_diff_lfo_ = 0),
        (this.bn_ = 0),
        (this.eg_level_ = 0),
        (this.eg_level_on_next_phase_ = 0),
        (this.eg_count_ = 0),
        (this.eg_count_diff_ = 0),
        (this.eg_out_ = 0),
        (this.tl_out_ = 0),
        (this.eg_rate_ = 0),
        (this.eg_curve_count_ = 0),
        (this.key_scale_rate_ = 0),
        (this.eg_phase_ = e.EGPhase.next),
        (this.ms_ = 0),
        (this.tl_ = 0),
        (this.tl_latch_ = 0),
        (this.ar_ = 0),
        (this.dr_ = 0),
        (this.sr_ = 0),
        (this.sl_ = 0),
        (this.rr_ = 0),
        (this.ks_ = 0),
        (this.keyon_ = !1),
        (this.amon_ = !1),
        (this.param_changed_ = !1),
        (this.mute_ = !1),
        (this.dbgopout_ = 0),
        (this.dbgpgout_ = 0),
        e.tablehasmade || this.MakeTable(),
        (this.ar_ = this.dr_ = this.sr_ = this.rr_ = this.key_scale_rate_ = 0),
        (this.ams_ = t.amtable[0][0]),
        (this.mute_ = !1),
        (this.keyon_ = !1),
        (this.tl_out_ = 0),
        (this.multiple_ = 0),
        (this.detune_ = 0),
        (this.detune2_ = 0),
        (this.ms_ = 0);
    }
    return (
      (e.prototype.SetChip = function (t) {
        this.chip_ = t;
      }),
      (e.prototype.Reset = function () {
        (this.tl_ = this.tl_latch_ = 127), this.ShiftPhase(e.EGPhase.off), (this.eg_count_ = 0), (this.eg_curve_count_ = 0), (this.pg_count_ = 0), (this.out_ = this.out2_ = 0), (this.param_changed_ = !0);
      }),
      (e.prototype.MakeTable = function () {
        var i,
          s = 0;
        for (i = 0; 256 > i; i++) {
          var h = Math.floor(Math.pow(2, 13 - i / 256));
          (h = (h + 2) & -4), (e.cltable[s++] = h), (e.cltable[s++] = -h);
        }
        for (; s < t.FM_CLENTS;) (e.cltable[s] = (e.cltable[s - 512] / 2) | 0), s++;
        for (i = 0; i < t.FM_OPSINENTS / 2; i++) {
          var a = ((2 * i + 1) * Math.PI) / t.FM_OPSINENTS,
            o = (-256 * Math.log(Math.sin(a))) / Math.LN2,
            n = Math.floor(o + 0.5) + 1;
          (e.sinetable[i] = 2 * n), (e.sinetable[t.FM_OPSINENTS / 2 + i] = 2 * n + 1);
        }
        t.MakeLFOTable(), (e.tablehasmade = !0);
      }),
      (e.prototype.SetDPBN = function (t, e) {
        (this.dp_ = t), (this.bn_ = e), (this.param_changed_ = !0);
      }),
      (e.prototype.Prepare = function () {
        if (this.param_changed_) {
          switch (
          ((this.param_changed_ = !1),
            (this.pg_diff_ = (this.dp_ + e.dttable[this.detune_ + this.bn_]) * this.chip_.GetMulValue(this.detune2_, this.multiple_)),
            (this.pg_diff_lfo_ = this.pg_diff_ >> 11),
            (this.key_scale_rate_ = this.bn_ >> (3 - this.ks_)),
            (this.tl_out_ = this.mute_ ? 1023 : 8 * this.tl_),
            this.eg_phase_)
          ) {
            case e.EGPhase.attack:
              this.SetEGRate(this.ar_ ? Math.min(63, this.ar_ + this.key_scale_rate_) : 0);
              break;
            case e.EGPhase.decay:
              this.SetEGRate(this.dr_ ? Math.min(63, this.dr_ + this.key_scale_rate_) : 0), (this.eg_level_on_next_phase_ = 8 * this.sl_);
              break;
            case e.EGPhase.sustain:
              this.SetEGRate(this.sr_ ? Math.min(63, this.sr_ + this.key_scale_rate_) : 0);
              break;
            case e.EGPhase.release:
              this.SetEGRate(Math.min(63, this.rr_ + this.key_scale_rate_));
          }
          (this.ams_ = t.amtable[this.type_][this.amon_ ? (this.ms_ >> 4) & 3 : 0]), this.EGUpdate(), (this.dbgopout_ = 0);
        }
      }),
      (e.prototype.ShiftPhase = function (i) {
        switch (i) {
          case e.EGPhase.attack:
            if (this.ar_ + this.key_scale_rate_ < 62) {
              this.SetEGRate(this.ar_ ? Math.min(63, this.ar_ + this.key_scale_rate_) : 0), (this.eg_phase_ = e.EGPhase.attack);
              break;
            }
          case e.EGPhase.decay:
            if (this.sl_) {
              (this.eg_level_ = 0), (this.eg_level_on_next_phase_ = 8 * this.sl_), this.SetEGRate(this.dr_ ? Math.min(63, this.dr_ + this.key_scale_rate_) : 0), (this.eg_phase_ = e.EGPhase.decay);
              break;
            }
          case e.EGPhase.sustain:
            (this.eg_level_ = 8 * this.sl_), (this.eg_level_on_next_phase_ = 1024), this.SetEGRate(this.sr_ ? Math.min(63, this.sr_ + this.key_scale_rate_) : 0), (this.eg_phase_ = e.EGPhase.sustain);
            break;
          case e.EGPhase.release:
            if (this.eg_phase_ === e.EGPhase.attack || this.eg_level_ < t.FM_EG_BOTTOM) {
              (this.eg_level_on_next_phase_ = 1024), this.SetEGRate(Math.min(63, this.rr_ + this.key_scale_rate_)), (this.eg_phase_ = e.EGPhase.release);
              break;
            }
          case e.EGPhase.off:
          default:
            (this.eg_level_ = t.FM_EG_BOTTOM), (this.eg_level_on_next_phase_ = t.FM_EG_BOTTOM), this.EGUpdate(), this.SetEGRate(0), (this.eg_phase_ = e.EGPhase.off);
        }
      }),
      (e.prototype.SetFNum = function (t) {
        (this.dp_ = (2047 & t) << ((t >> 11) & 7)), (this.bn_ = e.notetable[(t >> 7) & 127]), (this.param_changed_ = !0);
      }),
      (e.prototype.LogToLin = function (i) {
        return i < t.FM_CLENTS ? e.cltable[i] : 0;
      }),
      (e.prototype.EGUpdate = function () {
        this.eg_out_ = Math.min(this.tl_out_ + this.eg_level_, 1023) << 3;
      }),
      (e.prototype.SetEGRate = function (t) {
        (this.eg_rate_ = t), (this.eg_count_diff_ = e.decaytable2[t >> 2] * this.chip_.GetRatio());
      }),
      (e.prototype.EGCalc = function () {
        if (((this.eg_count_ = 6141 << t.FM_RATIOBITS), this.eg_phase_ === e.EGPhase.attack)) {
          var i = e.attacktable[this.eg_rate_][7 & this.eg_curve_count_];
          i >= 0 && ((this.eg_level_ -= 1 + (this.eg_level_ >> i)), this.eg_level_ <= 0 && this.ShiftPhase(e.EGPhase.decay)), this.EGUpdate();
        } else (this.eg_level_ += e.decaytable1[this.eg_rate_][7 & this.eg_curve_count_]), this.eg_level_ >= this.eg_level_on_next_phase_ && this.ShiftPhase(this.eg_phase_ + 1), this.EGUpdate();
        this.eg_curve_count_++;
      }),
      (e.prototype.EGStep = function () {
        (this.eg_count_ -= this.eg_count_diff_), this.eg_count_ <= 0 && this.EGCalc();
      }),
      (e.prototype.PGCalc = function () {
        var t = this.pg_count_;
        return (this.pg_count_ += this.pg_diff_), (this.dbgpgout_ = t), t;
      }),
      (e.prototype.PGCalcL = function () {
        var t = this.pg_count_;
        return (this.pg_count_ += this.pg_diff_ + ((this.pg_diff_lfo_ * this.chip_.GetPMV()) >> 5)), (this.dbgpgout_ = t), t;
      }),
      (e.prototype.Calc = function (i) {
        this.EGStep(), (this.out2_ = this.out_);
        var s = this.PGCalc() >> (20 + t.FM_PGBITS - t.FM_OPSINBITS);
        return (s += i >> (20 + t.FM_PGBITS - t.FM_OPSINBITS - (2 + t.IS2EC_SHIFT))), (this.out_ = this.LogToLin(this.eg_out_ + e.sinetable[s & (t.FM_OPSINENTS - 1)])), (this.dbgopout_ = this.out_), this.out_;
      }),
      (e.prototype.CalcL = function (i) {
        this.EGStep();
        var s = this.PGCalcL() >> (20 + t.FM_PGBITS - t.FM_OPSINBITS);
        return (
          (s += i >> (20 + t.FM_PGBITS - t.FM_OPSINBITS - (2 + t.IS2EC_SHIFT))),
          (this.out_ = this.LogToLin(this.eg_out_ + e.sinetable[s & (t.FM_OPSINENTS - 1)] + this.ams_[this.chip_.GetAML()])),
          (this.dbgopout_ = this.out_),
          this.out_
        );
      }),
      (e.prototype.CalcN = function (t) {
        this.EGStep();
        var e = Math.max(0, 1023 - (this.tl_out_ + this.eg_level_)) << 1;
        return (t = (1 & t) - 1), (this.out_ = (e + t) ^ t), (this.dbgopout_ = this.out_), this.out_;
      }),
      (e.prototype.CalcFB = function (i) {
        this.EGStep();
        var s = this.out_ + this.out2_;
        this.out2_ = this.out_;
        var h = this.PGCalc() >> (20 + t.FM_PGBITS - t.FM_OPSINBITS);
        return 31 > i && (h += ((s << (1 + t.IS2EC_SHIFT)) >> i) >> (20 + t.FM_PGBITS - t.FM_OPSINBITS)), (this.out_ = this.LogToLin(this.eg_out_ + e.sinetable[h & (t.FM_OPSINENTS - 1)])), (this.dbgopout_ = this.out2_), this.out2_;
      }),
      (e.prototype.CalcFBL = function (i) {
        this.EGStep();
        var s = this.out_ + this.out2_;
        this.out2_ = this.out_;
        var h = this.PGCalcL() >> (20 + t.FM_PGBITS - t.FM_OPSINBITS);
        return (
          31 > i && (h += ((s << (1 + t.IS2EC_SHIFT)) >> i) >> (20 + t.FM_PGBITS - t.FM_OPSINBITS)),
          (this.out_ = this.LogToLin(this.eg_out_ + e.sinetable[h & (t.FM_OPSINENTS - 1)] + this.ams_[this.chip_.GetAML()])),
          (this.dbgopout_ = this.out_),
          this.out_
        );
      }),
      (e.prototype.ResetFB = function () {
        this.out_ = this.out2_ = 0;
      }),
      (e.prototype.KeyOn = function () {
        this.keyon_ ||
          ((this.keyon_ = !0), (this.eg_phase_ !== e.EGPhase.off && this.eg_phase_ !== e.EGPhase.release) || (this.ShiftPhase(e.EGPhase.attack), this.EGUpdate(), (this.in2_ = this.out_ = this.out2_ = 0), (this.pg_count_ = 0)));
      }),
      (e.prototype.KeyOff = function () {
        this.keyon_ && ((this.keyon_ = !1), this.ShiftPhase(e.EGPhase.release));
      }),
      (e.prototype.IsOn = function () {
        return this.eg_phase_ - e.EGPhase.off;
      }),
      (e.prototype.SetDT = function (t) {
        (this.detune_ = 32 * t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetDT2 = function (t) {
        (this.detune2_ = 3 & t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetMULTI = function (t) {
        (this.multiple_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetTL = function (t) {
        (this.tl_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetAR = function (t) {
        (this.ar_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetDR = function (t) {
        (this.dr_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetSR = function (t) {
        (this.sr_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetSL = function (t) {
        (this.sl_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetRR = function (t) {
        (this.rr_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetKS = function (t) {
        (this.ks_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetAMON = function (t) {
        (this.amon_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.Mute = function (t) {
        (this.mute_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.SetMS = function (t) {
        (this.ms_ = t), (this.param_changed_ = !0);
      }),
      (e.prototype.Out = function () {
        return this.out_;
      }),
      (e.notetable = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        2,
        3,
        3,
        3,
        3,
        3,
        3,
        3,
        4,
        4,
        4,
        4,
        4,
        4,
        4,
        5,
        6,
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        8,
        8,
        8,
        8,
        8,
        8,
        8,
        9,
        10,
        11,
        11,
        11,
        11,
        11,
        11,
        11,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        13,
        14,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        17,
        18,
        19,
        19,
        19,
        19,
        19,
        19,
        19,
        20,
        20,
        20,
        20,
        20,
        20,
        20,
        21,
        22,
        23,
        23,
        23,
        23,
        23,
        23,
        23,
        24,
        24,
        24,
        24,
        24,
        24,
        24,
        25,
        26,
        27,
        27,
        27,
        27,
        27,
        27,
        27,
        28,
        28,
        28,
        28,
        28,
        28,
        28,
        29,
        30,
        31,
        31,
        31,
        31,
        31,
        31,
        31,
      ]),
      (e.dttable = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        2,
        2,
        2,
        2,
        2,
        2,
        2,
        4,
        4,
        4,
        4,
        4,
        6,
        6,
        6,
        8,
        8,
        8,
        10,
        10,
        12,
        12,
        14,
        16,
        16,
        16,
        16,
        2,
        2,
        2,
        2,
        4,
        4,
        4,
        4,
        4,
        6,
        6,
        6,
        8,
        8,
        8,
        10,
        10,
        12,
        12,
        14,
        16,
        16,
        18,
        20,
        22,
        24,
        26,
        28,
        32,
        32,
        32,
        32,
        4,
        4,
        4,
        4,
        4,
        6,
        6,
        6,
        8,
        8,
        8,
        10,
        10,
        12,
        12,
        14,
        16,
        16,
        18,
        20,
        22,
        24,
        26,
        28,
        32,
        34,
        38,
        40,
        44,
        44,
        44,
        44,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        -2,
        -2,
        -2,
        -2,
        -2,
        -2,
        -2,
        -2,
        -4,
        -4,
        -4,
        -4,
        -4,
        -6,
        -6,
        -6,
        -8,
        -8,
        -8,
        -10,
        -10,
        -12,
        -12,
        -14,
        -16,
        -16,
        -16,
        -16,
        -2,
        -2,
        -2,
        -2,
        -4,
        -4,
        -4,
        -4,
        -4,
        -6,
        -6,
        -6,
        -8,
        -8,
        -8,
        -10,
        -10,
        -12,
        -12,
        -14,
        -16,
        -16,
        -18,
        -20,
        -22,
        -24,
        -26,
        -28,
        -32,
        -32,
        -32,
        -32,
        -4,
        -4,
        -4,
        -4,
        -4,
        -6,
        -6,
        -6,
        -8,
        -8,
        -8,
        -10,
        -10,
        -12,
        -12,
        -14,
        -16,
        -16,
        -18,
        -20,
        -22,
        -24,
        -26,
        -28,
        -32,
        -34,
        -38,
        -40,
        -44,
        -44,
        -44,
        -44,
      ]),
      (e.decaytable1 = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [2, 1, 1, 1, 2, 1, 1, 1],
        [2, 1, 2, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 2, 2, 1],
        [2, 2, 2, 2, 2, 2, 2, 2],
        [4, 2, 2, 2, 4, 2, 2, 2],
        [4, 2, 4, 2, 4, 2, 4, 2],
        [4, 4, 4, 2, 4, 4, 4, 2],
        [4, 4, 4, 4, 4, 4, 4, 4],
        [8, 4, 4, 4, 8, 4, 4, 4],
        [8, 4, 8, 4, 8, 4, 8, 4],
        [8, 8, 8, 4, 8, 8, 8, 4],
        [16, 16, 16, 16, 16, 16, 16, 16],
        [16, 16, 16, 16, 16, 16, 16, 16],
        [16, 16, 16, 16, 16, 16, 16, 16],
        [16, 16, 16, 16, 16, 16, 16, 16],
      ]),
      (e.decaytable2 = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2047, 2047, 2047, 2047, 2047]),
      (e.attacktable = [
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [4, 4, 4, 4, 4, 4, 4, 4],
        [4, 4, 4, 4, 4, 4, 4, 4],
        [4, 4, 4, 4, 4, 4, 4, 4],
        [4, 4, 4, 4, 4, 4, 4, 4],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, -1, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, -1, 4, -1],
        [4, 4, 4, -1, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, -1],
        [4, 4, 4, 4, 4, 4, 4, 4],
        [3, 4, 4, 4, 3, 4, 4, 4],
        [3, 4, 3, 4, 3, 4, 3, 4],
        [3, 3, 3, 4, 3, 3, 3, 4],
        [3, 3, 3, 3, 3, 3, 3, 3],
        [2, 3, 3, 3, 2, 3, 3, 3],
        [2, 3, 2, 3, 2, 3, 2, 3],
        [2, 2, 2, 3, 2, 2, 2, 3],
        [2, 2, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 2, 1, 2],
        [1, 1, 1, 2, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ]),
      (e.tablehasmade = !1),
      (e.sinetable = new Array(1024)),
      (e.cltable = new Array(t.FM_CLENTS)),
      (e.EGPhase = { next: 0, attack: 1, decay: 2, sustain: 3, release: 4, off: 5 }),
      e
    );
  })();
  t.Operator = i;
  var s = (function () {
    function e() {
      (this.op = [new i(), new i(), new i(), new i()]),
        (this.tablehasmade = !1),
        (this.fb = 0),
        (this.buf = new Array(4)),
        (this.inop = new Array(3)),
        (this.outop = new Array(3)),
        (this.algo_ = 0),
        (this.chip_ = null),
        this.tablehasmade || this.MakeTable(),
        this.SetAlgorithm(0),
        (this.pms = t.pmtable[0][0]);
    }
    return (
      (e.prototype.MakeTable = function () {
        for (var t = 0; 64 > t; t++) e.kftable[t] = (65536 * Math.pow(2, t / 768)) | 0;
      }),
      (e.prototype.SetChip = function (t) {
        this.chip_ = t;
        for (var e = 0; 4 > e; e++) this.op[e].SetChip(t);
      }),
      (e.prototype.Reset = function () {
        for (var t = 0; 4 > t; t++) this.op[t].Reset();
      }),
      (e.prototype.Prepare = function () {
        for (var e = 0; 4 > e; e++) this.op[e].Prepare();
        this.pms = t.pmtable[this.op[0].type_][7 & this.op[0].ms_];
        var i = this.op[0].IsOn() | this.op[1].IsOn() | this.op[2].IsOn() | this.op[3].IsOn() ? 1 : 0,
          s = this.op[0].ms_ & (this.op[0].amon_ || this.op[1].amon_ || this.op[2].amon_ || this.op[3].amon_ ? 55 : 7) ? 2 : 0;
        return i | s;
      }),
      (e.prototype.SetFNum = function (t) {
        for (var e = 0; 4 > e; e++) this.op[e].SetFNum(t);
      }),
      (e.prototype.SetKCKF = function (t, i) {
        var s = [5197, 5506, 5833, 6180, 6180, 6547, 6937, 7349, 7349, 7786, 8249, 8740, 8740, 9259, 9810, 10394],
          h = 19 - ((t >> 4) & 7),
          a = s[15 & t];
        a = 4 * (((a + 2) / 4) | 0);
        var o = a * e.kftable[63 & i];
        (o >>= 19), (o <<= 19), (o >>= h);
        var n = (t >> 2) & 31;
        this.op[0].SetDPBN(o, n), this.op[1].SetDPBN(o, n), this.op[2].SetDPBN(o, n), this.op[3].SetDPBN(o, n);
      }),
      (e.prototype.KeyControl = function (t) {
        1 & t ? this.op[0].KeyOn() : this.op[0].KeyOff(), 2 & t ? this.op[1].KeyOn() : this.op[1].KeyOff(), 4 & t ? this.op[2].KeyOn() : this.op[2].KeyOff(), 8 & t ? this.op[3].KeyOn() : this.op[3].KeyOff();
      }),
      (e.prototype.SetAlgorithm = function (t) {
        var e = [
          [0, 1, 1, 2, 2, 3],
          [1, 0, 0, 1, 1, 2],
          [1, 1, 1, 0, 0, 2],
          [0, 1, 2, 1, 1, 2],
          [0, 1, 2, 2, 2, 1],
          [0, 1, 0, 1, 0, 1],
          [0, 1, 2, 1, 2, 1],
          [1, 0, 1, 0, 1, 0],
        ];
        (this.inop[0] = e[t][0]), (this.outop[0] = e[t][1]), (this.inop[1] = e[t][2]), (this.outop[1] = e[t][3]), (this.inop[2] = e[t][4]), (this.outop[2] = e[t][5]), this.op[0].ResetFB(), (this.algo_ = t);
      }),
      (e.prototype.Calc = function () {
        var t;
        switch (this.algo_) {
          case 0:
            this.op[2].Calc(this.op[1].Out()), this.op[1].Calc(this.op[0].Out()), (t = this.op[3].Calc(this.op[2].Out())), this.op[0].CalcFB(this.fb);
            break;
          case 1:
            this.op[2].Calc(this.op[0].Out() + this.op[1].Out()), this.op[1].Calc(0), (t = this.op[3].Calc(this.op[2].Out())), this.op[0].CalcFB(this.fb);
            break;
          case 2:
            this.op[2].Calc(this.op[1].Out()), this.op[1].Calc(0), (t = this.op[3].Calc(this.op[0].Out() + this.op[2].Out())), this.op[0].CalcFB(this.fb);
            break;
          case 3:
            this.op[2].Calc(0), this.op[1].Calc(this.op[0].Out()), (t = this.op[3].Calc(this.op[1].Out() + this.op[2].Out())), this.op[0].CalcFB(this.fb);
            break;
          case 4:
            this.op[2].Calc(0), (t = this.op[1].Calc(this.op[0].Out())), (t += this.op[3].Calc(this.op[2].Out())), this.op[0].CalcFB(this.fb);
            break;
          case 5:
            (t = this.op[2].Calc(this.op[0].Out())), (t += this.op[1].Calc(this.op[0].Out())), (t += this.op[3].Calc(this.op[0].Out())), this.op[0].CalcFB(this.fb);
            break;
          case 6:
            (t = this.op[2].Calc(0)), (t += this.op[1].Calc(this.op[0].Out())), (t += this.op[3].Calc(0)), this.op[0].CalcFB(this.fb);
            break;
          case 7:
            (t = this.op[2].Calc(0)), (t += this.op[1].Calc(0)), (t += this.op[3].Calc(0)), (t += this.op[0].CalcFB(this.fb));
        }
        return t;
      }),
      (e.prototype.CalcL = function () {
        this.chip_.SetPMV(this.pms[this.chip_.GetPML()]);
        var t;
        switch (this.algo_) {
          case 0:
            this.op[2].CalcL(this.op[1].Out()), this.op[1].CalcL(this.op[0].Out()), (t = this.op[3].CalcL(this.op[2].Out())), this.op[0].CalcFBL(this.fb);
            break;
          case 1:
            this.op[2].CalcL(this.op[0].Out() + this.op[1].Out()), this.op[1].CalcL(0), (t = this.op[3].CalcL(this.op[2].Out())), this.op[0].CalcFBL(this.fb);
            break;
          case 2:
            this.op[2].CalcL(this.op[1].Out()), this.op[1].CalcL(0), (t = this.op[3].CalcL(this.op[0].Out() + this.op[2].Out())), this.op[0].CalcFBL(this.fb);
            break;
          case 3:
            this.op[2].CalcL(0), this.op[1].CalcL(this.op[0].Out()), (t = this.op[3].CalcL(this.op[1].Out() + this.op[2].Out())), this.op[0].CalcFBL(this.fb);
            break;
          case 4:
            this.op[2].CalcL(0), (t = this.op[1].CalcL(this.op[0].Out())), (t += this.op[3].CalcL(this.op[2].Out())), this.op[0].CalcFBL(this.fb);
            break;
          case 5:
            (t = this.op[2].CalcL(this.op[0].Out())), (t += this.op[1].CalcL(this.op[0].Out())), (t += this.op[3].CalcL(this.op[0].Out())), this.op[0].CalcFBL(this.fb);
            break;
          case 6:
            (t = this.op[2].CalcL(0)), (t += this.op[1].CalcL(this.op[0].Out())), (t += this.op[3].CalcL(0)), this.op[0].CalcFBL(this.fb);
            break;
          case 7:
            (t = this.op[2].CalcL(0)), (t += this.op[1].CalcL(0)), (t += this.op[3].CalcL(0)), (t += this.op[0].CalcFBL(this.fb));
        }
        return t;
      }),
      (e.prototype.CalcN = function (t) {
        (this.buf[1] = this.buf[2] = this.buf[3] = 0),
          (this.buf[0] = this.op[0].out_),
          this.op[0].CalcFB(this.fb),
          (this.buf[this.outop[0]] += this.op[1].Calc(this.buf[this.inop[0]])),
          (this.buf[this.outop[1]] += this.op[2].Calc(this.buf[this.inop[1]]));
        var e = this.op[3].out_;
        return this.op[3].CalcN(t), this.buf[this.outop[2]] + e;
      }),
      (e.prototype.CalcLN = function (t) {
        this.chip_.SetPMV(this.pms[this.chip_.GetPML()]),
          (this.buf[1] = this.buf[2] = this.buf[3] = 0),
          (this.buf[0] = this.op[0].out_),
          this.op[0].CalcFBL(this.fb),
          (this.buf[this.outop[0]] += this.op[1].CalcL(this.buf[this.inop[0]])),
          (this.buf[this.outop[1]] += this.op[2].CalcL(this.buf[this.inop[1]]));
        var e = this.op[3].out_;
        return this.op[3].CalcN(t), this.buf[this.outop[2]] + e;
      }),
      (e.prototype.SetType = function (t) {
        for (var e = 0; 4 > e; e++) this.op[e].type_ = t;
      }),
      (e.prototype.SetFB = function (t) {
        this.fb = e.fbtable[t];
      }),
      (e.prototype.SetMS = function (t) {
        for (var e = 0; 4 > e; e++) this.op[e].SetMS(t);
      }),
      (e.prototype.Mute = function (t) {
        for (var e = 0; 4 > e; e++) this.op[e].Mute(t);
      }),
      (e.fbtable = [31, 7, 6, 5, 4, 3, 2, 1]),
      (e.kftable = new Array(64)),
      e
    );
  })();
  t.Channel4 = s;
  var h = (function () {
    function e() {
      (this.ratio_ = 0), (this.aml_ = 0), (this.pml_ = 0), (this.pmv_ = 0);
    }
    return (
      (e.prototype.SetRatio = function (t) {
        this.ratio_ !== t && ((this.ratio_ = t), this.MakeTable());
      }),
      (e.prototype.SetAML = function (e) {
        this.aml_ = e & (t.FM_LFOENTS - 1);
      }),
      (e.prototype.SetPML = function (e) {
        this.pml_ = e & (t.FM_LFOENTS - 1);
      }),
      (e.prototype.SetPMV = function (t) {
        this.pmv_ = t;
      }),
      (e.prototype.GetMulValue = function (t, e) {
        return this.multable_[t][e];
      }),
      (e.prototype.GetAML = function () {
        return this.aml_;
      }),
      (e.prototype.GetPML = function () {
        return this.pml_;
      }),
      (e.prototype.GetPMV = function () {
        return this.pmv_;
      }),
      (e.prototype.GetRatio = function () {
        return this.ratio_;
      }),
      (e.prototype.MakeTable = function () {
        var e,
          i,
          s = [1, 1.414, 1.581, 1.732];
        for (this.multable_ = new Array(4), e = 0; 4 > e; e++) {
          var h = (s[e] * this.ratio_) / (1 << (2 + t.FM_RATIOBITS - t.FM_PGBITS));
          for (this.multable_[e] = new Array(16), i = 0; 16 > i; i++) {
            var a = i ? 2 * i : 1;
            this.multable_[e][i] = (a * h) | 0;
          }
        }
      }),
      e
    );
  })();
  (t.Chip = h), (t.MakeLFOTable = e);
})(FM || (FM = {}));
var FM;
!(function (t) {
  "use strict";
  var e = (function () {
    function t() {
      (this.OPM_LFOENTS = 512), (this.regtc = 0), (this.regta = new Array(2)), (this.timera = 0), (this.timera_count = 0), (this.timerb = 0), (this.timerb_count = 0), (this.timer_step = 0);
    }
    return (
      (t.prototype.Reset = function () {
        (this.timera_count = 0), (this.timerb_count = 0);
      }),
      (t.prototype.SetTimerControl = function (t) {
        var e = this.regtc ^ t;
        (this.regtc = t), 16 & t && this.ResetStatus(1), 32 & t && this.ResetStatus(2), 1 & e && (this.timera_count = 1 & t ? this.timera : 0), 2 & e && (this.timerb_count = 2 & t ? this.timerb : 0);
      }),
      (t.prototype.SetTimerA = function (t, e) {
        var i;
        (this.regta[1 & t] = e), (i = (this.regta[0] << 2) + (3 & this.regta[1])), (this.timera = (1024 - i) * this.timer_step);
      }),
      (t.prototype.SetTimerB = function (t) {
        this.timerb = (256 - t) * this.timer_step;
      }),
      (t.prototype.Count = function (t) {
        var e = !1;
        if (this.timera_count && ((this.timera_count -= t << 16), this.timera_count <= 0)) {
          for (e = !0, this.TimerA(); this.timera_count <= 0;) this.timera_count += this.timera;
          4 & this.regtc && this.SetStatus(1);
        }
        if (this.timerb_count && ((this.timerb_count -= t << 12), this.timerb_count <= 0)) {
          for (e = !0; this.timerb_count <= 0;) this.timerb_count += this.timerb;
          8 & this.regtc && this.SetStatus(2);
        }
        return e;
      }),
      (t.prototype.GetNextEvent = function () {
        var t = ((this.timera_count + 65535) >> 16) - 1,
          e = ((this.timerb_count + 4095) >> 12) - 1;
        return (e > t ? t : e) + 1;
      }),
      (t.prototype.SetTimerBase = function (t) {
        this.timer_step = (65536e6 / t) | 0;
      }),
      (t.prototype.SetStatus = function (t) { }),
      (t.prototype.ResetStatus = function (t) { }),
      (t.prototype.TimerA = function () { }),
      t
    );
  })();
  t.Timer = e;
})(FM || (FM = {}));
var FM;
!(function (t) {
  "use strict";
  var e = (function (e) {
    function i() {
      e.call(this),
        (this.fmvolume = 0),
        (this.clock = 0),
        (this.rate = 0),
        (this.pcmrate = 0),
        (this.pmd = 0),
        (this.amd = 0),
        (this.lfocount = 0),
        (this.lfodcount = 0),
        (this.lfo_count_ = 0),
        (this.lfo_count_diff_ = 0),
        (this.lfo_step_ = 0),
        (this.lfo_count_prev_ = 0),
        (this.lfowaveform = 0),
        (this.rateratio = 0),
        (this.noise = 0),
        (this.noisecount = 0),
        (this.noisedelta = 0),
        (this.interpolation = !1),
        (this.lfofreq = 0),
        (this.status = 0),
        (this.reg01 = 0),
        (this.kc = new Array(8)),
        (this.kf = new Array(8)),
        (this.pan = new Array(8)),
        (this.ch = [new t.Channel4(), new t.Channel4(), new t.Channel4(), new t.Channel4(), new t.Channel4(), new t.Channel4(), new t.Channel4(), new t.Channel4()]),
        (this.chip = new t.Chip()),
        (this.lfo_count_ = 0),
        (this.lfo_count_prev_ = -1),
        this.BuildLFOTable();
      for (var i = 0; 8 > i; i++) this.ch[i].SetChip(this.chip), this.ch[i].SetType(t.OpType.typeM);
    }
    return (
      __extends(i, e),
      (i.prototype.Init = function (t, e) {
        return this.SetRate(t, e) ? (this.Reset(), this.SetVolume(0), this.SetChannelMask(0), !0) : !1;
      }),
      (i.prototype.SetRate = function (t, e) {
        return (this.clock = t), (this.pcmrate = e), (this.rate = e), this.RebuildTimeTable(), !0;
      }),
      (i.prototype.SetChannelMask = function (t) {
        for (var e = 0; 8 > e; e++) this.ch[e].Mute(!!(t & (1 << e)));
      }),
      (i.prototype.Reset = function () {
        var t;
        for (t = 0; 256 > t; t++) this.SetReg(t, 0);
        for (this.SetReg(25, 128), e.prototype.Reset.call(this), this.status = 0, this.noise = 12345, this.noisecount = 0, t = 0; 8 > t; t++) this.ch[t].Reset();
      }),
      (i.prototype.RebuildTimeTable = function () {
        var e = (this.clock / 64) | 0;
        (this.rateratio = (((e << t.FM_RATIOBITS) + this.rate / 2) / this.rate) | 0), this.SetTimerBase(e), this.chip.SetRatio(this.rateratio);
      }),
      (i.prototype.SetVolume = function (t) {
        (t = Math.min(t, 20)), t > -192 ? (this.fmvolume = (16384 * Math.pow(10, t / 40)) | 0) : (this.fmvolume = 0);
      }),
      (i.prototype.SetStatus = function (t) {
        this.status & t || ((this.status |= t), this.Intr(!0));
      }),
      (i.prototype.GetStatus = function (t) {
        return this.status;
      }),
      (i.prototype.ResetStatus = function (t) {
        this.status & t && ((this.status &= ~t), this.status || this.Intr(!1));
      }),
      (i.prototype.SetReg = function (e, i) {
        if (!(e >= 256)) {
          var s = 7 & e;
          switch (255 & e) {
            case 1:
              2 & i && ((this.lfo_count_ = 0), (this.lfo_count_prev_ = -1)), (this.reg01 = i);
              break;
            case 8:
              128 & this.regtc
                ? ((s = 7 & i), 8 & i || this.ch[s].op[0].KeyOff(), 16 & i || this.ch[s].op[1].KeyOff(), 32 & i || this.ch[s].op[2].KeyOff(), 64 & i || this.ch[s].op[3].KeyOff())
                : this.ch[7 & i].KeyControl(i >> 3);
              break;
            case 16:
            case 17:
              this.SetTimerA(e, i);
              break;
            case 18:
              this.SetTimerB(i);
              break;
            case 20:
              this.SetTimerControl(i);
              break;
            case 24:
              (this.lfofreq = i), (this.lfo_count_diff_ = ((this.rateratio * ((16 + (15 & this.lfofreq)) << (12 - t.FM_RATIOBITS))) / (1 << (15 - (this.lfofreq >> 4)))) | 0);
              break;
            case 25:
              0 !== (128 & i) ? this.pmd : (this.amd = 127 & i);
              break;
            case 27:
              this.lfowaveform = 3 & i;
              break;
            case 32:
            case 33:
            case 34:
            case 35:
            case 36:
            case 37:
            case 38:
            case 39:
              this.ch[s].SetFB((i >> 3) & 7), this.ch[s].SetAlgorithm(7 & i), (this.pan[s] = (i >> 6) & 3);
              break;
            case 40:
            case 41:
            case 42:
            case 43:
            case 44:
            case 45:
            case 46:
            case 47:
              (this.kc[s] = i), this.ch[s].SetKCKF(this.kc[s], this.kf[s]);
              break;
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
              (this.kf[s] = i >> 2), this.ch[s].SetKCKF(this.kc[s], this.kf[s]);
              break;
            case 56:
            case 57:
            case 58:
            case 59:
            case 60:
            case 61:
            case 62:
            case 63:
              this.ch[s].SetMS((i << 4) | (i >> 4));
              break;
            case 15:
              (this.noisedelta = i), (this.noisecount = 0);
              break;
            default:
              e >= 64 && this.SetParameter(e, i);
          }
        }
      }),
      (i.prototype.SetParameter = function (t, e) {
        var i = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 124],
          s = [0, 2, 1, 3],
          h = s[(t >> 3) & 3],
          a = this.ch[7 & t].op[h];
        switch ((t >> 5) & 7) {
          case 2:
            a.SetDT((e >> 4) & 7), a.SetMULTI(15 & e);
            break;
          case 3:
            a.SetTL(127 & e);
            break;
          case 4:
            a.SetKS((e >> 6) & 3), a.SetAR(2 * (31 & e));
            break;
          case 5:
            a.SetDR(2 * (31 & e)), a.SetAMON(0 !== (128 & e));
            break;
          case 6:
            a.SetSR(2 * (31 & e)), a.SetDT2((e >> 6) & 3);
            break;
          case 7:
            a.SetSL(i[(e >> 4) & 15]), a.SetRR(4 * (15 & e) + 2);
        }
      }),
      (i.prototype.BuildLFOTable = function () {
        (this.amtable = new Array(4)), (this.pmtable = new Array(4));
        for (var t = 0; 4 > t; t++) {
          var e = 0;
          (this.amtable[t] = new Array(this.OPM_LFOENTS)), (this.pmtable[t] = new Array(this.OPM_LFOENTS));
          for (var i = 0; i < this.OPM_LFOENTS; i++) {
            var s, h;
            switch (t) {
              case 0:
                (h = ((((i + 256) & 511) / 2) | 0) - 128), (s = 255 - ((i / 2) | 0));
                break;
              case 1:
                (s = 256 > i ? 255 : 0), (h = 256 > i ? 127 : -128);
                break;
              case 2:
                (h = (i + 128) & 511), (h = 256 > h ? h - 128 : 383 - h), (s = 256 > i ? 255 - i : i - 256);
                break;
              case 3:
                3 & i || (e = 255 & ((((32768 * Math.random()) | 0) / 17) | 0)), (s = e), (h = e - 128);
            }
            (this.amtable[t][i] = s), (this.pmtable[t][i] = -h - 1);
          }
        }
      }),
      (i.prototype.LFO = function () {
        var t;
        3 !== this.lfowaveform
          ? ((t = (this.lfo_count_ >> 15) & 510), this.chip.SetPML(this.pmtable[this.lfowaveform][t] * ((this.pmd / 128) /*| 0*/) + 128), this.chip.SetAML(this.amtable[this.lfowaveform][t] * ((this.amd / 128) /*| 0*/)))
          : -131072 & (this.lfo_count_ ^ this.lfo_count_prev_) &&
          ((t = 255 & ((((32768 * Math.random()) | 0) / 17) | 0)), this.chip.SetPML(((((t - 128) * this.pmd) / 128) | 0) + 128), this.chip.SetAML(((t * this.amd) / 128) | 0)),
          (this.lfo_count_prev_ = this.lfo_count_),
          this.lfo_step_++,
          0 === (7 & this.lfo_step_) && (this.lfo_count_ += this.lfo_count_diff_);
      }),
      (i.prototype.Noise = function () {
        if (((this.noisecount += 2 * this.rateratio), this.noisecount >= 32 << t.FM_RATIOBITS)) {
          var e = 32 - (31 & this.noisedelta);
          1 === e && (e = 2), (this.noisecount = this.noisecount - (e << t.FM_RATIOBITS)), 31 === (31 & this.noisedelta) && (this.noisecount -= t.FM_RATIOBITS), (this.noise = (this.noise >> 1) ^ (1 & this.noise ? 33800 : 0));
        }
        return this.noise;
      }),
      (i.prototype.MixSub = function (t, e) {
        16384 & t && (e[this.pan[0]] = this.ch[0].Calc()),
          4096 & t && (e[this.pan[1]] += this.ch[1].Calc()),
          1024 & t && (e[this.pan[2]] += this.ch[2].Calc()),
          256 & t && (e[this.pan[3]] += this.ch[3].Calc()),
          64 & t && (e[this.pan[4]] += this.ch[4].Calc()),
          16 & t && (e[this.pan[5]] += this.ch[5].Calc()),
          4 & t && (e[this.pan[6]] += this.ch[6].Calc()),
          1 & t && (128 & this.noisedelta ? (e[this.pan[7]] += this.ch[7].CalcN(this.Noise())) : (e[this.pan[7]] += this.ch[7].Calc()));
      }),
      (i.prototype.MixSubL = function (t, e) {
        16384 & t && (e[this.pan[0]] = this.ch[0].CalcL()),
          4096 & t && (e[this.pan[1]] += this.ch[1].CalcL()),
          1024 & t && (e[this.pan[2]] += this.ch[2].CalcL()),
          256 & t && (e[this.pan[3]] += this.ch[3].CalcL()),
          64 & t && (e[this.pan[4]] += this.ch[4].CalcL()),
          16 & t && (e[this.pan[5]] += this.ch[5].CalcL()),
          4 & t && (e[this.pan[6]] += this.ch[6].CalcL()),
          1 & t && (128 & this.noisedelta ? (e[this.pan[7]] += this.ch[7].CalcLN(this.Noise())) : (e[this.pan[7]] += this.ch[7].CalcL()));
      }),
      (i.prototype.mixStereo = function (t, i, e) {
        var s = 0;
        for (var a = 0; a < 8; a++) {
          s = s << 2 | this.ch[a].Prepare()
        }
        if (this.reg01 & 2) {
          s &= 21845
        }      
        var n = e | 0;
        for (a = 0; a < i; a++) {
          h[1] = h[2] = h[3] = 0;
          this.LFO();
          if (s & 43690) {
            this.MixSubL(s, h)
          } else {
            this.MixSub(s, h)
          }
  
          t[n++] = ((h[1] + h[3] + h[2] + h[3])/(2*128));
        }
      }),      
      (i.prototype.Mix = function (t, e, i, s) {
        for (var h = 0, a = i + s, o = 0; 8 > o; o++) h = (h << 2) | this.ch[o].Prepare();
        2 & this.reg01 && (h &= 21845);
        var n = new Array(4);
        for (o = i; a > o; o++) (n[1] = n[2] = n[3] = 0), this.LFO(), 43690 & h ? this.MixSubL(h, n) : this.MixSub(h, n), (t[o] = (n[1] + n[3]) / 49152), (e[o] = (n[2] + n[3]) / 49152);
      }),
      (i.prototype.Intr = function (t) { }),
      i
    );
  })(t.Timer);
  t.OPM = e;
})(FM || (FM = {}));

var h = new Array(4);
var FREQ = 3579545;
var Ym2151 = new FM.OPM();
var result = Ym2151.Init(FREQ, 48000);

console.log("YM Init: " + result);

function reset() {
  Ym2151.Reset();
}

function setReg(reg, value) {
  Ym2151.SetReg(reg, value);
}

function mixStereo(buffer, count, offset) {
  Ym2151.mixStereo(buffer, count, offset);
}

function setSampleRate(rate) {
  console.log("Set YM sample rate: " + rate);
  Ym2151.SetRate(FREQ, rate);
}

function getStatus() {
  return Ym2151.GetStatus();
}

export { reset, setReg, mixStereo, setSampleRate, getStatus }