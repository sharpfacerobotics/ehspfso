(function () {
  'use strict';

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (typeof text === 'string') {
      element.textContent = text;
    }
    return element;
  }

  function createMemberImage(member, team) {
    const imageWrap = createElement('div', 'bio-img');

    if (member.image) {
      const image = document.createElement('img');
      image.src = member.image;
      image.alt = member.name;
      image.loading = 'lazy';
      image.decoding = 'async';
      imageWrap.appendChild(image);
      return imageWrap;
    }

    const placeholder = createElement(
      'div',
      'bio-img-placeholder ' + team.id,
      team.monogram
    );
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', team.name + ' default icon');
    imageWrap.appendChild(placeholder);
    return imageWrap;
  }

  function createDetail(label, value) {
    const detail = createElement('div', 'bio-detail-item');
    detail.appendChild(createElement('span', 'bio-detail-label', label));
    detail.appendChild(document.createTextNode(value));
    return detail;
  }

  function createMemberCard(member, team) {
    const card = createElement('article', 'bio-card reveal');
    card.appendChild(createMemberImage(member, team));

    const content = createElement('div', 'bio-content');
    content.appendChild(createElement('h4', 'bio-name', member.name));

    const roles = createElement('div', 'bio-roles');
    member.roles.forEach(role => {
      roles.appendChild(createElement('span', 'role-badge ' + role.type, role.label));
    });
    content.appendChild(roles);

    if (member.grade || member.favorite) {
      const details = createElement('div', 'bio-details');
      if (member.grade) {
        details.appendChild(createDetail('Grade', member.grade));
      }
      if (member.favorite) {
        details.appendChild(createDetail('Favorite Part', member.favorite));
      }
      content.appendChild(details);
    }

    card.appendChild(content);
    return card;
  }

  function createRoleSection(role, members, team, roleLabels) {
    const section = createElement('section', 'role-section');
    section.dataset.role = role;

    const header = createElement('div', 'role-header');
    header.appendChild(createElement('h3', 'role-header-title', roleLabels[role].title));
    header.appendChild(createElement(
      'div',
      'role-header-badge ' + role,
      roleLabels[role].subtitle
    ));
    section.appendChild(header);

    const grid = createElement('div', 'bio-grid');
    members.forEach(member => grid.appendChild(createMemberCard(member, team)));
    section.appendChild(grid);
    return section;
  }

  function createTeamPanel(team, roster, isActive) {
    const panel = createElement('div', 'team-bio-panel');
    panel.id = 'panel-' + team.id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', 'tab-' + team.id);
    panel.tabIndex = 0;
    panel.hidden = !isActive;

    const heading = createElement('div', 'team-panel-heading');
    heading.appendChild(createElement('div', 's-tag', team.members.length + ' Student Members'));
    heading.appendChild(createElement('h2', 'team-panel-title', team.name));
    panel.appendChild(heading);

    const studentSections = createElement('div', 'students-section');
    roster.roleOrder.forEach(role => {
      const members = team.members.filter(member => member.section === role);
      if (members.length) {
        studentSections.appendChild(
          createRoleSection(role, members, team, roster.roleLabels)
        );
      }
    });
    panel.appendChild(studentSections);
    return panel;
  }

  function activateTeamTab(teamId, focusTab) {
    const root = document.getElementById('team-bios-root');
    if (!root) {
      return;
    }

    root.querySelectorAll('[role="tab"]').forEach(tab => {
      const active = tab.dataset.team === teamId;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) {
        tab.focus();
      }
    });

    root.querySelectorAll('[role="tabpanel"]').forEach(panel => {
      panel.hidden = panel.id !== 'panel-' + teamId;
    });

    if (typeof window.refreshRevealObserver === 'function') {
      window.refreshRevealObserver();
    }
  }

  function bindTabKeyboardNavigation(tabList) {
    tabList.addEventListener('keydown', event => {
      const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
      const currentIndex = tabs.indexOf(document.activeElement);
      if (currentIndex < 0) {
        return;
      }

      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activateTeamTab(tabs[nextIndex].dataset.team, true);
    });
  }

  function renderTeamBios() {
    const root = document.getElementById('team-bios-root');
    const roster = window.EHS_ROSTER;
    if (!root || !roster || !Array.isArray(roster.teams)) {
      return;
    }

    root.replaceChildren();

    const tabList = createElement('div', 'team-tabs');
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'Emerald High School robotics teams');

    const panels = createElement('div', 'team-bio-panels');
    roster.teams.forEach((team, index) => {
      const isActive = index === 0;
      const tab = createElement('button', 'team-tab' + (isActive ? ' active' : ''), team.name);
      tab.type = 'button';
      tab.id = 'tab-' + team.id;
      tab.dataset.team = team.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'panel-' + team.id);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.tabIndex = isActive ? 0 : -1;
      tab.addEventListener('click', () => activateTeamTab(team.id, false));
      tabList.appendChild(tab);

      panels.appendChild(createTeamPanel(team, roster, isActive));
    });

    bindTabKeyboardNavigation(tabList);
    root.appendChild(tabList);
    root.appendChild(panels);
  }

  window.activateTeamTab = activateTeamTab;
  window.renderTeamBios = renderTeamBios;
})();
