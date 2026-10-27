import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getResolvedRoute } from "@/data/queries";
import { validateInquiry } from "@/lib/whatsapp";
import { routes } from "@/data/routes";
import { cityHubContents } from "@/data/city-hubs";
import { readFileSync, writeFileSync } from "node:fs";
const state = vi.hoisted(() => ({ route: {} as ReturnType<typeof getResolvedRoute> }));
vi.mock("@/components/inquiry", () => ({ useInquiry: () => ({route: state.route,travelDate:"",phone:"",passengers:1,errors:{},setTravelDate:vi.fn(),setPhone:vi.fn(),setPassengers:vi.fn(),submit:vi.fn()}) }));
import { BookingWidget } from "@/components/BookingWidget";
import { JourneyActions } from "@/components/JourneyActions";
describe("passenger conversion boundaries",()=>{
 it("without desk exposes a usable website action and no fields/validating button",()=>{
  state.route={...getResolvedRoute("lviv-hannover")!,deskId:undefined};
  const html=renderToStaticMarkup(createElement(BookingWidget));
  expect(html).toContain("Перейти на сайт перевізника");expect(html).toContain('href="https://www.4k-koval.com/');
  expect(html).not.toMatch(/<(input|select|button|form)\b/);expect(html).not.toContain("inquiry-date");
  if(process.env.PASSENGER_MISSINGDESK_HTML){
   const actions=renderToStaticMarkup(createElement(JourneyActions,{website:"https://www.4k-koval.com/",hasDesk:false,anchorId:"inquiry-anchor",originCityId:"lviv",destinationCityId:"hannover",sourcePath:"/routes/lviv-hannover/",routeSlug:"lviv-hannover",ctaLocation:"hero",content:"lviv-hannover_hero"}));
   const css=readFileSync("out/routes/lviv-hannover/index.html","utf8").match(/<link[^>]+rel="stylesheet"[^>]*>/g)?.join("")??"";
   writeFileSync(process.env.PASSENGER_MISSINGDESK_HTML,`<!doctype html><html lang="uk"><head><meta charset="utf-8"/>${css}</head><body><main class="container-page"><h1>Перевірка стану без desk</h1>${actions}<div id="inquiry-anchor">${html}</div></main></body></html>`);
  }

 });
 it("with desk preserves one date/phone set and passengers1–8",()=>{
  state.route=getResolvedRoute("lviv-hannover");const html=renderToStaticMarkup(createElement(BookingWidget));
  expect(html.match(/id="inquiry-date"/g)).toHaveLength(1);expect(html.match(/id="inquiry-phone"/g)).toHaveLength(1);
  expect(html.match(/<form\b/g)).toHaveLength(1);expect(html).toContain('noValidate=""');expect(html).toContain('type="submit" disabled=""');expect(html).not.toMatch(/<input[^>]+name=/);
  for(let n=1;n<=8;n++)expect(html).toContain(`value="${n}"`);expect(html).not.toContain('value="9"');
 });
 it("early actions switch channel by verified desk and preserve the hero mapping",()=>{
  const props={website:"https://www.4k-koval.com/",hasDesk:false,anchorId:"inquiry-anchor",originCityId:"lviv",destinationCityId:"hannover",sourcePath:"/routes/lviv-hannover/",routeSlug:"lviv-hannover",ctaLocation:"hero" as const,content:"lviv-hannover_hero"};
  const website=renderToStaticMarkup(createElement(JourneyActions,props));expect(website).toContain('data-primary-channel="website"');expect(website).not.toContain('href="#inquiry-anchor"');expect(website).toContain('utm_content=lviv-hannover_hero');
  const whatsapp=renderToStaticMarkup(createElement(JourneyActions,{...props,hasDesk:true}));expect(whatsapp).toContain('data-primary-channel="whatsapp"');expect(whatsapp).toContain('href="#inquiry-anchor"');
 });
 it("rejects noninteger/out-of-range passengers and accepts every supported count",()=>{
  for(const passengers of [0,9,-1,1.5,NaN,Infinity])expect(validateInquiry({travelDate:"2030-12-15",phone:"+380991234567",passengers}).ok).toBe(false);
  for(let passengers=1;passengers<=8;passengers++)expect(validateInquiry({travelDate:"2030-12-15",phone:"+380991234567",passengers}).ok).toBe(true);
 });
 it("does not retain unsupported pickup/driver/bicycle/customs promises",()=>{
  const stryi=cityHubContents.find(h=>h.cityId==="stryi")!;const copy=JSON.stringify([stryi,...routes.filter(r=>r.originCityId==="stryi"||r.destinationCityId==="stryi")]);
  expect(copy).not.toMatch(/водій підтримує|висадка зазвичай|Зазвичай зустріч|Велосипед перевозиться|500 €/i);
  const guide=readFileSync("src/app/guides/perevezennya-velosypeda/page.tsx","utf8");expect(guide).toContain("https://customs.gov.ua/informatsiia-dlia-gromadian");expect(guide).not.toMatch(/500|SIS|Mercedes|HowTo|15 хв/);
 });
});
