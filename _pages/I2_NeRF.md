---
layout: page
title:
permalink: /I2_NeRF/
math: true
---
  <div class="text-center mb-5">
    <h2 class="mb-2">
      I2-NeRF: Learning Neural Radiance Fields<br>
      Under Physically-Grounded Media Interactions
    </h2>

    <h3 class="text-muted mb-3">NeurIPS 2025</h3>

    <p class="mb-1">
    <a href="{{ '/' | relative_url }}" target="_blank" rel="noopener">
        Shuhong Liu
    </a><sup>1</sup>,
    <a href="https://sites.google.com/view/linguedu/home" target="_blank" rel="noopener">
        Lin Gu
    </a><sup>2</sup>,
    <a href="https://cuiziteng.github.io/" target="_blank" rel="noopener">
        Ziteng Cui
    </a><sup>1</sup>,
    <a href="https://xg-chu.site/" target="_blank" rel="noopener">
        Xuangeng Chu
    </a><sup>1</sup>,
    <a href="https://www.mi.t.u-tokyo.ac.jp/harada/" target="_blank" rel="noopener">
        Tatsuya Harada
    </a><sup>1,2</sup>
</p>
    <p class="mb-2">
      <sup>1</sup>The University of Tokyo,&nbsp;
      <sup>2</sup>RIKEN AIP
    </p>

    <!-- <p class="mb-3">
      <code>{ s-liu, lingu, cui, xuangeng.chu, harada }@mi.t.u-tokyo.ac.jp</code>
    </p> -->

    <!-- 按钮行：用 al-folio / Bootstrap 自带 btn 样式 -->
    <!-- Buttons -->
<style>
  /* 只影响本页按钮的微调样式 */
  .btn-project {
    text-transform: none !important;   /* 关闭全大写 */
    letter-spacing: normal !important; /* 关闭过度字间距 */
    border-radius: 9999px;             /* 胶囊形状 */
    padding: .35rem .9rem;             /* 紧凑 */
    font-weight: 600;
  }
  .btn-project:hover { transform: translateY(-1px); }
</style>

<div class="d-flex justify-content-center flex-wrap mt-3">
  <a class="btn btn-outline-primary btn-sm z-depth-0 btn-project mx-2 my-1"
     href="https://openreview.net/pdf?id=Iv11TSweoJ" target="_blank" role="button">
    <i class="fas fa-file-pdf mr-1" aria-hidden="true"></i> Paper (PDF)
  </a>

  <a class="btn btn-outline-primary btn-sm z-depth-0 btn-project mx-2 my-1"
     href="https://arxiv.org/abs/2510.22161" target="_blank" role="button">
    <i class="fas fa-book-open mr-1" aria-hidden="true"></i> arXiv
  </a>

  <a class="btn btn-outline-primary btn-sm z-depth-0 btn-project mx-2 my-1"
     href="https://github.com/ShuhongLL/I2-NeRF" target="_blank" role="button">
    <i class="fab fa-github mr-1" aria-hidden="true"></i> Code
  </a>

  <span class="btn btn-outline-secondary btn-sm z-depth-0 btn-project mx-2 my-1 disabled"
        role="button" aria-disabled="true">
    Data
  </span>
