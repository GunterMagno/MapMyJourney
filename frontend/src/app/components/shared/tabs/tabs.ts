import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  content?: string;
}

/**
 * Tabs component.
 * Features:
 * - Simple show/hide logic with @if/@for blocks
 * - Click event binding to switch tabs
 * - FASE 1: DOM Manipulation and Events
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss'
})
export class TabsComponent implements OnInit {
  @Input() tabs: TabItem[] = [];
  
  activeTabId: string = '';

  ngOnInit(): void {
    // Set first tab as active by default
    if (this.tabs.length > 0) {
      this.activeTabId = this.tabs[0].id;
    }
  }

  /**
   * FASE 1: Event Binding - Select tab on click
   */
  selectTab(tabId: string): void {
    this.activeTabId = tabId;
  }

  /**
   * Checks if tab is currently active.
   */
  isTabActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }

  /**
   * Gets the active tab object.
   */
  getActiveTab(): TabItem | undefined {
    return this.tabs.find(tab => tab.id === this.activeTabId);
  }
}
