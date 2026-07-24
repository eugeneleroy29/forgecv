import { getPortfolioTheme } from "./portfolioThemes";
import AuroraTemplate from "./templates/AuroraTemplate";
import MedicalVaTemplate from "./templates/MedicalVaTemplate";
import SocialMediaTemplate from "./templates/SocialMediaTemplate";
import ContentWriterTemplate from "./templates/ContentWriterTemplate";
import EcommerceTemplate from "./templates/EcommerceTemplate";
import CustomerServiceTemplate from "./templates/CustomerServiceTemplate";
import BookkeepingTemplate from "./templates/BookkeepingTemplate";
import GraphicDesignTemplate from "./templates/GraphicDesignTemplate";
import DataEntryTemplate from "./templates/DataEntryTemplate";
import BasicTemplate from "./templates/BasicTemplate";

const TEMPLATE_COMPONENTS = {
  aurora: AuroraTemplate,
  medical_va: MedicalVaTemplate,
  social_media_manager: SocialMediaTemplate,
  content_writer: ContentWriterTemplate,
  ecommerce: EcommerceTemplate,
  customer_service: CustomerServiceTemplate,
  bookkeeping: BookkeepingTemplate,
  graphic_design: GraphicDesignTemplate,
  data_entry: DataEntryTemplate,
  basic: BasicTemplate,
};

export default function PublicPortfolio({ portfolio = {} }) {
  const templateKey = portfolio?.template || portfolio?.content?.template || "basic";
  const content = portfolio?.content || portfolio || {};
  const theme = getPortfolioTheme(templateKey);

  const SelectedTemplate = TEMPLATE_COMPONENTS[templateKey] || TEMPLATE_COMPONENTS.basic;

  return <SelectedTemplate content={content} theme={theme} />;
}