</div>
  </div>

  <hr>

  <!-- TL;DR -->
  <h2 id="overview">Overview</h2>
  <p>
    <strong>I2-NeRF</strong> is a physically grounded NeRF framework designed for
    media-degraded environments such as underwater, haze, and low-light scenes.
    The method combines:
  </p>

  <ul>
    <li>
      A <strong>general radiative formulation</strong> that unifies emission, absorption, and scattering under the Beer–Lambert law, covering various media types.
    </li>
    <li>
      A <strong>media-aware sampling strategy</strong> that allocates samples both on object surfaces and in low-density volumes, avoiding severe undersampling of the medium itself.
    </li>
    <li>
      <strong>Metric, isotropic perception</strong> enabled by explicitly modeling
      downwelling attenuation, so that the reconstructed field is consistent across directions once a global scale is known.
    </li>
  </ul>

  <!-- Teaser 占位图 -->
  <div class="text-center my-4">
    <video class="img-fluid rounded z-depth-1"
         style="max-width: 900px;"
         controls
         autoplay
         loop
         muted
         playsinline
         preload="auto">
    <source src="{{ '/assets/video/I2_NeRF/uw_cover.mp4' | relative_url }}" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  </div>

  <hr>

  <!-- Abstract -->
  <h2 id="abstract">Abstract</h2>

  <p>
    we propose I2-NeRF, a novel neural radiance field framework that enhances isometric and isotropic metric perception under media degradation. While existing NeRF models predominantly rely on object-centric sampling, I2-NeRF introduces a reverse-stratified upsampling strategy to achieve near-uniform sampling across 3D space, thereby preserving isometry. We further present a general radiative formulation for media degradation that unifies emission, absorption, and scattering into a particle model governed by the Beer–Lambert attenuation law. By composing the direct and media-induced in-scatter radiance, this formulation extends naturally to complex media environments such as underwater, haze, and even low-light scenes. By treating light propagation uniformly in both vertical and horizontal directions, I2-NeRF enables isotropic metric perception and can even estimate medium properties such as water depth. Experiments on real-world datasets demonstrate that our method significantly improves both reconstruction fidelity and physical plausibility compared to existing approaches. 
  </p>

  <hr>

  <h3>A Unified Model For Various Degradation Scenarios</h3>
  <p class="mb-2">
    We unify degradations with one radiative formulation:
    <strong>Observation = Emission × Absorption + Scattering</strong>.
  </p>

  <p class="text-muted">
    \( I \;=\; T\,J \;+\; \int_{0}^{z} T(0,t)\,S(t)\,dt
    \;\;\approx\;\; T\,J \;+\; (1-T)\,B \),
    with transmittance \( T=\exp(-\sigma\,z) \).
  </p>

  <ul class="mt-2">
    <li>
      <strong>Underwater.</strong>
      Wavelength-dependent extinction and backscatter:
      \( I(\lambda)=J(\lambda)\,e^{-\sigma(\lambda)z} \;+\; B_{\infty}(\lambda)\,\bigl(1-e^{-\sigma(\lambda)z}\bigr) \).
    </li>
    <li>
      <strong>Haze.</strong>
      Single extinction \( \sigma \) with air-light:
      \( I = J\,e^{-\sigma z} \;+\; A\,(1-e^{-\sigma z}) \).
    </li>
    <li>
      <strong>Low-light.</strong>
      Modeled as a <em><u>virtual absorption field</u></em> with negligible in-scatter:
      \( I \approx J\,e^{-\sigma z} \).  
    </li>
  </ul>
  <div class="text-center my-4">
    <img src="{{ '/assets/img/I2-NeRF/degrade_conditions.png' | relative_url }}"
         class="img-fluid rounded z-depth-1"
         alt="degradation conditions">
  </div>

  <hr>

  <!-- 模型 -->
  <h3>General Radiative Formulation</h3>
  <p>
    We decompose a camera ray into <strong>Emission</strong> (scene radiance \(J\)),
    <strong>Absorption</strong> (Beer–Lambert transmittance \(T\)),
    and <strong>Scattering</strong> (isotropic in-scatter).
    We also model <em><u>downwelling attenuation</u></em> with vertical light traveling distance, so the illumination that feeds the in-scatter decays as
    \(L_{\downarrow}(h)=\Phi\,e^{-\sigma z^{\Phi}}\).
    This keeps propagation consistent along the view direction and height, enabling isotropic, metric-faithful reconstruction.
  </p>

  <div class="text-center my-4">
    <img src="{{ '/assets/img/I2-NeRF/radiative_illustration.png' | relative_url }}"
         class="img-fluid rounded z-depth-1"
         style="max-width: 600px;"
         alt="Radiative formulation illustration">
  </div>

  <hr>

  <h2 id="results">Experimental Results</h2>

  <h5 class="mt-4">Lowlight Condition</h5>
  <div class="text-center my-3">
  <video class="img-fluid rounded z-depth-1"
         style="max-width: 900px;"
         controls
         autoplay
         loop
         muted
         playsinline
         preload="auto">
    <source src="{{ '/assets/video/I2_NeRF/LOM_small.mp4' | relative_url }}" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <p class="small text-muted mt-2">
    If the video doesn’t play, <a href="{{ '/assets/video/I2_NeRF/LOM_small.mp4' | relative_url }}" target="_blank" rel="noopener">open the MP4</a>.
  </p>
  </div>

  <h5 class="mt-4">Water Scattering Condition</h5>
  <div class="text-center my-3">
  <video class="img-fluid rounded z-depth-1"
         style="max-width: 900px;"
         controls
         autoplay
         loop
         muted
         playsinline
         preload="auto">
    <source src="{{ '/assets/video/I2_NeRF/UW_render.mp4' | relative_url }}" type="video/mp4">
    Your browser does not support HTML5 video.
  </video>
  <p class="small text-muted mt-2">
    If the video doesn’t play, <a href="{{ '/assets/video/I2_NeRF/UW_render.mp4' | relative_url }}" target="_blank" rel="noopener">open the MP4</a>.
  </p>
  </div>

  <hr>

  <!-- Poster -->
  <h3 class="mt-5">Poster</h3>
  <p class="text-center text-muted mb-1">
    Click the poster to view it in full resolution.
  </p>

  <div class="text-center my-4">
    <!-- 外层 <a>：点击后在新标签页打开原图 -->
    <a href="{{ '/assets/img/I2-NeRF/poster-v2-small.png' | relative_url }}"
       target="_blank" rel="noopener">
      <!-- 内层 <img>：页面上显示的海报（缩放版） -->
      <img src="{{ '/assets/img/I2-NeRF/poster-v2-small.png' | relative_url }}"
           class="img-fluid rounded z-depth-1"
           style="max-width: 800px;"
           alt="I2-NeRF Poster">
    </a>
  </div>

  <!-- BibTeX -->
  <h2 id="bibtex">BibTeX</h2>

```bibtex
@inproceedings{liu2025i2nerf,
  title     = {I2-NeRF: Learning Neural Radiance Fields Under Physically-Grounded Media Interactions},
  author    = {Liu, Shuhong and Gu, Lin and Cui, Ziteng and Chu, Xuangeng and Harada, Tatsuya},
  booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
  year      = {2025},
}
```