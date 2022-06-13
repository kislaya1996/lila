import { bind, dataIcon } from 'common/snabbdom';
import { Controller, MaybeVNode } from '../interfaces';
import { h, VNode } from 'snabbdom';

const studyUrl = 'https://lichess.org/study/viiWlKjv';

export default function theme(ctrl: Controller): MaybeVNode {
  const data = ctrl.getData(),
    t = data.theme;
  const showEditor = ctrl.vm.mode == 'view' && !ctrl.autoNexting();
  if (data.replay) return showEditor ? h('div.puzzle__side__theme', editor(ctrl)) : null;
  return ctrl.streak
    ? null
    : h('div.puzzle__side__theme', [
        h('a', { attrs: { href: `/training/${t.isOpening ? 'openings' : 'themes'}` } }, h('h2', ['« ', t.name])),
        h('p', [
          t.desc,
          t.chapter &&
            h(
              'a.puzzle__side__theme__chapter.text',
              {
                attrs: {
                  href: `${studyUrl}/${t.chapter}`,
                  target: '_blank',
                  rel: 'noopener',
                },
              },
              [' ', ctrl.trans.noarg('example')]
            ),
        ]),
        showEditor ? h('div.puzzle__themes', editor(ctrl)) : null,
      ]);
}

const invisibleThemes = new Set(['master', 'masterVsMaster', 'superGM']);

const editor = (ctrl: Controller): VNode[] => {
  const data = ctrl.getData(),
    trans = ctrl.trans.noarg,
    votedThemes = ctrl.vm.round?.themes || {};
  const visibleThemes: string[] = data.puzzle.themes
    .filter(t => !invisibleThemes.has(t))
    .concat(Object.keys(votedThemes).filter(t => votedThemes[t] && !data.puzzle.themes.includes(t)))
    .sort();
  const allThemes = location.pathname == '/training/daily' ? null : ctrl.allThemes;
  const availableThemes = allThemes ? allThemes.dynamic.filter(t => !votedThemes[t]) : null;
  if (availableThemes) availableThemes.sort((a, b) => (trans(a) < trans(b) ? -1 : 1));
  return [
    h(
      'div.puzzle__themes_list',
      {
        hook: bind('click', e => {
          const target = e.target as HTMLElement;
          const theme = target.getAttribute('data-theme');
          if (theme) ctrl.voteTheme(theme, target.classList.contains('vote-up'));
        }),
      },
      visibleThemes.map(key =>
        h(
          'div.puzzle__themes__list__entry',
          {
            class: {
              strike: votedThemes[key] === false,
            },
          },
          [
            h(
              'a',
              {
                attrs: {
                  href: `/training/${key}`,
                  title: trans(`${key}Description`),
                },
              },
              trans(key)
            ),
            !allThemes
              ? null
              : h(
                  'div.puzzle__themes__votes',
                  allThemes.static.has(key)
                    ? [
                        h(
                          'div.puzzle__themes__lock',
                          h('i', {
                            attrs: dataIcon(''),
                          })
                        ),
                      ]
                    : [
                        h('span.puzzle__themes__vote.vote-up', {
                          class: { active: votedThemes[key] },
                          attrs: { 'data-theme': key },
                        }),
                        h('span.puzzle__themes__vote.vote-down', {
                          class: { active: votedThemes[key] === false },
                          attrs: { 'data-theme': key },
                        }),
                      ]
                ),
          ]
        )
      )
    ),
    ...(availableThemes
      ? [
          h(
            `select.puzzle__themes__selector.cache-bust-${availableThemes.length}`,
            {
              hook: {
                ...bind('change', e => {
                  const theme = (e.target as HTMLInputElement).value;
                  if (theme) ctrl.voteTheme(theme, true);
                }),
                postpatch(_, vnode) {
                  (vnode.elm as HTMLSelectElement).value = '';
                },
              },
            },
            [
              h(
                'option',
                {
                  attrs: { value: '', selected: true },
                },
                trans('addAnotherTheme')
              ),
              ...availableThemes.map(theme =>
                h(
                  'option',
                  {
                    attrs: {
                      value: theme,
                      title: trans(`${theme}Description`),
                    },
                  },
                  trans(theme)
                )
              ),
            ]
          ),
          h(
            'a.puzzle__themes__study.text',
            {
              attrs: {
                'data-icon': '',
                href: studyUrl,
                target: '_blank',
                rel: 'noopener',
              },
            },
            'About puzzle themes'
          ),
        ]
      : []),
  ];
};
